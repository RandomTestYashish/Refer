import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Ban, CalendarX2, Clock3, Hourglass, Lock, RotateCcw, ShieldAlert, Undo2, UserX } from "lucide-react";
import { AppBar, RewardCoin, Screen, ScreenBody, ScreenFooter, SimNote } from "@/components/app/primitives";
import { ErrorState } from "@/components/app/ErrorState";
import { CARD } from "@/components/app/gen4";
import { RewardBadge, StatusBadge } from "@/components/app/status";
import { ReferralAction, canRemind, canResend } from "@/components/app/ReferralActions";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { REASON_COPY } from "@/domain/status";
import { useProto } from "@/store/useProto";
import { inr } from "@/lib/utils";

export function PendingRewardScreen({ params }: { params?: Record<string, string> }) {
  const r = useProto((s) => s.referrals.find((x) => x.id === params?.id));
  const rules = useProto((s) => s.rules);
  const replace = useProto((s) => s.replace);
  const resetTo = useProto((s) => s.resetTo);
  const navigate = useProto((s) => s.navigate);
  const [retrying, setRetrying] = useState(false);

  // Live update: if the friend's reward gets credited while this screen is open, play the unlock.
  useEffect(() => {
    if (r?.rewardA === "credited") {
      const t = setTimeout(() => replace("a_unlocked", { id: r.id }), 500);
      return () => clearTimeout(t);
    }
  }, [r?.rewardA, r?.id, replace]);

  if (!r)
    return (
      <Screen>
        <AppBar title="Reward" />
        <p className="p-8 text-center text-airtel-sub">Referral not found.</p>
      </Screen>
    );

  const first = r.name.split(" ")[0];
  const header = <AppBar title="Your reward" />;
  const toDashboard = { label: "Back to My Referrals", onClick: () => resetTo("a_dashboard") };
  const reason = r.reason ? REASON_COPY[r.reason] : undefined;

  // ---- Terminal / error reward states ----
  if (r.status === "expired" && r.reason === "link_expired")
    return (
      <Screen>
        {header}
        <ErrorState
          icon={<CalendarX2 />}
          tone="neutral"
          title="Invitation link expired"
          body={`${first} didn't open your invite within ${rules.linkValidityHours} hours. Resend to create a fresh link — the earlier invite stays in your history.`}
          status={<StatusBadge status={r.status} />}
          tertiary={toDashboard}
        >
          <ReferralAction r={r} size="lg" block />
        </ErrorState>
      </Screen>
    );

  if (r.rewardA === "not_eligible" && reason)
    return (
      <Screen>
        {header}
        <ErrorState
          icon={r.reason === "attributed_other" ? <ShieldAlert /> : <UserX />}
          tone="neutral"
          title={reason.title}
          body={reason.body}
          status={<StatusBadge status={r.status} />}
          primary={{ label: "Invite someone else", onClick: () => navigate("a_contacts") }}
          secondary={toDashboard}
        />
      </Screen>
    );

  if (r.rewardA === "failed")
    return (
      <Screen>
        {header}
        <ErrorState
          icon={<Ban />}
          title="Reward couldn't be credited"
          body={`${first}'s recharge qualified, but crediting your ${inr(rules.referrerReward)} failed. You don't need to do anything — retry now or we'll retry automatically.`}
          status={<RewardBadge state="failed" />}
          primary={{
            label: "Retry credit",
            loading: retrying,
            onClick: () => {
              setRetrying(true);
              setTimeout(() => {
                setRetrying(false);
                const st = useProto.getState();
                if (st.scenario.reward === "failed") toast.error("Still failing", { description: "Set Reward outcome to Credited in the panel to recover." });
                else st.applyRewardOutcome(r.id, undefined, true);
              }, 1100);
            },
          }}
          secondary={{ label: "Contact support", onClick: () => toast("Support ticket created", { description: "Prototype — no ticket was actually raised." }) }}
          tertiary={toDashboard}
        />
      </Screen>
    );

  if (r.rewardA === "reversed")
    return (
      <Screen>
        {header}
        <ErrorState
          icon={<Undo2 />}
          title="Reward reversed"
          body={`${first}'s qualifying recharge was reversed or refunded, so the ${inr(rules.referrerReward)} reward linked to it has been withdrawn.`}
          status={<RewardBadge state="reversed" />}
          primary={{ label: "Invite another friend", onClick: () => navigate("a_contacts") }}
          secondary={toDashboard}
        />
      </Screen>
    );

  if (r.rewardA === "expired")
    return (
      <Screen>
        {header}
        <ErrorState
          icon={<Hourglass />}
          tone="neutral"
          title={reason?.title ?? "Reward expired"}
          body={reason?.body ?? "This reward has expired."}
          status={<RewardBadge state="expired" />}
          primary={{ label: "Invite another friend", onClick: () => navigate("a_contacts") }}
          secondary={toDashboard}
        />
      </Screen>
    );

  // ---- Locked / processing ----
  const processing = r.rewardA === "validating" || r.rewardA === "delayed";
  const stepIdx = ["invited", "link_opened", "accepted", "pending_recharge", "transaction_completed", "reward_processing"].indexOf(r.status);
  const pct = Math.max(8, ((stepIdx + 1) / 7) * 100);

  return (
    <Screen>
      {header}
      <ScreenBody className="px-5 pb-6">
        <div className="flex flex-col items-center pt-4 text-center">
          <motion.div className="relative" animate={processing ? {} : { rotate: [0, -4, 4, -2, 0] }} transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 2.6 }}>
            <RewardCoin amount={rules.referrerReward} size={112} locked />
            <span className="absolute -bottom-1 -right-1 flex size-10 items-center justify-center rounded-full border-4 border-white bg-airtel-ink text-white">
              {processing ? <Clock3 className="size-4" /> : <Lock className="size-4" />}
            </span>
          </motion.div>
          {!processing ? (
            <>
              <h2 className="mt-6 text-title">Your reward is waiting!</h2>
              <p className="mt-2 text-[14px] leading-[21px] text-airtel-sub">
                {["invited", "link_opened"].includes(r.status)
                  ? `${first} hasn't joined Airtel yet. Give them a nudge — you'll both get ${inr(rules.referrerReward)} once they complete their first eligible recharge.`
                  : `${first} hasn't completed their first eligible recharge yet. A recharge of ${inr(rules.minTransaction)}+ within ${rules.firstTxnDeadlineDays} days unlocks ${inr(rules.referrerReward)} for each of you.`}
              </p>
            </>
          ) : r.rewardA === "validating" ? (
            <>
              <h2 className="mt-6 text-title">Reward validation pending</h2>
              <p className="mt-2 text-[14px] leading-[21px] text-airtel-sub">
                {first} completed a qualifying recharge 🎉 We're validating the transaction — this can take up to {rules.rewardValidationDays} days. Nothing
                for you to do.
              </p>
            </>
          ) : (
            <>
              <h2 className="mt-6 text-title">Taking a little longer</h2>
              <p className="mt-2 text-[14px] leading-[21px] text-airtel-sub">
                Reward processing is delayed on our side. Your {inr(rules.referrerReward)} is safe and will be credited automatically — we'll notify you.
              </p>
            </>
          )}
          <div className="mt-3 flex gap-2">
            <StatusBadge status={r.status} />
            <RewardBadge state={r.rewardA} />
          </div>
        </div>

        <div className={`mt-7 rounded-[16px] p-4 ${CARD}`}>
          <div className="flex items-center justify-between text-[13px] font-semibold">
            <span>Unlock progress</span>
            <span className="text-airtel-sub tabular">{Math.max(0, stepIdx + 1)}/7</span>
          </div>
          <Progress value={pct} className="mt-2.5 h-2 bg-[#F0F4F9]" indicatorClassName={processing ? "bg-airtel-warning" : undefined} />
          <ul className="mt-4 space-y-2 text-[13px]">
            {[
              { t: "Invite sent", d: stepIdx >= 0 },
              { t: `${first} joined Airtel`, d: stepIdx >= 2 },
              { t: `First recharge of ${inr(rules.minTransaction)}+`, d: stepIdx >= 4 },
              { t: "Reward validated & credited", d: false },
            ].map((x) => (
              <li key={x.t} className="flex items-center gap-2.5">
                <span className={`size-2 rounded-full ${x.d ? "bg-airtel-success" : "bg-[#CFCFCF]"}`} />
                <span className={x.d ? "font-medium" : "text-airtel-sub"}>{x.t}</span>
              </li>
            ))}
          </ul>
        </div>
        {r.rewardA === "delayed" && (
          <Button variant="link" className="mx-auto mt-3 flex" onClick={() => toast("We'll keep you posted", { description: "Prototype — notification preferences are simulated." })}>
            Notify me when credited
          </Button>
        )}
        <SimNote className="mt-4">Use “Simulate friend's recharge” in the panel to unlock live</SimNote>
      </ScreenBody>
      <ScreenFooter className="space-y-2">
        {canRemind(r) || canResend(r) ? (
          <ReferralAction r={r} size="lg" block />
        ) : (
          <Button size="lg" block variant="outline" onClick={() => resetTo("a_dashboard")}>
            <RotateCcw /> Back to My Referrals
          </Button>
        )}
      </ScreenFooter>
    </Screen>
  );
}
