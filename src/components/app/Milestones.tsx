import { motion } from "framer-motion";
import { Check, Lock, Medal, Sparkles } from "lucide-react";
import type { Milestone } from "@/config/businessRules";
import { cn } from "@/lib/utils";

const MEDAL: Record<Milestone["id"], { bg: string; fg: string }> = {
  first: { bg: "linear-gradient(145deg,#FF5A75,#E4002B)", fg: "#fff" },
  bronze: { bg: "linear-gradient(145deg,#E3A06B,#A8622C)", fg: "#fff" },
  silver: { bg: "linear-gradient(145deg,#E9EDF2,#9AA4B0)", fg: "#fff" },
  gold: { bg: "linear-gradient(145deg,#FFDA6B,#D99A00)", fg: "#fff" },
};

export function MilestoneMedal({ m, unlocked, size = 44 }: { m: Milestone; unlocked: boolean; size?: number }) {
  return (
    <motion.div
      layout
      className="relative flex shrink-0 items-center justify-center rounded-full"
      style={{ width: size, height: size, background: unlocked ? MEDAL[m.id].bg : "#F1F1F1" }}
      initial={false}
      animate={unlocked ? { scale: [0.8, 1.12, 1] } : { scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {unlocked ? (
        m.id === "first" ? <Sparkles className="size-[45%] text-white" /> : <Medal className="size-[48%] text-white" />
      ) : (
        <Lock className="size-[38%] text-[#B5B5B5]" />
      )}
      {unlocked && (
        <span className="absolute -bottom-0.5 -right-0.5 flex size-[18px] items-center justify-center rounded-full border-2 border-white bg-airtel-success">
          <Check className="size-2.5 text-white" strokeWidth={4} />
        </span>
      )}
    </motion.div>
  );
}

/**
 * Horizontal milestone track: 4 evenly spaced levels joined by a progress line.
 * Reached levels show their medal, the next level is outlined in black with its target,
 * future levels are muted with a lock.
 */
export function MilestoneTrack({ milestones, count, className }: { milestones: Milestone[]; count: number; className?: string }) {
  const n = milestones.length;
  // Fill: whole segments for reached levels + partial progress toward the next one.
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
      {/* line between first and last circle centres */}
      <div className="absolute top-[19px] h-[3px] rounded-full bg-[#E6E9EF]" style={{ left: `${50 / n}%`, right: `${50 / n}%` }}>
        <motion.div
          className="h-full rounded-full bg-[linear-gradient(90deg,#FC5252,#E32121)]"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        />
      </div>
      <div className="relative grid" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
        {milestones.map((m, i) => {
          const reached = count >= m.target;
          const next = i === nextIdx;
          return (
            <div key={m.id} className="flex flex-col items-center text-center">
              {reached ? (
                <MilestoneMedal m={m} unlocked size={40} />
              ) : (
                <span
                  className={cn(
                    "flex size-10 items-center justify-center rounded-full text-[13px] font-bold",
                    next ? "border-2 border-[#E32121] bg-white text-[#E32121] shadow-[0_0_0_4px_rgba(227,33,33,0.12)]" : "border border-[#E6E9EF] bg-[#F0F4F9] text-[#A0A2A4]",
                  )}
                >
                  {next ? m.target : <Lock className="size-3.5" />}
                </span>
              )}
              <span className={cn("mt-2 text-[12px] font-semibold leading-[14px]", reached || next ? "text-[#292C31]" : "text-[#696B6F]")}>
                {m.label === "First referral" ? "First" : m.label}
              </span>
              <span className="mt-0.5 text-[11px] leading-[14px] text-[#696B6F]">
                {m.target} {m.target === 1 ? "referral" : "referrals"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
