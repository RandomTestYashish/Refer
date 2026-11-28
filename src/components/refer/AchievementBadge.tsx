import { useEffect, useId, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { Check, Hourglass, Lock, RotateCcw } from "lucide-react";
import type { Milestone, TierId } from "@/config/businessRules";
import { Confetti } from "@/components/app/Confetti";
import { Button } from "@/components/ui/button";
import type { TierStatus } from "@/store/useProto";
import { haptic } from "@/lib/device";
import { cn, inr } from "@/lib/utils";

/* ───────────────────────── Tier art ───────────────────────── */

interface TierArt {
  shape: string; // outer silhouette (viewBox 0 0 120 132)
  inset: number; // enamel inset scale
  metal: string[]; // rim gradient stops
  enamel: [string, string];
  ink: string; // emblem colour
  emblem: "chevron1" | "chevron2" | "star" | "gem";
}

const rosette = (() => {
  const pts: string[] = [];
  const n = 16;
  for (let i = 0; i <= n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 === 0 ? 58 : 51;
    pts.push(`${(60 + Math.cos(a) * r).toFixed(2)},${(66 + Math.sin(a) * r).toFixed(2)}`);
  }
  return `M${pts.join(" L")} Z`;
})();

const ART: Record<TierId, TierArt> = {
  bronze: {
    shape: "M60 5 L109 21 C111 22 112 23 112 26 V62 C112 93 91 115 61.5 127 C60.5 127.4 59.5 127.4 58.5 127 C29 115 8 93 8 62 V26 C8 23 9 22 11 21 Z",
    inset: 0.78,
    metal: ["#FFE0BD", "#E3A066", "#9C5426", "#5E2E12", "#D98E52", "#FFD3A6"],
    enamel: ["#E2603F", "#8E2413"],
    ink: "#FFE7CF",
    emblem: "chevron1",
  },
  silver: {
    shape: "M60 4 L111 33 C113.5 34.5 114 36 114 38.5 V93.5 C114 96 113.5 97.5 111 99 L60 128 L9 99 C6.5 97.5 6 96 6 93.5 V38.5 C6 36 6.5 34.5 9 33 Z",
    inset: 0.76,
    metal: ["#FFFFFF", "#D9DFE7", "#8D98A8", "#56606E", "#C3CBD6", "#FFFFFF"],
    enamel: ["#4A7FE6", "#173486"],
    ink: "#EEF4FF",
    emblem: "chevron2",
  },
  gold: {
    shape: rosette,
    inset: 0.74,
    metal: ["#FFF6C9", "#F6CB55", "#B67A0B", "#6E4404", "#E9B23A", "#FFE9A0"],
    enamel: ["#1E9A63", "#0B4D31"],
    ink: "#FFF3C4",
    emblem: "star",
  },
  platinum: {
    shape: "M60 3 L100 22 L117 60 L104 103 L60 129 L16 103 L3 60 L20 22 Z",
    inset: 0.74,
    metal: ["#FFFFFF", "#E7E4F7", "#A9AFC4", "#626A82", "#D6DCEF", "#FFFFFF"],
    enamel: ["#33364F", "#0D0E1A"],
    ink: "#F1EEFF",
    emblem: "gem",
  },
};

function Emblem({ kind, color }: { kind: TierArt["emblem"]; color: string }) {
  const s = { fill: "none", stroke: color, strokeWidth: 7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (kind) {
    case "chevron1":
      return (
        <g>
          <path d="M42 74 L60 58 L78 74" {...s} />
          <circle cx="60" cy="88" r="4" fill={color} />
        </g>
      );
    case "chevron2":
      return (
        <g>
          <path d="M42 66 L60 50 L78 66" {...s} />
          <path d="M42 84 L60 68 L78 84" {...s} />
        </g>
      );
    case "star":
      return <path d="M60 44 L66.5 58.5 L82 60 L70.3 70.4 L73.6 86 L60 78 L46.4 86 L49.7 70.4 L38 60 L53.5 58.5 Z" fill={color} />;
    case "gem":
      return (
        <g fill="none" stroke={color} strokeWidth={3.5} strokeLinejoin="round">
          <path d="M44 58 L52 48 H68 L76 58 L60 86 Z" fill={color} fillOpacity={0.18} />
          <path d="M44 58 H76 M52 48 L57 58 L60 86 L63 58 L68 48" />
        </g>
      );
  }
}

/**
 * A collectible achievement object — metal rim, enamel field, embossed emblem, die-cut sticker edge.
 * Drawn with real thickness: the sticker and the metal plate each have a side wall below them,
 * the emblem is embossed and the badge casts a soft contact shadow, so it reads as a 3D object.
 */
export function TierBadge({ tier, status, size = 96, className }: { tier: TierId; status: TierStatus; size?: number; className?: string }) {
  const uid = useId().replace(/:/g, "");
  const a = ART[tier];
  const locked = status === "locked";
  const id = (n: string) => `${n}-${uid}`;
  const t = (1 - a.inset) / 2;
  return (
    <div className={cn("relative shrink-0", className)} style={{ width: size, height: size * (152 / 132) }}>
      <svg
        viewBox="-6 -6 132 152"
        className="size-full overflow-visible"
        style={{
          filter: locked ? "grayscale(1) contrast(0.85) brightness(1.08)" : status === "pending" ? "saturate(0.75)" : undefined,
          opacity: locked ? 0.6 : 1,
        }}
        role="img"
        aria-label={`${tier} badge, ${status}`}
      >
        <defs>
          <linearGradient id={id("metal")} x1="0" y1="0" x2="1" y2="1">
            {a.metal.map((c, i) => (
              <stop key={i} offset={i / (a.metal.length - 1)} stopColor={c} />
            ))}
          </linearGradient>
          <linearGradient id={id("rim")} x1="1" y1="0" x2="0" y2="1">
            {a.metal.map((c, i) => (
              <stop key={i} offset={i / (a.metal.length - 1)} stopColor={c} stopOpacity={0.9} />
            ))}
          </linearGradient>
          <radialGradient id={id("enamel")} cx="0.35" cy="0.3" r="0.85">
            <stop offset="0" stopColor={a.enamel[0]} />
            <stop offset="1" stopColor={a.enamel[1]} />
          </radialGradient>
          <linearGradient id={id("gloss")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          {tier === "platinum" && (
            <linearGradient id={id("iris")} x1="0" y1="0" x2="1" y2="0.6">
              <stop offset="0" stopColor="#E9DDFF" stopOpacity="0.55" />
              <stop offset="0.5" stopColor="#CDEBFF" stopOpacity="0.15" />
              <stop offset="1" stopColor="#FFDDF0" stopOpacity="0.5" />
            </linearGradient>
          )}
          <clipPath id={id("clip")}>
            <path d={a.shape} transform={`translate(${120 * t} ${132 * t}) scale(${a.inset})`} />
          </clipPath>
          <filter id={id("drop")} x="-30%" y="-30%" width="160%" height="170%">
            <feDropShadow dx="0" dy="7" stdDeviation="5.5" floodColor="#1B1D22" floodOpacity="0.2" />
          </filter>
          <filter id={id("emboss")} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="-1" stdDeviation="0.4" floodColor="#fff" floodOpacity="0.6" />
            <feDropShadow dx="0" dy="1.8" stdDeviation="0.9" floodColor="#000" floodOpacity="0.35" />
          </filter>
          <linearGradient id={id("wall")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#E9ECF1" />
            <stop offset="1" stopColor="#B9BEC8" />
          </linearGradient>
          <linearGradient id={id("side")} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={a.metal[a.metal.length - 1]} />
            <stop offset="0.5" stopColor={a.metal[0]} />
            <stop offset="1" stopColor={a.metal[a.metal.length - 1]} />
          </linearGradient>
        </defs>

        {/* contact shadow + sticker side wall (thickness) */}
        <path d={a.shape} transform="translate(0 7)" fill="#C3C8D0" stroke="#C3C8D0" strokeWidth={12} strokeLinejoin="round" filter={`url(#${id("drop")})`} />
        {[6, 4.5, 3, 1.5].map((k) => (
          <path key={k} d={a.shape} transform={`translate(0 ${k})`} fill={`url(#${id("wall")})`} stroke={`url(#${id("wall")})`} strokeWidth={12} strokeLinejoin="round" />
        ))}
        {/* sticker die-cut edge (top face) */}
        <path d={a.shape} fill="#fff" stroke="#fff" strokeWidth={12} strokeLinejoin="round" />
        {/* metal plate side wall */}
        {[4, 3, 2, 1].map((k) => (
          <path key={`m${k}`} d={a.shape} transform={`translate(0 ${k})`} fill={`url(#${id("side")})`} />
        ))}
        <path d={a.shape} transform="translate(0 4)" fill="#000" fillOpacity={0.22} />
        {/* metal body + bevel */}
        <path d={a.shape} fill={`url(#${id("metal")})`} />
        <path d={a.shape} transform="translate(4.2 4.6) scale(0.93)" fill={`url(#${id("rim")})`} />
        {/* enamel field */}
        <path d={a.shape} transform={`translate(${120 * t} ${132 * t}) scale(${a.inset})`} fill={`url(#${id("enamel")})`} stroke="rgba(0,0,0,0.25)" strokeWidth={1.5} />
        <g clipPath={`url(#${id("clip")})`}>
          {tier === "platinum" && (
            <g stroke="#fff" strokeOpacity="0.09" strokeWidth="1.2">
              {Array.from({ length: 9 }, (_, i) => (
                <path key={i} d={`M60 66 L${60 + Math.cos(i * 0.7) * 90} ${66 + Math.sin(i * 0.7) * 90}`} />
              ))}
            </g>
          )}
          <g filter={`url(#${id("emboss")})`}>
            <Emblem kind={a.emblem} color={a.ink} />
          </g>
          <ellipse cx="44" cy="30" rx="58" ry="30" fill={`url(#${id("gloss")})`} transform="rotate(-18 44 30)" />
          {tier === "platinum" && <rect x="0" y="0" width="120" height="132" fill={`url(#${id("iris")})`} />}
        </g>
        {/* rim highlight */}
        <path d={a.shape} fill="none" stroke="#fff" strokeOpacity="0.65" strokeWidth={1.4} />
      </svg>
      {locked && (
        <span className="absolute bottom-[4%] right-[4%] flex size-[28%] items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
          <Lock className="size-[48%] text-gen4-black-500" strokeWidth={2.2} />
        </span>
      )}
      {status === "earned" && (
        <span className="absolute bottom-[4%] right-[4%] flex size-[28%] items-center justify-center rounded-full border-2 border-white bg-airtel-success shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
          <Check className="size-[52%] text-white" strokeWidth={3.5} />
        </span>
      )}
      {status === "pending" && (
        <span className="absolute bottom-[4%] right-[4%] flex size-[28%] items-center justify-center rounded-full border-2 border-white bg-airtel-warning shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
          <Hourglass className="size-[48%] text-white" strokeWidth={2.6} />
        </span>
      )}
    </div>
  );
}

/* ───────────────────────── Flip card ───────────────────────── */

const STATUS_COPY: Record<TierStatus, { label: string; cls: string }> = {
  earned: { label: "Earned", cls: "border-airtel-success-line bg-airtel-success-soft text-airtel-success" }, // Info Tag · Success
  pending: { label: "In progress", cls: "border-airtel-warning-line bg-airtel-warning-soft text-airtel-warning-text" }, // Info Tag · Warning
  locked: { label: "Locked", cls: "border-gen4-bg-400 bg-gen4-bg-100 text-refer-ink" }, // Info Tag · Default
};

export function rewardLabel(m: Milestone) {
  return m.reward == null ? "Reward to be announced" : `${inr(m.reward)} reward`;
}

/**
 * Tap → tactile press, 3D flip, and the reverse explains status, reward, requirement and what's next.
 */
export function BadgeFlipCard({
  m,
  next,
  status,
  count,
  inProgress,
  monthName,
  isTop,
}: {
  m: Milestone;
  next?: Milestone;
  status: TierStatus;
  count: number;
  inProgress: number;
  monthName: string;
  isTop: boolean;
}) {
  const [flipped, setFlipped] = useState(false);
  const [burst, setBurst] = useState(0);
  const reduce = useReducedMotion();
  const rot = useMotionValue(0);
  // Gen4 Shadow-Level2 (Default) at rest; it lifts a little mid-flip.
  const shadow = useTransform(rot, (r) => { const k = Math.abs(Math.sin((r * Math.PI) / 180)); return `0 ${5 + k * 7}px ${5.62 + k * 10}px rgba(180,180,180,${0.2 + k * 0.15})`; });

  useEffect(() => {
    const c = animate(rot, flipped ? 180 : 0, reduce ? { duration: 0 } : { type: "spring", stiffness: 190, damping: 21 });
    return () => c.stop();
  }, [flipped, rot, reduce]);

  const remaining = Math.max(0, m.target - count);
  const pct = Math.min(1, count / m.target);
  const s = STATUS_COPY[status];

  const toggle = () => {
    haptic(status === "earned" ? [6, 40, 10] : 8);
    if (!flipped && status === "earned") setBurst((b) => b + 1);
    setFlipped((f) => !f);
  };

  const explain =
    status === "earned"
      ? `You earned ${m.label} in ${monthName}.`
      : status === "pending"
        ? `${inProgress} ${inProgress === 1 ? "friend is" : "friends are"} on the way. You'll earn ${m.label} when their first recharge qualifies.`
        : `${remaining} more successful ${remaining === 1 ? "referral" : "referrals"} to unlock.`;

  return (
    <div className="relative h-[206px]" style={{ perspective: 900 }}>
      <motion.button
        type="button"
        onClick={toggle}
        aria-pressed={flipped}
        aria-label={`${m.label} badge, ${s.label}. ${flipped ? "Showing details." : "Activate for details."}`}
        data-testid={`badge-${m.id}`}
        data-status={status}
        data-side={flipped ? "back" : "front"}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 500, damping: 26 }}
        className="relative size-full rounded-[16px] text-left outline-none focus-visible:ring-4 focus-visible:ring-[#075EE8]/40"
        style={{ rotateY: rot, transformStyle: "preserve-3d", boxShadow: shadow }}
      >
        {/* front */}
        <div
          className={cn(
            "absolute inset-0 flex flex-col items-center rounded-[16px] border border-refer-line bg-gradient-to-b from-white to-[#F5F5F5] px-3 pb-3 pt-3.5 [backface-visibility:hidden]",
          )}
          aria-hidden={flipped}
        >
          <TierBadge tier={m.id} status={status} size={84} />
          <p className="mt-2 text-[16px] font-bold leading-[18px] text-refer-ink">{m.label}</p>
          <p className="mt-0.5 text-[12px] leading-[18px] text-refer-muted tabular">
            {m.target} {m.target === 1 ? "referral" : "referrals"}
          </p>
          <span className={cn("mt-auto flex h-5 items-center rounded-[20px] border px-2 text-[11px] font-bold italic leading-[14px]", s.cls)}>{s.label}</span>
        </div>

        {/* back */}
        <div
          className="absolute inset-0 flex flex-col rounded-[16px] border border-refer-line bg-gradient-to-b from-white to-[#F5F5F5] p-3 [backface-visibility:hidden]"
          style={{ transform: "rotateY(180deg)" }}
          aria-hidden={!flipped}
        >
          <div className="flex items-center gap-2">
            <TierBadge tier={m.id} status={status} size={30} />
            <div className="min-w-0">
              <p className="text-[13.5px] font-bold leading-[17px] text-airtel-ink">{m.label}</p>
              <p className={cn("text-[10.5px] font-bold uppercase tracking-[0.06em]", status === "earned" ? "text-airtel-success" : status === "pending" ? "text-airtel-warning-text" : "text-airtel-sub")}>
                {s.label}
              </p>
            </div>
          </div>
          <p className="mt-2 text-[13px] font-bold text-refer-accent">{rewardLabel(m)}</p>
          <p className="mt-0.5 text-[12px] leading-[16px] text-refer-muted">{explain}</p>
          <div className="mt-auto">
            <div className="flex justify-between text-[10.5px] font-semibold text-airtel-sub tabular">
              <span>This month</span>
              <span>
                {Math.min(count, m.target)}/{m.target}
              </span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#EEF0F3]">
              <div className={cn("h-full rounded-full", status === "earned" ? "bg-airtel-success" : "bg-refer-accent")} style={{ width: `${pct * 100}%` }} />
            </div>
            <p className="mt-1.5 flex items-center gap-1 text-[10.5px] leading-[13px] text-airtel-ink">
              <RotateCcw className="size-3 shrink-0 text-airtel-sub" />
              {isTop ? "Highest tier you can reach this month" : next ? `Next: ${next.label} at ${next.target}` : ""}
            </p>
          </div>
        </div>
      </motion.button>
      <AnimatePresence>{burst > 0 && flipped && <Confetti key={burst} count={14} originY="30%" />}</AnimatePresence>
    </div>
  );
}

/* ───────────────────────── Unlock celebration ───────────────────────── */

/** Shown once per newly earned tier: the badge spins in, a short burst, then a clear next step. */
export function UnlockCelebration({ m, onDone, onView }: { m: Milestone | null; onDone: () => void; onView: () => void }) {
  const reduce = useReducedMotion();
  useEffect(() => {
    if (m) haptic([10, 60, 18]);
  }, [m]);
  return (
    <AnimatePresence>
      {m && (
        <motion.div
          key={m.id}
          className="absolute inset-0 z-[60] flex items-center justify-center bg-black/45 px-6 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="unlock-title"
          data-testid="unlock-celebration"
        >
          <motion.div
            initial={{ y: 30, scale: 0.94, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="relative w-full overflow-hidden rounded-[24px] bg-white px-6 pb-6 pt-8 text-center shadow-g4-5"
          >
            <Confetti originY="28%" />
            <motion.div
              className="mx-auto w-fit"
              style={{ perspective: 600 }}
              initial={reduce ? false : { rotateY: -540, scale: 0.4 }}
              animate={{ rotateY: 0, scale: 1 }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <TierBadge tier={m.id} status="earned" size={120} />
            </motion.div>
            <p className="mt-4 text-[11px] font-bold uppercase leading-[14px] tracking-[1.76px] text-refer-accent">Achievement unlocked</p>
            <h2 id="unlock-title" className="mt-1 text-[24px] font-bold leading-[32px] text-refer-ink">
              {m.label} badge earned
            </h2>
            <p className="mt-1.5 text-[14px] leading-[20px] text-airtel-sub">
              {m.reward != null ? `${rewardLabel(m)} for reaching ${m.label} this month.` : `You reached ${m.target} successful referrals this month.`}
            </p>
            <div className="mt-5 space-y-2">
              <Button block size="lg" onClick={onView}>
                See my badges
              </Button>
              <Button block variant="ghost" onClick={onDone}>
                Close
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
