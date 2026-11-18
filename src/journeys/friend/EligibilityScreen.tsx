import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck, Check, Info, Loader2, ShieldAlert, UserCheck } from "lucide-react";
import { RewardCoin, Screen, SimNote } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { REFERRER } from "@/domain/data";
import { useProto, type EligibilityResult } from "@/store/useProto";
import { inr } from "@/lib/utils";

/** B04 — eligibility check across three user segments. */
export function EligibilityScreen() {
  const rules = useProto((s) => s.rules);
  const attributedOther = useProto((s) => s.bRun.attributedOther);
  const navigate = useProto((s) => s.navigate);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<EligibilityResult | null>(null);

  useEffect(() => {
    const t = [
      setTimeout(() => setStep(1), 600),
      setTimeout(() => setStep(2), 1200),
      setTimeout(() => setStep(3), 1800),
      setTimeout(() => setResult(useProto.getState().decideEligibility()), 2200),
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  const checks = ["Invitation link is valid", "Checking your Airtel account", "Checking previous recharges"];

  let view: { icon: JSX.Element; title: string; body: string; tone: "ok" | "info" | "no"; segment: string } | null = null;
  if (result) {
    const seg = { new: "New user", existing_no_txn: "Existing user · no qualifying transaction", existing_active: "Existing active user" }[result.segment];
    if (attributedOther)
      view = {
        icon: <Info />,
        tone: "info",
        segment: seg,
        title: "You're linked to another invite",
        body: `You opened another friend's invite first, so your referral is attributed to them. You can still claim your ${inr(rules.friendReward)} welcome reward.`,
      };
    else if (result.eligible)
      view =
        result.segment === "new"
          ? {
              icon: <BadgeCheck />,
              tone: "ok",
              segment: seg,
              title: "You're eligible!",
              body: `Complete your first recharge of ${inr(rules.minTransaction)}+ within ${rules.firstTxnDeadlineDays} days and you and ${REFERRER.first} both get ${inr(rules.friendReward)}.`,
            }
          : {
              icon: <UserCheck />,
              tone: "ok",
              segment: seg,
              title: "Welcome back — you're eligible",
              body: `You haven't made a qualifying transaction yet, so ${REFERRER.first}'s invite counts. Recharge ${inr(rules.minTransaction)}+ within ${rules.firstTxnDeadlineDays} days to unlock ${inr(rules.friendReward)} each.`,
            };
    else
      view =
        result.reason === "existing_active"
          ? {
              icon: <ShieldAlert />,
              tone: "no",
              segment: seg,
              title: "Referral rewards aren't available",
              body: "You're already an active Airtel user with a previous qualifying recharge, so this invite can't unlock referral rewards. You can keep using Airtel as usual.",
            }
          : {
              icon: <ShieldAlert />,
              tone: "no",
              segment: seg,
              title: "Not eligible for this offer",
              body: "Your number already has an Airtel account. Under the current (provisional) rules, existing accounts aren't eligible for referral rewards.",
            };
  }

  return (
    <Screen>
      <div className="flex flex-1 flex-col items-center justify-center px-7 text-center">
        <AnimatePresence mode="wait">
          {!view ? (
            <motion.div key="checking" exit={{ opacity: 0, y: -10 }} className="flex w-full flex-col items-center">
              <motion.div className="relative" animate={{ rotate: [0, 360] }} transition={{ duration: 2.6, repeat: Infinity, ease: "linear" }}>
                <span className="block size-[88px] rounded-full border-[6px] border-airtel-red-soft border-t-airtel-red" />
              </motion.div>
              <h2 className="mt-7 text-title">Checking eligibility…</h2>
              <ul className="mt-6 w-full max-w-[270px] space-y-3 text-left">
                {checks.map((c, i) => (
                  <li key={c} className="flex items-center gap-2.5 text-[14px]">
                    {step > i ? (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex size-5 items-center justify-center rounded-full bg-airtel-success text-white">
                        <Check className="size-3" strokeWidth={4} />
                      </motion.span>
                    ) : (
                      <Loader2 className="size-5 animate-spin text-airtel-sub" />
                    )}
                    <span className={step > i ? "font-medium" : "text-airtel-sub"}>{c}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ) : (
            <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center">
              {view.tone === "ok" ? (
                <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 220, damping: 14 }}>
                  <RewardCoin amount={rules.friendReward} size={104} />
                </motion.div>
              ) : (
                <div className={`flex size-[84px] items-center justify-center rounded-full [&_svg]:size-10 ${view.tone === "info" ? "bg-[#EAF1FD] text-[#1F5FCC]" : "bg-airtel-surface text-airtel-sub"}`}>
                  {view.icon}
                </div>
              )}
              <span className="mt-6 rounded-full bg-airtel-surface px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-airtel-sub">{view.segment}</span>
              <h1 className="mt-3 text-display">{view.title}</h1>
              <p className="mt-2 text-[15px] leading-[22px] text-airtel-sub">{view.body}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="px-5 pb-[34px]">
        <Button size="lg" block disabled={!view} onClick={() => navigate("b_home")}>
          {view?.tone === "no" ? "Continue to Airtel" : "Start exploring"}
        </Button>
        <SimNote className="mt-3">Segment & rule are set in the panel (User type, Existing-user eligibility)</SimNote>
      </div>
    </Screen>
  );
}
