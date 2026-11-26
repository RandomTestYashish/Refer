import { useCallback, useEffect, useRef, useState } from "react";
import { animate, useMotionValue, type MotionValue } from "framer-motion";
import { haptic } from "@/lib/share";

/**
 * Interaction logic for the Pull · Aim · Invite gesture — no presentation lives here.
 *
 * The element can be pulled down (with progressive rubber-band resistance) and aimed
 * sideways. Releasing while "armed" (pulled past the threshold AND over the target)
 * triggers the invite; anything else springs back to rest.
 */

export type PullPhase =
  | "idle" // at rest
  | "pulling" // finger down, not yet armed
  | "armed" // threshold reached and on target — releasing will trigger
  | "launching" // released while armed; element travels into the target
  | "cancelled"; // released early (or Esc / pointer cancel) — springing back

export interface PullGeometry {
  /** Pull distance (after resistance) needed to arm, px. */
  threshold: number;
  /** Max horizontal offset from centre that still counts as "on target", px. */
  aimTolerance: number;
  /** Where the element lands inside the target when launched (offset from rest), px.
   *  Also the furthest the element can be pulled, so it never overshoots the target. */
  targetY: number;
}

interface Options {
  geometry: PullGeometry;
  reducedMotion: boolean;
  disabled?: boolean;
  onTrigger: (via: "gesture" | "keyboard") => void;
  /** Pointer pressed and released without dragging — used to teach the gesture. */
  onTap?: () => void;
}

/** Rubber-band resistance: linear at first, asymptotically approaching `limit`. */
export const rubber = (raw: number, limit: number) => Math.sign(raw) * limit * (1 - Math.exp(-Math.abs(raw) / limit));
const inverseRubber = (v: number, limit: number) => -limit * Math.log(1 - Math.min(0.98, Math.abs(v) / limit)) * Math.sign(v);

const PULL_LIMIT_Y = 260; // resistance asymptote when pulling down
const PULL_LIMIT_UP = 18; // pushing up barely moves
const PULL_LIMIT_X = 110; // aiming sideways
const KEY_STEP = 36;

export const SNAP_SPRING = { type: "spring", stiffness: 520, damping: 20, mass: 0.9 } as const;
const LAUNCH_SPRING = { type: "spring", stiffness: 420, damping: 30 } as const;

export interface PullGesture {
  x: MotionValue<number>;
  y: MotionValue<number>;
  phase: PullPhase;
  /** Pulled far enough but not aimed at the target. */
  offAim: boolean;
  /** 0…1 how close to the threshold the current pull is. */
  progress: MotionValue<number>;
  bind: {
    onPointerDown: (e: React.PointerEvent<HTMLElement>) => void;
    onPointerMove: (e: React.PointerEvent<HTMLElement>) => void;
    onPointerUp: (e: React.PointerEvent<HTMLElement>) => void;
    onPointerCancel: (e: React.PointerEvent<HTMLElement>) => void;
    onLostPointerCapture: (e: React.PointerEvent<HTMLElement>) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
  };
  reset: () => void;
}

