import { forwardRef } from "react";
import { ArrowDownLeft, ChevronRight, Clock3, Send, Users, WifiOff, X } from "lucide-react";
import { ListRow, SheetSection } from "@/components/app/refer/SheetUI";
import type { Referral } from "@/domain/types";
import { cn, formatDate, inr } from "@/lib/utils";

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
        ? { label: "Reward credit failed", detail: "We'll retry automatically. No action needed.", tone: "error" }
        : { label: "Reward processing", detail: "Your referral is being validated.", tone: "warning" };
    case "reward_credited":
      return { label: "Reward credited", detail: `${inr(reward)} cashback has been credited.`, tone: "success" };
    case "expired":
      return { label: "Expired", detail: r.reason === "link_expired" ? "The invitation wasn't opened in time. You can resend it." : "The eligible action wasn't completed in time.", tone: "neutral" };
    case "not_eligible":
      return { label: "Not eligible", detail: "This friend doesn't qualify under the programme rules.", tone: "error" };
    case "failed":
      return { label: "Reward failed", detail: "Something went wrong crediting this reward. Contact support if it persists.", tone: "error" };
  }
}

const TONE: Record<Tone, { icon: string; label: string }> = {
  neutral: { icon: "bg-[#F0F4F9] text-[#485B76]", label: "text-[#485B76]" },
  warning: { icon: "bg-[#FFF3E2] text-[#B25E09]", label: "text-[#B25E09]" },
  success: { icon: "bg-[#E7F6EC] text-[#0F7033]", label: "text-[#0F7033]" },
  error: { icon: "bg-[#FFE8E9] text-[#C3202D]", label: "text-[#C3202D]" },
};
const ICON: Record<Tone, JSX.Element> = {
  neutral: <Send />,
  warning: <Clock3 />,
  success: <ArrowDownLeft />,
  error: <X />,
};

/** Recent activity — the Airtel rewards "Recent activity" list: icon, friend, plain status, amount + date. */
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
        action={
          referrals.length > 0 ? (
            <button onClick={onViewAll} className="flex size-8 items-center justify-center rounded-full active:bg-[#F0F4F9]" aria-label="View all referrals">
              <ChevronRight className="size-6 text-[#292C31]" />
            </button>
          ) : undefined
        }
      >
        {offline ? (
          <div className="flex items-center gap-3 rounded-[16px] border border-[#E6E9EF] p-4" role="status">
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
        ) : latest.length === 0 ? (
          <div className="rounded-[16px] border border-dashed border-[#D8DCE3] p-5 text-center">
            <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-[#F0F4F9]">
              <Users className="size-5 text-[#696B6F]" />
            </span>
            <p className="mt-2 text-[14px] font-bold text-[#292C31]">No invitations yet</p>
            <p className="mt-0.5 text-[12px] text-[#696B6F]">Invite a friend and every step shows up here.</p>
            <button onClick={onInvite} className="mt-3 text-[14px] font-medium text-[#075EE8]">
              Invite a friend
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[20px] border border-[#E6E9EF] bg-[linear-gradient(180deg,#FFFFFF,#F7F7F7)] px-4 shadow-[0_4px_14px_rgba(41,44,49,0.05)]">
            {latest.map((r) => {
              const s = referralStatusCopy(r, reward);
              const amount = s.tone === "success" ? `+${inr(reward)}` : s.tone === "warning" ? inr(reward) : "";
              return (
                <ListRow
                  key={r.id}
                  onClick={() => onOpen(r.id)}
                  icon={ICON[s.tone]}
                  iconClass={TONE[s.tone].icon}
                  title={r.name}
                  sub={
                    <>
                      <span className={cn("font-semibold", TONE[s.tone].label)}>{s.label}</span> · {s.detail}
                    </>
                  }
                  right={
                    <span className="shrink-0 text-right">
                      <span className={cn("block text-[14px] font-bold tabular-nums", s.tone === "success" ? "text-[#0F7033]" : "text-[#292C31]")}>{amount}</span>
                      <span className="block text-[11px] text-[#696B6F]">{formatDate(r.createdAt).replace(/ \d{4}$/, "")}</span>
                    </span>
                  }
                />
              );
            })}
            <button onClick={onViewAll} className="-mx-4 flex w-[calc(100%+2rem)] items-center justify-center gap-1 py-3 text-[14px] font-semibold text-[#075EE8] active:bg-[#F0F4F9]">
              View all referrals <ChevronRight className="size-4" />
            </button>
          </div>
        )}
      </SheetSection>
    </div>
  );
});
ReferralActivity.displayName = "ReferralActivity";
