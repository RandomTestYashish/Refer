import { motion } from "framer-motion";
import { Clock3, Hourglass } from "lucide-react";
import { Callout } from "@/components/ui/callout";
import { AnimatedCheck, Screen, ScreenBody } from "@/components/app/primitives";
import { Confetti } from "@/components/app/Confetti";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PLANS, REFERRER } from "@/domain/data";
import { useFocusReferral, useProto } from "@/store/useProto";
import { formatDateTime, inr } from "@/lib/utils";

/** B09 — recharge success + referral validation status. */
export function RechargeSuccessScreen({ params }: { params?: Record<string, string> }) {
  const plan = PLANS.find((p) => p.id === params?.plan) ?? PLANS[1];
  const r = useFocusReferral();
  const rules = useProto((s) => s.rules);
  const bRun = useProto((s) => s.bRun);
  const navigate = useProto((s) => s.navigate);
  const resetTo = useProto((s) => s.resetTo);
  const qualifying = r?.recharge?.txnId === bRun.txnId && r?.recharge?.qualifying;
  const below = plan.price < rules.minTransaction;
  const eligible = !!bRun.eligibility?.eligible && !bRun.attributedOther;
  const deadlinePassed = r?.status === "expired" && r.reason === "deadline_expired";

  return (
    <Screen>
      <Confetti count={18} originY="18%" />
      <ScreenBody className="px-5 pb-6">
        <div className="flex flex-col items-center pt-10 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 14 }}
            className="flex size-[92px] items-center justify-center rounded-full bg-airtel-success text-white shadow-[0_14px_30px_rgba(22,131,74,0.3)]"
          >
            <AnimatedCheck className="size-12" />
          </motion.div>
          <h1 className="mt-6 text-display">Recharge successful</h1>
          <p className="mt-1 text-[14px] text-airtel-sub">
            {inr(plan.price)} plan is now active on {r?.phone ?? "your number"}
          </p>
        </div>

        <div className="mt-6 rounded-[18px] bg-airtel-surface p-4 text-[13.5px]">
          {[
            ["Amount paid", inr(plan.price)],
            ["Plan", `${plan.validity} · ${plan.data}`],
            ["Transaction ID", bRun.txnId ?? "—"],
            ["Date", formatDateTime(Date.now())],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between py-1">
              <span className="text-airtel-sub">{k}</span>
              <span className="font-semibold tabular">{v}</span>
            </div>
          ))}
        </div>

        {/* Referral reward validation */}
        {eligible && qualifying && (
          <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="mt-4">
            <Callout tone="default" title="Referral reward: validating" icon={<Clock3 strokeWidth={1.6} />}>
              Your recharge qualifies. {inr(rules.friendReward)} for you and {inr(rules.referrerReward)} for {REFERRER.first} will be credited once it's
              confirmed.
              <Progress value={70} className="mt-2 h-2 bg-white" />
            </Callout>
          </motion.div>
        )}
        {eligible && !qualifying && below && !deadlinePassed && (
          <Callout tone="warning" title={`Below ${inr(rules.minTransaction)} — reward not unlocked`} className="mt-4">
            This {inr(plan.price)} recharge doesn't qualify. To unlock rewards for you and {REFERRER.first}, recharge {inr(rules.minTransaction)}+
            within {rules.firstTxnDeadlineDays} days.
          </Callout>
        )}
        {deadlinePassed && (
          <Callout tone="dark" title="Referral window expired" icon={<Hourglass strokeWidth={1.6} />} className="mt-4">
            This recharge doesn't unlock referral rewards because the offer had already expired.
          </Callout>
        )}
      </ScreenBody>
      <div className="space-y-2 px-5 pb-[34px]">
        {(eligible && qualifying) || bRun.attributedOther ? (
          <Button size="lg" block onClick={() => navigate("b_complete")}>
            See Reward Status
          </Button>
        ) : eligible && below && !deadlinePassed ? (
          <Button size="lg" block onClick={() => resetTo("b_plans")}>
            Recharge {inr(rules.minTransaction)}+ To Unlock
          </Button>
        ) : null}
        <Button size="lg" block variant="outline" onClick={() => resetTo("b_home")}>
          Back To Home
        </Button>
      </div>
    </Screen>
  );
}
