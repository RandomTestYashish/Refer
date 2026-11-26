import { motion } from "framer-motion";
import { AppBar, Screen, ScreenBody, ScreenFooter } from "@/components/app/primitives";
import { MilestoneCollection, monthName, useMilestones } from "@/components/refer/MilestoneCollection";
import { rewardLabel } from "@/components/refer/AchievementBadge";
import { Button } from "@/components/ui/button";
import { useProto } from "@/store/useProto";

/** A03 — Milestones: this month's collectible badges with tier details. */
export function MilestonesScreen() {
  const granted = useProto((s) => s.contactsGranted);
  const navigate = useProto((s) => s.navigate);
  const { ms, count } = useMilestones();
  const next = ms.find((m) => count < m.target);

  return (
    <Screen>
      <AppBar title="Milestones" />
      <ScreenBody className="px-5 pb-6">
        <div className="relative overflow-hidden rounded-[22px] bg-[#17181D] p-5 text-white">
          <span className="absolute -right-10 -top-10 size-40 rounded-full border border-white/10" aria-hidden />
          <p className="text-[12px] text-white/60">Successful referrals in {monthName()}</p>
          <motion.p key={count} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-[40px] font-extrabold leading-none tracking-[-0.04em] tabular">
            {count}
          </motion.p>
          <p className="mt-2 text-[13px] text-white/70">
            {next ? `${next.target - count} more to reach ${next.label} · ${rewardLabel(next)}` : "You've reached Platinum, the highest tier this month."}
          </p>
        </div>
        <MilestoneCollection className="mt-5" />
      </ScreenBody>
      <ScreenFooter>
        <Button size="lg" block onClick={() => navigate(granted ? "a_contacts" : "a_permission")}>
          Invite Friends
        </Button>
      </ScreenFooter>
    </Screen>
  );
}
