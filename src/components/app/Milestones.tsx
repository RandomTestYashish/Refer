import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import type { Milestone } from "@/config/businessRules";
import { CoinFace, type Metal } from "@/components/app/refer/CoinArt";
import { cn } from "@/lib/utils";

/** Each level is minted in its own metal; locked levels are unminted grey coins. */
export const LEVEL_METAL: Record<Milestone["id"], Metal> = { first: "ruby", bronze: "bronze", silver: "silver", gold: "gold" };

const STAR = "M50 30 l5.6 11.4 12.6 1.8 -9.1 8.9 2.1 12.5 L50 58.7 38.8 64.6 40.9 52.1 31.8 43.2 44.4 41.4 z";
const LOCK = (
  <g fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="37" y="47" width="26" height="19" rx="3.5" />
    <path d="M42 47 v-5 a8 8 0 0 1 16 0 v5" />
  </g>
);

export type BadgeState = "unlocked" | "next" | "locked";

/** Coin badge for a milestone level. */
export function CoinBadge({ m, state, size = 44, pulse = true }: { m: Milestone; state: BadgeState; size?: number; pulse?: boolean }) {
  const reduce = useReducedMotion();
  const metal: Metal = state === "unlocked" ? LEVEL_METAL[m.id] : "locked";
  const emboss = state === "unlocked" ? undefined : "#8E939B";
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} aria-label={`${m.label} ${state}`}>
      {state === "next" && pulse && !reduce && (
        <motion.span
          className="absolute inset-[-5px] rounded-full border-2 border-[#E32121]"
          animate={{ opacity: [0.9, 0.2, 0.9], scale: [1, 1.08, 1] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        />
      )}
      {state === "next" && (pulse && !reduce ? null : <span className="absolute inset-[-4px] rounded-full border-2 border-[#E32121]" />)}
      <CoinFace size={size} metal={metal} glyph={state === "unlocked" && m.id === "first" ? "₹" : null} shine={state === "unlocked"}>
        {state === "unlocked" && m.id !== "first" && <path d={STAR} fill={metal === "silver" ? "#7B8592" : metal === "bronze" ? "#7E4019" : "#A86A08"} />}
        {state === "next" && (
          <text x="50" y="52" textAnchor="middle" dominantBaseline="middle" fontFamily="Inter, sans-serif" fontWeight="800" fontSize={m.target >= 10 ? 30 : 36} fill="#E32121">
            {m.target}
          </text>
        )}
        {state === "locked" && <g stroke={emboss}>{LOCK}</g>}
      </CoinFace>
      {state === "unlocked" && (
        <span className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center rounded-full border-2 border-white bg-[#0F7033]" style={{ width: size * 0.38, height: size * 0.38 }}>
          <Check className="text-white" style={{ width: size * 0.22, height: size * 0.22 }} strokeWidth={4} />
        </span>
      )}
    </div>
  );
}

/** Back-compat wrapper used by Milestones / Dashboard / Unlocked screens. */
export function MilestoneMedal({ m, unlocked, size = 44 }: { m: Milestone; unlocked: boolean; size?: number }) {
  return (
    <motion.div initial={false} animate={unlocked ? { scale: [0.8, 1.12, 1] } : { scale: 1 }} transition={{ duration: 0.5 }}>
      <CoinBadge m={m} state={unlocked ? "unlocked" : "locked"} size={size} pulse={false} />
    </motion.div>
  );
}

/**
 * Coin stepper: four level coins on a gold line (the "streak" pattern from the Airtel rewards page).
 * Reached levels show their metal, the next level pulses, future levels stay grey.
 */
export function MilestoneTrack({
  milestones,
  count,
  className,
  size = 40,
  dark = false,
}: {
  milestones: Milestone[];
  count: number;
  className?: string;
  size?: number;
  /** Light labels for use on the dark milestone banner. */
  dark?: boolean;
}) {
  const n = milestones.length;
  let filled = 0;
  for (let i = 1; i < n; i++) {
    const prev = milestones[i - 1].target;
    const cur = milestones[i].target;
    if (count >= cur) filled = i;
    else {
      if (count >= prev) filled = i - 1 + (count - prev) / (cur - prev);
      break;
    }
  }
  const pct = (filled / (n - 1)) * 100;
  const nextIdx = milestones.findIndex((m) => count < m.target);
  return (
    <div className={cn("relative", className)}>
      <div className={cn("absolute h-[3px] rounded-full", dark ? "bg-white/15" : "bg-[#ECE6DA]")} style={{ left: `${50 / n}%`, right: `${50 / n}%`, top: size / 2 - 1.5 }}>
        <motion.div
          className="h-full rounded-full bg-[linear-gradient(90deg,#F5C64F,#D79A1E)]"
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        />
      </div>
      <div className="relative grid" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
        {milestones.map((m, i) => {
          const state: BadgeState = count >= m.target ? "unlocked" : i === nextIdx ? "next" : "locked";
          return (
            <div key={m.id} className="flex flex-col items-center text-center">
              <CoinBadge m={m} state={state} size={size} />
              <span className={cn("mt-2 text-[12px] font-bold leading-[14px]", state === "locked" ? (dark ? "text-white/55" : "text-[#696B6F]") : state === "next" ? (dark ? "text-[#FFCB5C]" : "text-[#B25E09]") : dark ? "text-white" : "text-[#292C31]")}>
                {m.label === "First referral" ? "First" : m.label}
              </span>
              <span className={cn("mt-0.5 text-[11px] leading-[14px]", dark ? "text-white/55" : "text-[#696B6F]")}>
                {m.target} {m.target === 1 ? "referral" : "referrals"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
