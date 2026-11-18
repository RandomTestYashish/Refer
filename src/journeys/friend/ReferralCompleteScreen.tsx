import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Clock3, Hourglass, Loader2, Undo2, XCircle } from "lucide-react";
import { ContactAvatar, RewardCoin, Screen, ScreenBody } from "@/components/app/primitives";
import { Confetti } from "@/components/app/Confetti";
import { RewardBadge } from "@/components/app/status";
import { Button } from "@/components/ui/button";
import { REFERRER } from "@/domain/data";
import { useFocusReferral, useProto } from "@/store/useProto";
import { inr } from "@/lib/utils";
import type { RewardState } from "@/domain/types";

/** B10 — referral completion: resolves validation and shows both sides' reward state. */
export function ReferralCompleteScreen() {
  const r = useFocusReferral();
  const rules = useProto((s) => s.rules);
  const bRun = useProto((s) => s.bRun);
  const resetTo = useProto((s) => s.resetTo);
  const setJourney = useProto((s) => s.setJourney);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      if (r) useProto.getState().applyRewardOutcome(r.id);
      setResolved(true);
    }, 1800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (bRun.attributedOther)
    return (
      <Screen>
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <RewardCoin amount={rules.friendReward} size={100} />
          <h1 className="mt-6 text-title">Your welcome reward is on its way</h1>
          <p className="mt-2 text-[14px] leading-[21px] text-airtel-sub">
            It'll be credited through the first invite you opened. {REFERRER.first}'s invite isn't linked to this recharge.
          </p>
        </div>
        <div className="px-5 pb-[34px]">
          <Button size="lg" block onClick={() => resetTo("b_home")}>
            Back to Home
          </Button>
        </div>
      </Screen>
    );

  const state: RewardState = !resolved ? "validating" : r?.rewardB ?? "validating";
  const credited = state === "credited";
  const copy: Record<string, { icon: JSX.Element; title: string; body: string }> = {
    credited: {
      icon: <CheckCircle2 className="size-5 text-airtel-success" />,
      title: "Referral completed!",
      body: `You and ${REFERRER.first} have both earned ${inr(rules.friendReward)}. Thanks for joining Airtel.`,
    },
    validating: {
      icon: <Clock3 className="size-5 text-airtel-warning" />,
      title: resolved ? "Reward pending validation" : "Validating your recharge…",
      body: resolved
        ? `Your recharge was successful, but the reward is still being validated. This can take up to ${rules.rewardValidationDays} days — we'll notify you both.`
        : "Hang tight while we confirm your qualifying recharge.",
    },
    delayed: {
      icon: <Clock3 className="size-5 text-airtel-warning" />,
      title: "Reward processing delayed",
      body: "Your recharge qualified, but crediting is taking longer than usual. Your reward is safe and will arrive automatically.",
    },
    failed: {
      icon: <XCircle className="size-5 text-airtel-error" />,
      title: "Reward not eligible",
      body: "Your recharge was successful, but it didn't pass reward validation, so no referral reward can be credited for it.",
    },
    reversed: {
      icon: <Undo2 className="size-5 text-airtel-error" />,
      title: "Transaction reversed",
      body: "Your recharge payment was reversed by the bank, so the referral rewards for you and your friend were withdrawn.",
    },
    expired: {
      icon: <Hourglass className="size-5 text-airtel-sub" />,
      title: "Reward expired",
      body: "The reward couldn't be validated within the validation window and has expired.",
    },
  };
  const c = copy[state] ?? copy.validating;

  return (
    <Screen className={credited ? "bg-gradient-to-b from-[#FFF4F6] via-white to-white" : undefined}>
      {credited && <Confetti originY="22%" />}
      <ScreenBody className="px-5 pb-6">
        <div className="flex flex-col items-center pt-10 text-center">
          <motion.div
            key={state}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 14 }}
          >
            {!resolved ? (
              <div className="relative">
                <RewardCoin amount={rules.friendReward} size={112} locked />
                <Loader2 className="absolute -right-1 -top-1 size-8 animate-spin rounded-full bg-white p-1 text-airtel-warning" />
              </div>
            ) : (
              <RewardCoin amount={rules.friendReward} size={112} locked={!credited} />
            )}
          </motion.div>
          <h1 className="mt-6 text-display">{c.title}</h1>
          <p className="mt-2 text-[15px] leading-[22px] text-airtel-sub">{c.body}</p>
        </div>

        <div className="mt-7 space-y-3">
          {[
            { who: "You", name: r?.name ?? "You", hue: 12, amt: rules.friendReward, st: !resolved ? "validating" : r?.rewardB },
            { who: `${REFERRER.first} (invited you)`, name: REFERRER.name, hue: 350, amt: rules.referrerReward, st: !resolved ? "validating" : r?.rewardA },
          ].map((x, i) => (
            <motion.div
              key={x.who}
              initial={{ x: -12, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.15 + i * 0.1 }}
              className="flex items-center gap-3 rounded-[18px] border border-airtel-line bg-white p-3.5 shadow-card"
            >
              <ContactAvatar name={x.name} hue={x.hue} size={42} />
              <div className="flex-1">
                <p className="text-[12px] text-airtel-sub">{x.who}</p>
                <p className="text-[17px] font-bold">{inr(x.amt)}</p>
              </div>
              <RewardBadge state={(x.st ?? "validating") as RewardState} />
            </motion.div>
          ))}
        </div>
        <div className="mt-4 flex items-start gap-2 rounded-[14px] bg-airtel-surface p-3 text-[12.5px] leading-[18px] text-airtel-sub">
          {c.icon}
          <span>{credited ? "Rewards have been credited to both Airtel accounts." : "Both of you can track this in the app."}</span>
        </div>
      </ScreenBody>
      <div className="space-y-2 px-5 pb-[34px]">
        <Button size="lg" block onClick={() => resetTo("b_home")}>
          Back to Home
        </Button>
        <Button size="lg" block variant="outline" onClick={() => setJourney("A")}>
          See {REFERRER.first}'s view (User A)
        </Button>
      </div>
    </Screen>
  );
}
