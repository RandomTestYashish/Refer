import { useMemo } from "react";
import { Info } from "lucide-react";
import { BadgeFlipCard, TierBadge } from "./AchievementBadge";
import { inProgressCount, referralStats, tierStatuses, useProto } from "@/store/useProto";
import { cn } from "@/lib/utils";

export const monthName = () => new Date().toLocaleString("en-IN", { month: "long" });

/** Current-month milestone state, shared by the landing page, Milestones screen and celebration. */
export function useMilestones() {
  const rules = useProto((s) => s.rules);
  const referrals = useProto((s) => s.referrals);
  const past = useProto((s) => s.pastSuccesses);
  return useMemo(() => {
    const stats = referralStats(referrals, past, rules.referrerReward);
    const inProgress = inProgressCount(referrals);
    const ms = rules.milestones;
    // Monthly cap: progress can't go beyond the top tier (Platinum) within a month.
    const count = Math.min(stats.milestoneCount, ms[ms.length - 1].target);
    const statuses = tierStatuses(ms, count, inProgress);
    return { ms, count, rawCount: stats.milestoneCount, inProgress, statuses, earned: statuses.filter((s) => s === "earned").length };
  }, [rules, referrals, past]);
}

export function MilestoneCollection({ className }: { className?: string }) {
  const { ms, count, rawCount, inProgress, statuses, earned } = useMilestones();
  const month = monthName();
  const capped = rawCount >= ms[ms.length - 1].target;
  return (
    <div className={className} data-testid="milestones">
      <div className="flex items-center gap-3 rounded-[18px] border border-[#ECEEF2] bg-white p-3.5">
        <div className="flex -space-x-2.5" aria-hidden>
          {ms.map((m, i) => (
            <TierBadge key={m.id} tier={m.id} status={statuses[i]} size={30} className={cn(statuses[i] !== "earned" && "opacity-70")} />
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-bold leading-[18px] text-airtel-ink" data-testid="milestone-summary">
            {earned} of {ms.length} badges · {month}
          </p>
          <p className="text-[12px] leading-[16px] text-airtel-sub tabular">
            {count} successful {count === 1 ? "referral" : "referrals"} this month{inProgress > 0 ? ` · ${inProgress} in progress` : ""}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        {ms.map((m, i) => (
          <BadgeFlipCard
            key={m.id}
            m={m}
            next={ms[i + 1]}
            status={statuses[i]}
            count={count}
            inProgress={inProgress}
            monthName={month}
            isTop={i === ms.length - 1}
          />
        ))}
      </div>
      <p className="mt-3 flex gap-1.5 text-[11.5px] leading-[16px] text-airtel-sub">
        <Info className="mt-px size-3.5 shrink-0" />
        {capped
          ? `You've reached Platinum, the highest tier for ${month}.`
          : "Tap a badge for details. Platinum is the highest tier you can reach each month."}
      </p>
    </div>
  );
}
