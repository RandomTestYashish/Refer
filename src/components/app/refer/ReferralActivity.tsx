import { forwardRef } from "react";
import { ChevronRight, Users, WifiOff } from "lucide-react";
import { CARD, LinkButton, SectionTitle } from "@/components/app/gen4";
import { ContactAvatar } from "@/components/app/primitives";
import { CONTACTS } from "@/domain/data";
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

const TONE: Record<Tone, string> = {
  neutral: "bg-[#F0F4F9] text-[#3E4146]",
  warning: "bg-[#FFF0B8] text-[#8F4C00]",
  success: "bg-[#D1EFDC] text-[#0F7033]",
  error: "bg-[#FFD5D7] text-[#981C20]",
};

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
  const latest = [...referrals].sort((a, b) => b.createdAt - a.createdAt).slice(0, 3);
  return (
    <section ref={ref} aria-labelledby="activity-title" className="mt-8 px-4">
      <SectionTitle action={referrals.length > 0 ? <LinkButton onClick={onViewAll}>View all</LinkButton> : undefined}>
        <span id="activity-title">referral activity</span>
      </SectionTitle>

      {offline ? (
        <div className={`mt-4 flex items-center gap-3 rounded-[16px] p-4 ${CARD}`} role="status">
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
        <div className={`mt-4 rounded-[16px] p-5 text-center ${CARD}`}>
          <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-[#F0F4F9]">
            <Users className="size-5 text-[#696B6F]" />
          </span>
          <p className="mt-2 text-[14px] font-bold text-[#292C31]">No invitations yet</p>
          <p className="mt-0.5 text-[12px] text-[#696B6F]">Invite a friend and track every step here.</p>
          <button onClick={onInvite} className="mt-3 h-9 rounded-[10px] bg-black px-4 text-[13px] font-medium text-white active:bg-[#3E4146]">
            Invite Friends
          </button>
        </div>
      ) : (
        <ul className={`mt-4 divide-y divide-[#E6E9EF] rounded-[16px] ${CARD}`}>
          {latest.map((r) => {
            const c = CONTACTS.find((x) => x.id === r.contactId);
            const s = referralStatusCopy(r, reward);
            return (
              <li key={r.id}>
                <button onClick={() => onOpen(r.id)} className="flex w-full items-start gap-3 px-4 py-3 text-left active:bg-[#F0F4F9]">
                  <ContactAvatar name={r.name} hue={c?.hue ?? 200} size={36} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-[14px] font-semibold text-[#292C31]">{r.name}</span>
                      <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-bold", TONE[s.tone])}>{s.label}</span>
                    </span>
                    <span className="mt-0.5 block text-[12px] leading-[16px] text-[#696B6F]">{s.detail}</span>
                    <span className="mt-0.5 block text-[11px] text-[#A0A2A4]">Invited {formatDate(r.createdAt)}</span>
                  </span>
                  <ChevronRight className="mt-2 size-4 shrink-0 text-[#A0A2A4]" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
});
ReferralActivity.displayName = "ReferralActivity";
