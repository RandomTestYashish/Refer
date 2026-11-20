import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";
import { MilestoneMedal } from "@/components/app/Milestones";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { Milestone } from "@/config/businessRules";
import { inr } from "@/lib/utils";

/** Short achievement moment: badge reveal, cumulative earnings, next achievement, optional invite. */
export function MilestoneUnlockSheet({
  open,
  onOpenChange,
  badge,
  next,
  successful,
  earned,
  onInvite,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  badge?: Milestone;
  next?: Milestone;
  successful: number;
  earned: number;
  onInvite: () => void;
}) {
  if (!badge) return null;
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader className="items-center pt-6 text-center">
          <motion.div
            initial={{ scale: 0.3, rotate: -30, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.1 }}
            className="relative mb-2"
          >
            <span className="absolute inset-[-14px] rounded-full bg-[radial-gradient(circle,rgba(252,82,82,0.25),transparent_70%)]" />
            <MilestoneMedal m={badge} unlocked size={84} />
          </motion.div>
          <p className="text-[11px] font-bold uppercase tracking-[1.76px] text-[#E32121]">Achievement unlocked</p>
          <SheetTitle className="text-center text-[22px]">{badge.label} badge</SheetTitle>
          <SheetDescription className="text-center text-[14px] leading-[20px]">
            {successful} successful {successful === 1 ? "referral" : "referrals"} · {inr(earned)} earned so far.
            {next ? ` ${next.target - successful} more to reach ${next.label}.` : " You've unlocked every achievement."}
          </SheetDescription>
        </SheetHeader>
        <div className="px-5 pb-[34px] pt-5">
          <Button
            size="lg"
            block
            onClick={() => {
              onOpenChange(false);
              onInvite();
            }}
          >
            <UserPlus /> Invite Friends
          </Button>
          <Button block variant="ghost" className="mt-1" onClick={() => onOpenChange(false)}>
            Not Now
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
