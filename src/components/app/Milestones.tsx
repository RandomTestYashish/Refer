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
            <span className={cn("text-[11px] font-semibold", count >= m.target ? "text-airtel-ink" : "text-airtel-sub")}>{m.label === "First referral" ? "First" : m.label}</span>
            <span className="-mt-1 text-[10px] text-airtel-sub tabular">{m.target}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
