import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Loader2, Lock } from "lucide-react";
import { RewardCoin, Screen } from "@/components/app/primitives";
import { Confetti } from "@/components/app/Confetti";
import { MilestoneTrack } from "@/components/app/Milestones";
import { CARD } from "@/components/app/gen4";
import { Button } from "@/components/ui/button";
import { referralStats, useProto } from "@/store/useProto";
import { inr } from "@/lib/utils";

export function UnlockedScreen({ params }: { params?: Record<string, string> }) {
  const r = useProto((s) => s.referrals.find((x) => x.id === params?.id));
  const rules = useProto((s) => s.rules);
  const referrals = useProto((s) => s.referrals);
  const past = useProto((s) => s.pastSuccesses);
  const resetTo = useProto((s) => s.resetTo);
  const navigate = useProto((s) => s.navigate);
  const [phase, setPhase] = useState(0); // 0 locked → 1 unlocking → 2 unlocked/processing → 3 credited
  const stats = referralStats(referrals, past, rules.referrerReward);
  const credited = r?.rewardA === "credited";

  useEffect(() => {
    const t = [setTimeout(() => setPhase(1), 600), setTimeout(() => setPhase(2), 1300), setTimeout(() => setPhase(3), 2600)];
    return () => t.forEach(clearTimeout);
  }, []);

  const first = r?.name.split(" ")[0] ?? "Your friend";
  const nextM = rules.milestones.find((m) => stats.milestoneCount < m.target);
  const justUnlocked = rules.milestones.find((m) => m.target === stats.milestoneCount);

  return (
    <Screen className="relative overflow-hidden bg-gradient-to-b from-[#F0F4F9] via-white to-white">
      {phase >= 2 && <Confetti originY="26%" />}
      <div className="flex flex-1 flex-col items-center px-7 pt-14 text-center">
        <div className="relative flex h-[170px] items-center justify-center">
          <motion.div
            className="absolute size-[170px] rounded-full bg-[radial-gradient(circle,rgba(245,179,0,0.35),transparent_65%)]"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={phase >= 2 ? { scale: [0.6, 1.25, 1], opacity: 1 } : {}}
            transition={{ duration: 0.8 }}
          />
          <motion.div
            animate={phase === 0 ? { rotate: [0, -6, 6, -4, 4, 0] } : phase === 1 ? { scale: [1, 0.9, 1.15], rotateY: [0, 180, 360] } : { scale: 1 }}
            transition={{ duration: phase === 1 ? 0.7 : 0.5 }}
          >
            <RewardCoin amount={rules.referrerReward} size={128} locked={phase < 2} />
          </motion.div>
          <AnimatePresence>
            {phase < 1 && (
              <motion.span
                exit={{ y: 60, rotate: 40, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute bottom-3 right-1 flex size-11 items-center justify-center rounded-full border-4 border-white bg-airtel-ink text-white"
              >
                <Lock className="size-4" />
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
          {phase < 2 ? (
            <motion.p key="u" exit={{ opacity: 0 }} className="mt-8 text-[15px] font-semibold text-airtel-sub">
              Unlocking your reward…
            </motion.p>
          ) : (
            <motion.div key="d" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mt-6">
              <h1 className="text-display">{inr(rules.referrerReward)} unlocked!</h1>
              <p className="mt-2 text-[15px] leading-[22px] text-airtel-sub">
                {first} completed their first eligible recharge. You and {first} each earn {inr(rules.referrerReward)}.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {phase >= 2 && (
          <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }} className="mt-5 flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-card">
            {phase < 3 || !credited ? (
              <>
                <Loader2 className="size-4 animate-spin text-airtel-warning" />
                <span className="text-[13px] font-semibold">Processing reward…</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="size-4 text-airtel-success" />
                <span className="text-[13px] font-semibold">Credited to your Airtel account</span>
              </>
            )}
          </motion.div>
        )}

        {phase >= 2 && (
          <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className={`mt-8 w-full rounded-[16px] p-4 pt-3 text-left ${CARD}`}>
            <p className="mb-5 text-[13px] font-bold">
              {justUnlocked ? `🎉 ${justUnlocked.label} milestone unlocked!` : "Milestone progress"}
            </p>
            <MilestoneTrack milestones={rules.milestones} count={stats.milestoneCount} />
            {nextM && (
              <p className="mt-3 text-center text-[12px] text-airtel-sub">
                {nextM.target - stats.milestoneCount} more to reach {nextM.label}
              </p>
            )}
          </motion.div>
        )}
      </div>
      <div className="space-y-2 px-5 pb-[34px]">
        <Button size="lg" block onClick={() => resetTo("a_dashboard")}>
          View My Referrals
        </Button>
        <Button size="lg" block variant="outline" onClick={() => navigate("a_contacts")}>
          Invite More Friends
        </Button>
      </div>
    </Screen>
  );
}
