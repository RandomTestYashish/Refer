import { forwardRef } from "react";
import { ChevronRight, Users, WifiOff } from "lucide-react";
import { SheetSection } from "@/components/app/refer/SheetUI";
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

/** Gen4 Info Tag, In-card / sm. */
const TAG: Record<Tone, string> = {
  neutral: "border-[#8E9AA9] bg-[#E6E9EF] text-[#292C31]",
  warning: "border-[#FFE48A] bg-[#FFF0B8] text-[#8F4C00]",
  success: "border-[#A3DFB9] bg-[#D1EFDC] text-[#0F7033]",
  error: "border-[#FEACAF] bg-[#FFD5D7] text-[#981C20]",
};

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

/** Recent activity — Gen4 Link List Group (With subtext): avatar, friend, status Info Tag, date, amount. */
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

  if (!offline && latest.length > 0) {
    return (
      <section ref={ref} aria-labelledby="activity-title" className="px-4 pt-8">
        <div className="rounded-[16px] border border-[#E6E9EF] bg-[linear-gradient(180deg,#FFFFFF,#F5F5F5)] py-4 shadow-[0_4px_8px_rgba(0,0,0,0.1)]">
          <h2 id="activity-title" className="px-4 text-[12px] font-bold uppercase leading-[14px] text-[#696B6F]">
            Recent activity
          </h2>
          <ul className="mt-3 space-y-4">
            {latest.map((r) => {
              const s = referralStatusCopy(r, reward);
              const amount = s.tone === "success" ? `+${inr(reward)}` : s.tone === "warning" ? inr(reward) : "";
              const date = formatDate(r.createdAt).replace(/ \d{4}$/, "");
              return (
                <li key={r.id}>
                  <button
                    onClick={() => onOpen(r.id)}
                    aria-label={`${r.name}, ${s.label}, ${date}. ${s.detail}`}
                    className="flex w-full items-center gap-3 px-4 py-2 text-left active:bg-black/[0.03]"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#E6F0FF] text-[14px] leading-4 text-black">{initials(r.name)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-bold leading-5 text-[#292C31]">{r.name}</span>
                      <span className="mt-1 flex min-w-0 items-center gap-2">
                        <span className={cn("shrink-0 rounded-[4px] border px-2 py-px text-[11px] font-bold leading-[14px]", TAG[s.tone])}>{s.label}</span>
                        <span className="truncate text-[12px] leading-[18px] text-[#696B6F]">{date}</span>
                      </span>
                    </span>
                    {amount && <span className={cn("shrink-0 text-[14px] font-bold leading-5 tabular-nums", s.tone === "success" ? "text-[#0F7033]" : "text-[#292C31]")}>{amount}</span>}
                    <ChevronRight className="size-5 shrink-0 text-[#292C31]" />
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="mx-4 mt-4 border-t border-[#E6E9EF] pt-4">
            <button onClick={onViewAll} className="flex w-full items-center justify-center gap-1 text-[14px] font-medium leading-4 text-[#075EE8] active:opacity-60">
              View All Referrals <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </section>
    );
  }

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
