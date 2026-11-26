import { useCallback, useEffect, useRef, useState } from "react";
import { animate, useMotionValue, type MotionValue } from "framer-motion";
import { haptic } from "@/lib/share";

/**
 * Interaction logic for the Pull · Aim · Invite gesture — no presentation lives here.
 *
 * Slingshot model: the invite card is pulled DOWN against rubber-band resistance and moved
 * sideways to aim. Releasing past the threshold launches it towards the aimed target;
 * anything else springs back to rest.
 */

export type PullPhase =
  | "idle" // at rest
  | "pulling" // finger down, not yet armed
  | "armed" // threshold reached with a target — releasing will launch
  | "launching" // released while armed; card travels to the target
  | "cancelled"; // released early (or Esc / pointer cancel) — springing back

export interface PullGeometry {
  /** Pull distance (after resistance) needed to arm, px. */
  threshold: number;
  /** Furthest the card can be pulled down, px. */
  maxPull: number;
}

interface Options {
  geometry: PullGeometry;
  reducedMotion: boolean;
  disabled?: boolean;
  /** Called on every move so the view can update its aim; return false if nothing is aimed at. */
  onAim: (x: number, y: number) => boolean;
  /** Offset (from rest) the card flies to when launched. */
  launchTo: () => { x: number; y: number };
  onTrigger: (via: "gesture" | "keyboard") => void;
  /** Pointer pressed and released without dragging — used to teach the gesture. */
  onTap?: () => void;
}

/** Rubber-band resistance: linear at first, asymptotically approaching `limit`. */
export const rubber = (raw: number, limit: number) => Math.sign(raw) * limit * (1 - Math.exp(-Math.abs(raw) / limit));
const inverseRubber = (v: number, limit: number) => -limit * Math.log(1 - Math.min(0.98, Math.abs(v) / limit)) * Math.sign(v);

const LIMIT_UP = 16; // pushing up barely moves
const LIMIT_X = 90; // aiming sideways
const KEY_STEP = 28;

export const SNAP_SPRING = { type: "spring", stiffness: 520, damping: 19, mass: 0.9 } as const;
const LAUNCH = { type: "spring", stiffness: 260, damping: 28 } as const;

export interface PullGesture {
  x: MotionValue<number>;
  y: MotionValue<number>;
  phase: PullPhase;
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

export function usePullGesture(opts: Options): PullGesture {
  const { reducedMotion, disabled } = opts;
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const progress = useMotionValue(0);
  const [phase, setPhaseState] = useState<PullPhase>("idle");
  const phaseRef = useRef<PullPhase>("idle");
  const start = useRef<{ id: number; px: number; py: number; scale: number; moved: boolean } | null>(null);
  const o = useRef(opts);
  o.current = opts;
  const cancelTimer = useRef<ReturnType<typeof setTimeout>>();
  const prevSelect = useRef("");

  const limitY = () => o.current.geometry.maxPull * 1.15;

  const setPhase = useCallback((p: PullPhase) => {
    phaseRef.current = p;
    setPhaseState(p);
  }, []);

  const lockSelection = (on: boolean) => {
    const st = document.body.style;
    if (on) prevSelect.current = st.userSelect;
    st.userSelect = on ? "none" : prevSelect.current;
    st.webkitUserSelect = on ? "none" : prevSelect.current;
  };

  const evaluate = useCallback(() => {
    const g = o.current.geometry;
    progress.set(Math.max(0, Math.min(1, y.get() / g.threshold)));
    const aimed = o.current.onAim(x.get(), y.get());
    const armed = y.get() >= g.threshold && aimed;
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
      progress.set(1);
      const to = o.current.launchTo();
      if (reducedMotion) {
        x.set(to.x);
        y.set(to.y);
        o.current.onTrigger(via);
        return;
      }
      animate(x, to.x, LAUNCH);
      animate(y, to.y, { ...LAUNCH, onComplete: () => o.current.onTrigger(via) });
    },
    [progress, reducedMotion, setPhase, x, y],
  );

  const end = useCallback(
    (e: React.PointerEvent<HTMLElement>, cancelled: boolean) => {
      const s = start.current;
      if (!s || s.id !== e.pointerId) return;
      start.current = null;
      lockSelection(false);
      if (!cancelled && !s.moved) {
        snapBack(false);
        o.current.onTap?.();
      } else if (!cancelled && phaseRef.current === "armed") launch("gesture");
      else snapBack(y.get() > 8 || Math.abs(x.get()) > 8);
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
    progress,
    reset,
    bind: {
      onPointerDown: (e) => {
        if (busy() || (e.pointerType === "mouse" && e.button !== 0)) return;
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        x.stop();
        y.stop();
        const screen = e.currentTarget.closest<HTMLElement>("[data-phone-screen]");
        const scale = screen ? screen.getBoundingClientRect().width / screen.offsetWidth || 1 : 1; // phone frame may be CSS-scaled
        start.current = {
          id: e.pointerId,
          scale,
          moved: y.get() !== 0 || x.get() !== 0,
          // Continue from wherever the card is (e.g. grabbed mid snap-back).
          px: e.clientX - inverseRubber(x.get(), LIMIT_X) * scale,
          py: e.clientY - (y.get() >= 0 ? inverseRubber(y.get(), limitY()) : inverseRubber(y.get(), LIMIT_UP)) * scale,
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
        x.set(rubber(dx, LIMIT_X));
        y.set(dy >= 0 ? Math.min(o.current.geometry.maxPull, rubber(dy, limitY())) : rubber(dy, LIMIT_UP));
        evaluate();
      },
      onPointerUp: (e) => end(e, false),
      onPointerCancel: (e) => end(e, true),
      onLostPointerCapture: (e) => end(e, phaseRef.current !== "armed"),
      onKeyDown: (e) => {
        if (busy()) return;
        const g = o.current.geometry;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          // Keyboard users skip the physical pull: Enter / Space invites the aimed friend.
          if (o.current.onAim(x.get(), Math.max(y.get(), g.threshold))) launch("keyboard");
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          if (phaseRef.current === "idle" || phaseRef.current === "cancelled") setPhase("pulling");
          y.set(Math.min(g.maxPull, y.get() + KEY_STEP));
          evaluate();
        } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          e.preventDefault();
          if (phaseRef.current === "idle" || phaseRef.current === "cancelled") setPhase("pulling");
          x.set(Math.max(-LIMIT_X * 0.95, Math.min(LIMIT_X * 0.95, x.get() + (e.key === "ArrowLeft" ? -KEY_STEP : KEY_STEP))));
          evaluate();
        } else if ((e.key === "ArrowUp" || e.key === "Escape") && (y.get() !== 0 || x.get() !== 0)) {
          e.preventDefault();
          snapBack(e.key === "Escape");
        }
      },
    },
  };
}
