import { motion } from "framer-motion";
import type { Milestone } from "@/config/businessRules";
import { TierBadge } from "@/components/refer/AchievementBadge";
import { cn } from "@/lib/utils";

/** Compact achievement badge used in tracks and lists (same art as the collectible badges). */
export function MilestoneMedal({ m, unlocked, size = 44 }: { m: Milestone; unlocked: boolean; size?: number }) {
  return (
    <motion.div layout className="relative flex shrink-0 items-center justify-center" style={{ width: size, height: size }} initial={false} animate={unlocked ? { scale: [0.85, 1.1, 1] } : { scale: 1 }} transition={{ duration: 0.5 }}>
      <TierBadge tier={m.id} status={unlocked ? "earned" : "locked"} size={size * 0.9} />
    </motion.div>
  );
}

/** Horizontal milestone track with animated fill. */
export function MilestoneTrack({ milestones, count, className }: { milestones: Milestone[]; count: number; className?: string }) {
  const max = milestones[milestones.length - 1].target;
  // Piece-wise even spacing so early milestones are readable.
  const seg = 100 / (milestones.length - 1);
  let pct = 0;
  for (let i = 0; i < milestones.length; i++) {
    const prev = i === 0 ? 0 : milestones[i - 1].target;
    const cur = milestones[i].target;
    if (count >= cur) pct = i * seg;
    else {
      if (i > 0) pct = (i - 1) * seg + ((count - prev) / (cur - prev)) * seg;
      break;
    }
  }
  if (count >= max) pct = 100;
  return (
    <div className={cn("px-1", className)}>
      <div className="relative mx-[22px] h-1.5 rounded-full bg-[#EFEFEF]">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-airtel-red to-[#FF4D6A]"
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(0, pct)}%` }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        />
      </div>
      <div className="-mt-[25px] flex justify-between">
        {milestones.map((m) => (
          <div key={m.id} className="flex w-[56px] flex-col items-center gap-1.5">
            <MilestoneMedal m={m} unlocked={count >= m.target} />
            <span className={cn("text-[11px] font-semibold", count >= m.target ? "text-airtel-ink" : "text-airtel-sub")}>{m.label}</span>
            <span className="-mt-1 text-[10px] text-airtel-sub tabular">{m.target}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
