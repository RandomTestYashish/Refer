import { motion } from "framer-motion";
import { Info } from "lucide-react";
import { AppBar, Screen, ScreenBody, ScreenFooter } from "@/components/app/primitives";
import { MilestoneMedal } from "@/components/app/Milestones";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { referralStats, useProto } from "@/store/useProto";

export function MilestonesScreen() {
  const rules = useProto((s) => s.rules);
  const referrals = useProto((s) => s.referrals);
  const past = useProto((s) => s.pastSuccesses);
  const granted = useProto((s) => s.contactsGranted);
  const navigate = useProto((s) => s.navigate);
  const { milestoneCount } = referralStats(referrals, past, rules.referrerReward);

  return (
    <Screen>
      <AppBar title="Milestones" />
      <ScreenBody className="px-5 pb-6">
        <div className="rounded-[22px] bg-airtel-ink p-5 text-white">
          <p className="text-[12px] text-white/60">Successful referrals</p>
          <motion.p key={milestoneCount} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-[40px] font-extrabold leading-none tracking-[-0.04em] tabular">
            {milestoneCount}
          </motion.p>
          <p className="mt-2 text-[13px] text-white/70">Each friend who completes a qualifying recharge moves you up a level.</p>
        </div>

        <div className="mt-5 space-y-3">
          {rules.milestones.map((m, i) => {
            const prev = i === 0 ? 0 : rules.milestones[i - 1].target;
            const unlocked = milestoneCount >= m.target;
            const pct = unlocked ? 100 : Math.max(0, ((milestoneCount - prev) / (m.target - prev)) * 100);
            const current = !unlocked && milestoneCount >= prev;
            return (
              <motion.div
                key={m.id}
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.06 }}
                className={`rounded-[18px] border p-4 ${current ? "border-airtel-red/30 bg-airtel-red-soft/40" : "border-airtel-line"}`}
              >
                <div className="flex items-center gap-3.5">
                  <MilestoneMedal m={m} unlocked={unlocked} size={48} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[15px] font-bold">{m.label}</p>
                      {unlocked ? <Badge variant="success">Unlocked</Badge> : current ? <Badge variant="soft">In progress</Badge> : <Badge variant="neutral">Locked</Badge>}
                    </div>
                    <p className="text-[12.5px] text-airtel-sub">
                      {m.target} successful {m.target === 1 ? "referral" : "referrals"}
                    </p>
                  </div>
                  <span className="text-[13px] font-semibold tabular text-airtel-sub">
                    {Math.min(milestoneCount, m.target)}/{m.target}
                  </span>
                </div>
                <Progress value={pct} className="mt-3 h-1.5" indicatorClassName={unlocked ? "bg-airtel-success" : undefined} />
                <p className="mt-2.5 text-[12px] text-airtel-sub">
                  {m.id === "first"
                    ? `Your first ₹${rules.referrerReward} referral reward.`
                    : "Milestone benefit to be announced."}
                </p>
              </motion.div>
            );
          })}
        </div>
        <p className="mt-4 flex gap-2 text-[11.5px] leading-[16px] text-airtel-sub">
          <Info className="mt-px size-3.5 shrink-0" />
          Milestone levels are part of the proposal. Additional milestone rewards are not yet confirmed and are intentionally not shown.
        </p>
      </ScreenBody>
      <ScreenFooter>
        <Button size="lg" block onClick={() => navigate(granted ? "a_contacts" : "a_permission")}>
          Invite friends
        </Button>
      </ScreenFooter>
    </Screen>
  );
}
