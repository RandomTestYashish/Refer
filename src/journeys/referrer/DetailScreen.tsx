import { ChevronRight, Gift, Link2, Lock } from "lucide-react";
import { Callout } from "@/components/ui/callout";
import { AppBar, ContactAvatar, Screen, ScreenBody, ScreenFooter, SectionTitle } from "@/components/app/primitives";
import { RewardBadge, StatusBadge } from "@/components/app/status";
import { ReferralTimeline } from "@/components/app/Timeline";
import { ReferralAction, canRemind, canResend, isLinkShare, referralFirstName, referralTitle } from "@/components/app/ReferralActions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CONTACTS } from "@/domain/data";
import { REASON_COPY } from "@/domain/status";
import { useProto } from "@/store/useProto";
import { formatDateTime, inr, timeLeft } from "@/lib/utils";

export function DetailScreen({ params }: { params?: Record<string, string> }) {
  const r = useProto((s) => s.referrals.find((x) => x.id === params?.id));
  const rules = useProto((s) => s.rules);
  const navigate = useProto((s) => s.navigate);
  if (!r)
    return (
      <Screen>
        <AppBar title="Referral" />
        <p className="p-8 text-center text-airtel-sub">This referral no longer exists.</p>
      </Screen>
    );
  const c = CONTACTS.find((x) => x.id === r.contactId);
  const reason = r.reason ? REASON_COPY[r.reason] : undefined;
  const rewardScreen = r.rewardA === "credited" ? "a_unlocked" : "a_pending";

  return (
    <Screen className="bg-airtel-surface">
      <AppBar title="Referral details" className="bg-airtel-surface" />
      <ScreenBody className="px-4 pb-6">
        <div className="rounded-[20px] bg-white p-4 shadow-card">
          <div className="flex items-center gap-3">
            <ContactAvatar name={isLinkShare(r) ? "Link" : r.name} hue={c?.hue ?? 200} size={52} />
            <div className="min-w-0 flex-1">
              <p className="text-[17px] font-bold">{referralTitle(r)}</p>
              <p className="text-[12.5px] text-airtel-sub tabular">{r.phone || "Shared via link"}</p>
            </div>
            <StatusBadge status={r.status} />
          </div>
          <button
            onClick={() => navigate(rewardScreen, { id: r.id })}
            className="mt-4 flex w-full items-center gap-3 rounded-[14px] bg-airtel-surface px-3.5 py-3 text-left active:scale-[0.99]"
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-white">
              {r.rewardA === "credited" ? <Gift className="size-[18px] text-airtel-success" /> : <Lock className="size-[18px] text-airtel-sub" />}
            </span>
            <span className="flex-1">
              <span className="block text-[12px] text-airtel-sub">Your reward</span>
              <span className="flex items-center gap-2 text-[15px] font-bold">
                {inr(rules.referrerReward)} <RewardBadge state={r.rewardA} />
              </span>
            </span>
            <ChevronRight className="size-5 text-airtel-sub" />
          </button>
          <div className="mt-2 flex items-center justify-between px-1 text-[12px] text-airtel-sub">
            <span>Friend's reward: {inr(rules.friendReward)} + {rules.friendDataGB} GB</span>
            <RewardBadge state={r.rewardB} />
          </div>
        </div>

        {reason && (
          <Callout tone={r.status === "expired" ? "warning" : "error"} title={reason.title} className="mt-3">
            {reason.body}
          </Callout>
        )}
        {r.status === "pending_recharge" && (
          <Callout tone="warning" title="Waiting for first recharge" className="mt-3">
            {referralFirstName(r)} needs to recharge {inr(rules.minTransaction)}+ within {rules.firstTxnDeadlineDays} days of joining.
          </Callout>
        )}

        <div className="mt-4 rounded-[20px] bg-white p-4 pb-1 shadow-card">
          <p className="mb-4 text-[15px] font-bold">Referral timeline</p>
          <ReferralTimeline r={r} />
        </div>

        <div className="mt-4 rounded-[20px] bg-white py-4 shadow-card">
          <SectionTitle className="px-4">Invitation links</SectionTitle>
          <ul className="px-4">
            {[...r.links].reverse().map((l) => (
              <li key={l.code} className="flex items-center gap-3 border-t border-airtel-line py-2.5 first:border-0">
                <Link2 className="size-4 text-airtel-sub" />
                <span className="flex-1">
                  <span className="block text-[13px] font-semibold">airtel.in/r/{l.code}</span>
                  <span className="block text-[11.5px] text-airtel-sub">Created {formatDateTime(l.createdAt)}</span>
                </span>
                <Badge variant={l.state === "active" ? "success" : "neutral"}>
                  {l.state === "active" ? timeLeft(l.expiresAt - Date.now()) : l.state === "expired" ? "Expired" : "Replaced"}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      </ScreenBody>
      {(canResend(r) || canRemind(r)) && (
        <ScreenFooter>
          <ReferralAction r={r} size="lg" block />
        </ScreenFooter>
      )}
      {!canResend(r) && !canRemind(r) && (
        <ScreenFooter>
          <Button size="lg" block variant="outline" onClick={() => navigate(rewardScreen, { id: r.id })}>
            View Reward Status
          </Button>
        </ScreenFooter>
      )}
    </Screen>
  );
}
