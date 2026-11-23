import { forwardRef } from "react";
import { ChevronRight, Users, WifiOff } from "lucide-react";
import { ReferralCard } from "@/components/app/refer/ReferralCard";
import { SheetSection } from "@/components/app/refer/SheetUI";
import type { Referral } from "@/domain/types";
import { inr } from "@/lib/utils";

type Tone = "neutral" | "warning" | "success" | "error";

/**
 * Plain-language status for a referral. Rules from the brief:
 * never "delivered" until delivery is confirmed, never "successful" just because a link was opened.
 */
export function referralStatusCopy(r: Referral, reward: number): { label: string; detail: string; tone: Tone } {
  if (r.status === "invited" && r.delivery === "pending") return { label: "Sending invitation", detail: "We'll confirm once it's delivered.", tone: "neutral" };
  switch (r.status) {
    case "invited":
      return { label: "Invitation sent", detail: "Your friend has received your invitation.", tone: "neutral" };
    case "link_opened":
      return { label: "Invitation opened", detail: "Your friend still needs to sign in and complete the eligible action.", tone: "warning" };
    case "accepted":
    case "pending_recharge":
      return { label: "Pending action", detail: "Your friend still needs to complete the eligible action.", tone: "warning" };
    case "transaction_completed":
    case "reward_processing":
      return r.rewardA === "failed"
        ? { label: "Reward credit unsuccessful", detail: "We'll retry automatically. No action needed.", tone: "error" }
        : { label: "Reward processing", detail: "Your referral is being validated.", tone: "warning" };
    case "reward_credited":
      return { label: "Reward credited", detail: `${inr(reward)} cashback has been credited.`, tone: "success" };
    case "expired":
      return { label: "Expired", detail: r.reason === "link_expired" ? "The invitation wasn't opened in time. You can resend it." : "The eligible action wasn't completed in time.", tone: "neutral" };
    case "not_eligible":
      return { label: "Not eligible", detail: "This friend doesn't qualify under the programme rules.", tone: "error" };
    case "failed":
      return { label: "Reward unsuccessful", detail: "Something went wrong crediting this reward. Contact support if it persists.", tone: "error" };
  }
}

/** Recent activity: the latest referrals on the same card used by My Referrals. */
export const ReferralActivity = forwardRef<
  HTMLElement,
  {
    referrals: Referral[];
    reward: number;
    offline: boolean;
    onRetry: () => void;
    onOpen: (id: string) => void;
    onViewAll: () => void;
    onInvite: () => void;
  }
>(({ referrals, reward, offline, onRetry, onOpen, onViewAll, onInvite }, ref) => {
  const latest = [...referrals].sort((a, b) => b.createdAt - a.createdAt).slice(0, 4);
  return (
    <div ref={ref as React.Ref<HTMLDivElement>}>
      <SheetSection
        id="activity-title"
        title="Recent activity"
      >
        {offline ? (
          <div className="flex items-center gap-3 rounded-[16px] border border-[#E6E9EF] bg-[linear-gradient(180deg,#FFFFFF,#F5F5F5)] p-4" role="status">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#F0F4F9]">
              <WifiOff className="size-5 text-[#696B6F]" />
            </span>
            <p className="min-w-0 flex-1 text-[12.5px] leading-[17px] text-[#3E4146]">
              <b className="block text-[13px] text-[#292C31]">Couldn't refresh your activity</b>
              Your referrals are safe. Check your connection and try again.
            </p>
            <button onClick={onRetry} className="h-9 shrink-0 rounded-[10px] border border-[#E6E9EF] bg-white px-3 text-[13px] font-medium text-[#292C31] active:bg-[#F0F4F9]">
              Retry
            </button>
          </div>
        ) : latest.length > 0 ? (
          <div className="space-y-3">
            {latest.map((r) => (
              <ReferralCard key={r.id} r={r} reward={reward} onOpen={() => onOpen(r.id)} />
            ))}
            <button onClick={onViewAll} className="flex w-full items-center justify-center gap-1 pt-1 text-[14px] font-medium leading-4 text-[#075EE8] active:opacity-60">
              View All Referrals <ChevronRight className="size-4" />
            </button>
          </div>
        ) : (
          <div className="rounded-[16px] border border-[#E6E9EF] bg-[linear-gradient(180deg,#FFFFFF,#F5F5F5)] p-4 text-center">
            <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-[#F0F4F9]">
              <Users className="size-5 text-[#696B6F]" />
            </span>
            <p className="mt-2 text-[16px] font-bold leading-[18px] text-[#292C31]">No invitations yet</p>
            <p className="mt-1 text-[12px] leading-[18px] text-[#696B6F]">Invite a friend and every step shows up here.</p>
            <button onClick={onInvite} className="mt-3 text-[14px] font-medium leading-4 text-[#075EE8]">
              Invite A Friend
            </button>
          </div>
        )}
      </SheetSection>
    </div>
  );
});
ReferralActivity.displayName = "ReferralActivity";
