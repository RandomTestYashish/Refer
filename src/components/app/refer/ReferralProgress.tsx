import { forwardRef } from "react";
import { ChevronRight, UserPlus } from "lucide-react";
import { CoinBadge, MilestoneTrack } from "@/components/app/Milestones";
import { SheetSection } from "@/components/app/refer/SheetUI";
import { Button } from "@/components/ui/button";
import type { BusinessRules, Milestone } from "@/config/businessRules";
import { inr } from "@/lib/utils";

/** The highest milestone reached for a given count of successful referrals. */
export function currentMilestone(milestones: Milestone[], count: number) {
  return [...milestones].reverse().find((m) => count >= m.target);
}

/**
 * Your progress — the "streak" card pattern from the Airtel rewards page: earned so far,
 * a coin stepper of milestone badges, one black CTA and a one-line nudge.
 * Badges are recognition only: no extra cash is promised for reaching them.
 */
export const ReferralProgress = forwardRef<
  HTMLElement,
  { rules: BusinessRules; successful: number; earned: number; onViewAll: () => void; onInvite: () => void }
>(({ rules, successful, earned, onViewAll, onInvite }, ref) => {
  const ms = rules.milestones;
  const current = currentMilestone(ms, successful);
  const next = ms.find((m) => successful < m.target);
  const toNext = next ? next.target - successful : 0;

  return (
    <div ref={ref as React.Ref<HTMLDivElement>}>
      <SheetSection
        id="progress-title"
        title="Your progress"
        subtitle="Earn a badge as more friends join."
        action={
          <button onClick={onViewAll} className="flex size-8 items-center justify-center rounded-full active:bg-[#F0F4F9]" aria-label="View all milestones">
            <ChevronRight className="size-6 text-[#292C31]" />
          </button>
        }
      >
        <div className="rounded-[16px] border border-[#E6E9EF] bg-[linear-gradient(180deg,#FFFFFF,#F7F7F7)] p-4">
          <div className="flex items-center gap-3">
            {current ? (
              <CoinBadge m={current} state="unlocked" size={52} />
            ) : (
              <CoinBadge m={ms[0]} state="next" size={52} />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold text-[#B25E09]">{current ? `${current.label} badge` : "No badge yet"}</p>
              <p className="text-[20px] font-bold leading-6 text-[#292C31] tabular-nums">
                {inr(earned)} <span className="text-[13px] font-medium text-[#696B6F]">earned so far</span>
              </p>
              <p className="text-[12px] text-[#696B6F]">
                {successful} successful {successful === 1 ? "referral" : "referrals"}
              </p>
            </div>
          </div>

          <div className="mt-5">
            <MilestoneTrack milestones={ms} count={successful} />
          </div>

          <Button size="default" block className="mt-5" onClick={onInvite}>
            <UserPlus /> Invite a friend
          </Button>
          <p className="mt-3 text-center text-[12px] text-[#3E4146]">
            {next ? (
              <>
                {toNext} more successful {toNext === 1 ? "referral" : "referrals"} to unlock <b>{next.label}</b>
              </>
            ) : (
              "Every badge unlocked. Keep referring to keep earning."
            )}
          </p>
        </div>
        <p className="mt-2 text-[11px] leading-[15px] text-[#696B6F]">Badges recognise your referrals and don't carry extra cash. Thresholds are provisional.</p>
      </SheetSection>
    </div>
  );
});
ReferralProgress.displayName = "ReferralProgress";
