import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { animate, motion, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { ChevronDown, Mail, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePullGesture, type PullPhase } from "./usePullGesture";

/**
 * Pull · Aim · Invite — presentation.
 * An invitation tile hangs from a fixed mount on an elastic cord. Pull it down, aim it at
 * the contacts target and release to invite. Physics live in `usePullGesture`.
 */

const MOUNT_Y = 14; // centre of the mount pin
const CORD = 64; // resting cord length
const TILE = 84; // invitation tile size

const COPY: Record<PullPhase | "offAim" | "taught", string> = {
  idle: "Pull down to invite",
  pulling: "Keep pulling towards your contacts",
  offAim: "Aim at your contacts",
  armed: "Release to choose contacts",
  launching: "Opening your contacts…",
  cancelled: "Pull a little further to invite",
  taught: "Drag the invite down to your contacts",
};

export function PullToInvite({ onInvite, className }: { onInvite: (via: "gesture" | "keyboard") => void; className?: string }) {
  const reduced = !!useReducedMotion();
  const areaRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 343, targetY: 200, dockHalf: 116 });
  const [taught, setTaught] = useState(false);

  // Measure the area so the geometry adapts to any screen size.
  useLayoutEffect(() => {
    const area = areaRef.current;
    const dock = dockRef.current;
    if (!area || !dock) return;
    const measure = () => {
      const restCentre = MOUNT_Y + CORD + TILE / 2;
      const dockCentre = dock.offsetTop + dock.offsetHeight / 2;
      setBox({ w: area.offsetWidth, targetY: Math.max(120, dockCentre - restCentre), dockHalf: dock.offsetWidth / 2 });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(area);
    return () => ro.disconnect();
  }, []);

  const threshold = Math.round(Math.min(150, box.targetY * 0.62));
  const g = usePullGesture({
    geometry: { threshold, aimTolerance: box.dockHalf - 24, targetY: box.targetY },
    reducedMotion: reduced,
    onTrigger: onInvite,
    onTap: () => {
      setTaught(true);
      if (!reduced) animate(g.y, [0, 22, 0], { duration: 0.7, ease: [0.32, 0.72, 0, 1] });
    },
  });
  const { x, y, phase, progress, offAim } = g;

  // One gentle nudge after landing so the tile reads as "pullable".
  useEffect(() => {
    if (reduced) return;
    const t = setTimeout(() => {
      if (y.get() === 0) animate(y, [0, 16, 0], { duration: 0.9, ease: [0.32, 0.72, 0, 1] });
    }, 1100);
    return () => clearTimeout(t);
  }, [reduced, y]);

  useEffect(() => {
    if (phase !== "idle") setTaught(false);
  }, [phase]);

  // Cord: a lagging spring bows the line while the tile moves, then it settles straight.
  const lagX = useSpring(x, { stiffness: 260, damping: 16 });
  const lagY = useSpring(y, { stiffness: 260, damping: 16 });
  const cx = box.w / 2;
  const cord = useTransform([x, y, lagX, lagY], ([vx, vy, lx, ly]: number[]) => {
    const ax = cx;
    const ay = MOUNT_Y;
    const ex = cx + vx;
    const ey = MOUNT_Y + CORD + vy + 4; // attach a little inside the tile top
    const qx = (ax + ex) / 2 + (lx - vx) * 0.9;
    const qy = (ay + ey) / 2 + (ly - vy) * 0.45;
    return `M ${ax} ${ay} Q ${qx} ${qy} ${ex} ${ey}`;
  });
  // The cord thins as it stretches, like real elastic.
  const cordWidth = useTransform(y, [0, 220], [3, 1.4], { clamp: true });
  const rotate = useTransform(x, [-110, 110], [-9, 9]);
  const hintOpacity = useTransform(y, [0, 30], [1, 0]);
  const guideOpacity = useTransform(progress, [0, 0.15, 1], [0, 0.35, 0.8]);
  const aimLine = useTransform([x, y], ([vx, vy]: number[]) => {
    const sx = cx + vx;
    const sy = MOUNT_Y + CORD + TILE + vy + 6;
    const ty = MOUNT_Y + CORD + TILE / 2 + box.targetY - 34;
    return `M ${sx} ${sy} L ${cx} ${Math.max(sy, ty)}`;
  });

  const armed = phase === "armed" || phase === "launching";
  const engaged = phase === "pulling" || armed;
  const label = taught && phase === "idle" ? COPY.taught : offAim && phase === "pulling" ? COPY.offAim : COPY[phase];

  return (
    <div ref={areaRef} className={cn("relative select-none", className)} data-testid="pull-area" data-phase={phase}>
      <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        <motion.path d={aimLine} stroke="#8E9AA9" strokeWidth={1.5} strokeDasharray="2 6" strokeLinecap="round" fill="none" style={{ opacity: guideOpacity }} />
        <motion.path
          d={cord}
          fill="none"
          strokeLinecap="round"
          className={cn("transition-[stroke] duration-200", armed ? "stroke-[hsl(var(--invite))]" : "stroke-airtel-ink")}
          style={{ strokeWidth: cordWidth }}
        />
      </svg>

      {/* Mount */}
      <span aria-hidden className="absolute left-1/2 top-[6px] h-4 w-10 -translate-x-1/2 rounded-full bg-white shadow-[0_0_0_1px_#E6E9EF,0_1px_2px_rgba(0,0,0,0.06)]">
        <span className="absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-airtel-ink" />
      </span>

      {/* Invitation tile — the draggable handle */}
      <motion.button
        type="button"
        {...g.bind}
        data-testid="pull-handle"
        aria-label="Invite friends"
        aria-describedby="pull-hint"
        className={cn(
          "absolute left-1/2 z-10 -ml-[42px] flex touch-none cursor-grab items-center justify-center rounded-[26px] border outline-none transition-[background-color,border-color,box-shadow,color] duration-200 active:cursor-grabbing",
          "focus-visible:ring-4 focus-visible:ring-[hsl(var(--invite)/0.35)]",
          armed
            ? "border-transparent bg-[hsl(var(--invite))] text-white shadow-[0_14px_30px_hsl(var(--invite)/0.28)]"
            : engaged
              ? "border-airtel-line bg-white text-airtel-ink shadow-[0_16px_32px_rgba(41,44,49,0.16)]"
              : "border-airtel-line bg-white text-airtel-ink shadow-[0_6px_18px_rgba(41,44,49,0.10)]",
        )}
        style={{ top: MOUNT_Y + CORD, width: TILE, height: TILE, x, y, rotate }}
        animate={{ scale: phase === "launching" ? 0.5 : engaged ? 1.05 : 1, opacity: phase === "launching" ? 0 : 1 }}
        transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 26, opacity: { delay: 0.15, duration: 0.2 } }}
      >
        <Mail className="size-8" strokeWidth={1.75} />
      </motion.button>

      <motion.span
        aria-hidden
        style={{ opacity: hintOpacity, top: MOUNT_Y + CORD + TILE + 8 }}
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-gen4-bg-400"
      >
        <motion.span className="block" animate={reduced ? undefined : { y: [0, 4, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}>
          <ChevronDown className="size-5" />
        </motion.span>
      </motion.span>

      {/* Instruction — announced politely as the state changes */}
      <p
        id="pull-hint"
        aria-live="polite"
        data-testid="pull-label"
        className={cn(
          "absolute inset-x-0 text-center text-[15px] font-semibold tracking-[-0.01em] transition-colors duration-200",
          armed ? "text-[hsl(var(--invite))]" : phase === "cancelled" ? "text-airtel-sub" : "text-airtel-ink",
        )}
        style={{ bottom: 0 }}
      >
        {label}
        <span className="sr-only">. Or press Enter to choose contacts.</span>
      </p>

      {/* Contacts target */}
      <motion.div
        ref={dockRef}
        data-testid="pull-target"
        aria-hidden
        className={cn(
          "absolute bottom-9 left-1/2 -ml-[116px] flex h-[68px] w-[232px] items-center gap-3 rounded-[22px] border px-3.5 transition-colors duration-200",
          armed
            ? "border-[hsl(var(--invite))] bg-[hsl(var(--invite)/0.07)]"
            : engaged
              ? "border-gen4-bg-200 bg-white"
              : "border-dashed border-gen4-bg-200 bg-white/60",
        )}
        animate={{ scale: armed && !reduced ? 1.04 : 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 22 }}
      >
        <span className="flex -space-x-2.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={cn(
                "flex size-9 items-center justify-center rounded-full ring-2 ring-white transition-colors duration-200",
                armed ? "bg-[hsl(var(--invite)/0.14)] text-[hsl(var(--invite))]" : "bg-airtel-surface text-gen4-bg-400",
              )}
            >
              <User className="size-[18px]" strokeWidth={2} />
            </span>
          ))}
        </span>
        <span className="min-w-0 whitespace-nowrap leading-tight">
          <span className="block text-[14px] font-semibold text-airtel-ink">Your contacts</span>
          <span className={cn("block text-[12px]", armed ? "text-[hsl(var(--invite))]" : "text-airtel-sub")}>
            {armed ? "Let go to open" : "Drop the invite here"}
          </span>
        </span>
      </motion.div>
    </div>
  );
}
