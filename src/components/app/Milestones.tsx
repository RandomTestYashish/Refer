import { motion, useReducedMotion } from "framer-motion";
import { Check, Lock } from "lucide-react";
import { TierBadge } from "@/components/app/refer/CashArt";
import type { Milestone } from "@/config/businessRules";
export type Metal = "gold" | "silver" | "bronze" | "ruby";
import { cn } from "@/lib/utils";

/** Each level is minted in its own metal; locked levels are unminted grey coins. */
export const LEVEL_METAL: Record<Milestone["id"], Metal> = { first: "ruby", bronze: "bronze", silver: "silver", gold: "gold" };

export type BadgeState = "unlocked" | "next" | "locked";

/** Coin badge for a milestone level: the 3D medal art, greyed out until it is reached. */
export function CoinBadge({ m, state, size = 44, pulse = true }: { m: Milestone; state: BadgeState; size?: number; pulse?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} aria-label={`${m.label} ${state}`}>
      {state === "next" &&
        (pulse && !reduce ? (
          <motion.span
            className="absolute inset-[-4px] rounded-full border-2 border-[#292C31]"
            animate={{ opacity: [0.9, 0.25, 0.9], scale: [1, 1.08, 1] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          />
        ) : (
          <span className="absolute inset-[-4px] rounded-full border-2 border-[#292C31]" />
        ))}
      <TierBadge m={m} className={cn("size-full select-none drop-shadow-[0_2px_3px_rgba(0,0,0,0.22)]", state === "next" && "opacity-70 grayscale", state === "locked" && "opacity-40 grayscale")} />
      {state === "next" && (
        <span
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-[#292C31] px-1.5 font-bold leading-[14px] text-white ring-2 ring-white"
          style={{ fontSize: Math.max(9, size * 0.24) }}
        >
          {m.target}
        </span>
      )}
      {state === "locked" && (
        <span className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center rounded-full bg-[#5B6170] ring-2 ring-white" style={{ width: size * 0.38, height: size * 0.38 }}>
          <Lock className="text-white" style={{ width: size * 0.2, height: size * 0.2 }} strokeWidth={3} />
        </span>
      )}
      {state === "unlocked" && (
        <span className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center rounded-full bg-[#0F7033] ring-2 ring-white" style={{ width: size * 0.38, height: size * 0.38 }}>
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
      <div className={cn("absolute h-[3px] rounded-full", dark ? "bg-white/15" : "bg-[#E6E9EF]")} style={{ left: `${50 / n}%`, right: `${50 / n}%`, top: size / 2 - 1.5 }}>
        <motion.div
          className="h-full rounded-full bg-[linear-gradient(90deg,#A7AAB0,#3E4146)]"
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
              <span className={cn("mt-2 text-[12px] font-bold leading-[14px]", state === "locked" ? (dark ? "text-white/55" : "text-[#696B6F]") : state === "next" ? (dark ? "text-[#FFCB5C]" : "text-[#292C31]") : dark ? "text-white" : "text-[#292C31]")}>
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