export function usePullGesture({ geometry, reducedMotion, disabled, onTrigger, onTap }: Options): PullGesture {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const progress = useMotionValue(0);
  const [phase, setPhaseState] = useState<PullPhase>("idle");
  const phaseRef = useRef<PullPhase>("idle");
  const [offAim, setOffAim] = useState(false);
  const start = useRef<{ id: number; px: number; py: number; scale: number; moved: boolean } | null>(null);
  const tapRef = useRef(onTap);
  tapRef.current = onTap;
  const geo = useRef(geometry);
  geo.current = geometry;
  const triggerRef = useRef(onTrigger);
  triggerRef.current = onTrigger;
  const cancelTimer = useRef<ReturnType<typeof setTimeout>>();
  const prevSelect = useRef<string>("");

  const setPhase = useCallback((p: PullPhase) => {
    phaseRef.current = p;
    setPhaseState(p);
  }, []);

  const lockSelection = (on: boolean) => {
    const st = document.body.style;
    if (on) {
      prevSelect.current = st.userSelect;
      st.userSelect = "none";
      st.webkitUserSelect = "none";
    } else {
      st.userSelect = prevSelect.current;
      st.webkitUserSelect = prevSelect.current;
    }
  };

  const evaluate = useCallback(() => {
    const g = geo.current;
    const p = Math.max(0, Math.min(1, y.get() / g.threshold));
    progress.set(p);
    const far = y.get() >= g.threshold;
    const armed = far && Math.abs(x.get()) <= g.aimTolerance;
    setOffAim(far && !armed);
    if (armed && phaseRef.current === "pulling") {
      haptic(12);
      setPhase("armed");
    } else if (!armed && phaseRef.current === "armed") setPhase("pulling");
  }, [progress, setPhase, x, y]);

  const snapBack = useCallback(
    (showCancelled: boolean) => {
      const t = reducedMotion ? { duration: 0 } : SNAP_SPRING;
      animate(x, 0, t);
      animate(y, 0, t);
      animate(progress, 0, reducedMotion ? { duration: 0 } : { duration: 0.25 });
      clearTimeout(cancelTimer.current);
      if (showCancelled) {
        setPhase("cancelled");
        cancelTimer.current = setTimeout(() => phaseRef.current === "cancelled" && setPhase("idle"), 1800);
      } else setPhase("idle");
    },
    [progress, reducedMotion, setPhase, x, y],
  );

  const launch = useCallback(
    (via: "gesture" | "keyboard") => {
      setPhase("launching");
      haptic([8, 40, 16]);
      const g = geo.current;
      if (reducedMotion) {
        x.set(0);
        y.set(g.targetY);
        progress.set(1);
        triggerRef.current(via);
        return;
      }
      animate(x, 0, LAUNCH_SPRING);
      progress.set(1);
      animate(y, g.targetY, { ...LAUNCH_SPRING, onComplete: () => triggerRef.current(via) });
    },
    [progress, reducedMotion, setPhase, x, y],
  );

  const end = useCallback(
    (e: React.PointerEvent<HTMLElement>, cancelled: boolean) => {
      const s = start.current;
      if (!s || s.id !== e.pointerId) return;
      start.current = null;
      lockSelection(false);
      setOffAim(false);
      if (!cancelled && !s.moved) {
        snapBack(false);
        tapRef.current?.();
      } else if (!cancelled && phaseRef.current === "armed") launch("gesture");
      else snapBack(y.get() > 12 || Math.abs(x.get()) > 12);
    },
    [launch, snapBack, x, y],
  );

  // Escape cancels an in-progress drag.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && start.current) {
        start.current = null;
        lockSelection(false);
        snapBack(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(cancelTimer.current);
      if (start.current) lockSelection(false);
    };
  }, [snapBack]);

  const reset = useCallback(() => {
    start.current = null;
    setOffAim(false);
    x.set(0);
    y.set(0);
    progress.set(0);
    setPhase("idle");
  }, [progress, setPhase, x, y]);

  const busy = () => disabled || phaseRef.current === "launching";

  return {
    x,
    y,
    phase,
    offAim,
    progress,
    reset,
    bind: {
      onPointerDown: (e) => {
        if (busy() || (e.pointerType === "mouse" && e.button !== 0)) return;
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        x.stop();
        y.stop();
        // Continue from wherever the element is (e.g. grabbed mid snap-back).
        const screen = e.currentTarget.closest<HTMLElement>("[data-phone-screen]");
        const scale = screen ? screen.getBoundingClientRect().width / screen.offsetWidth || 1 : 1; // phone frame may be CSS-scaled
        start.current = {
          id: e.pointerId,
          scale,
          moved: y.get() !== 0 || x.get() !== 0,
          px: e.clientX - inverseRubber(x.get(), PULL_LIMIT_X) * scale,
          py: e.clientY - (y.get() >= 0 ? inverseRubber(y.get(), Math.min(PULL_LIMIT_Y, geo.current.targetY * 1.1)) : inverseRubber(y.get(), PULL_LIMIT_UP)) * scale,
        };
        lockSelection(true);
        clearTimeout(cancelTimer.current);
        setPhase("pulling");
        haptic(6);
        evaluate();
      },
      onPointerMove: (e) => {
        const s = start.current;
        if (!s || s.id !== e.pointerId) return;
        const dx = (e.clientX - s.px) / s.scale;
        const dy = (e.clientY - s.py) / s.scale;
        if (!s.moved && Math.hypot(dx, dy) < 6) return;
        s.moved = true;
        x.set(rubber(dx, PULL_LIMIT_X));
        const limitY = Math.min(PULL_LIMIT_Y, geo.current.targetY * 1.1);
        y.set(dy >= 0 ? Math.min(geo.current.targetY, rubber(dy, limitY)) : rubber(dy, PULL_LIMIT_UP));
        evaluate();
      },
      onPointerUp: (e) => end(e, false),
      onPointerCancel: (e) => end(e, true),
      onLostPointerCapture: (e) => end(e, phaseRef.current !== "armed"),
      onKeyDown: (e) => {
        if (busy()) return;
        const g = geo.current;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          // Keyboard users skip the physical pull: Enter / Space invites straight away.
          launch("keyboard");
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          if (phaseRef.current === "idle" || phaseRef.current === "cancelled") setPhase("pulling");
          const to = Math.min(g.threshold + 8, y.get() + KEY_STEP);
          x.set(0);
          y.set(to);
          evaluate();
        } else if (e.key === "ArrowUp" || e.key === "Escape") {
          if (y.get() > 0) {
            e.preventDefault();
            snapBack(e.key === "Escape");
          }
        }
      },
    },
  };
}
