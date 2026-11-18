import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Info } from "lucide-react";
import { LinkButton, SectionTitle } from "@/components/app/gen4";
import { MilestoneMedal, MilestoneTrack } from "@/components/app/Milestones";
import type { BusinessRules, Milestone } from "@/config/businessRules";
import { inr } from "@/lib/utils";

/** The highest milestone reached for a given count of successful referrals. */
export function currentMilestone(milestones: Milestone[], count: number) {
  return [...milestones].reverse().find((m) => count >= m.target);
}

/**
 * Your Referral Progress — badge, cumulative earnings, progress to the next achievement.
 * Milestones are recognition only: no extra cash is promised for reaching them.
 */
export const ReferralProgress = forwardRef<
  HTMLElement,
  { rules: BusinessRules; successful: number; earned: number; onViewAll: () => void; onInvite: () => void }
>(({ rules, successful, earned, onViewAll, onInvite }, ref) => {
  const ms = rules.milestones;
  const current = currentMilestone(ms, successful);
  const next = ms.find((m) => successful < m.target);
  const prevTarget = current?.target ?? 0;
  const toNext = next ? next.target - successful : 0;
  const pct = next ? Math.max(4, ((successful - prevTarget) / (next.target - prevTarget)) * 100) : 100;

  return (
    <section ref={ref} aria-labelledby="progress-title" className="mt-8 px-4">
      <SectionTitle action={<LinkButton onClick={onViewAll}>View all</LinkButton>}>
        <span id="progress-title">your referral progress</span>
      </SectionTitle>
      <div className="relative mt-4 overflow-hidden rounded-[20px] border border-[#FFD5D7] bg-[linear-gradient(135deg,#FFF0F0_0%,#FFF8EE_100%)] shadow-[0_8px_24px_rgba(227,33,33,0.10)]">
        <span className="pointer-events-none absolute -right-10 -top-12 size-40 rounded-full border-[18px] border-white/60" />

        {/* Badge + earned so far */}
        <div className="relative flex items-center gap-3 px-4 pt-4">
          {current ? (
            <MilestoneMedal m={current} unlocked size={56} />
          ) : (
            <span className="flex size-14 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-[#FFC2C5] bg-white text-[11px] font-bold text-[#E32121]">
              Start
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[1.76px] text-[#E32121]">{current ? `${current.label} badge` : "No badge yet"}</p>
            <p className="text-[22px] font-bold leading-7 text-[#292C31] tabular">
              {inr(earned)} <span className="text-[13px] font-medium text-[#3E4146]">earned so far</span>
            </p>
            <p className="text-[12px] leading-4 text-[#3E4146]">
              {successful} successful {successful === 1 ? "referral" : "referrals"} completed
            </p>
          </div>
        </div>

        {/* Progress to the next achievement */}
        <div className="relative mx-4 mt-4 rounded-[14px] bg-white/80 p-3">
          {next ? (
            <>
              <div className="flex items-center justify-between text-[12px]">
                <span className="font-semibold text-[#292C31]">Next achievement: {next.label}</span>
                <span className="font-bold text-[#292C31] tabular">
                  {successful} / {next.target}
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#F0F4F9]">
                <motion.div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#FC5252,#E32121)]"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${pct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9 }}
                />
              </div>
              <p className="mt-2 text-[12px] text-[#3E4146]">
                <b>{toNext}</b> more successful {toNext === 1 ? "referral" : "referrals"} to unlock <b>{next.label}</b>.
              </p>
            </>
          ) : (
            <p className="text-[12px] font-semibold text-[#292C31]">You've unlocked every achievement. Keep referring to keep earning.</p>
          )}
          <div className="mt-4">
            <MilestoneTrack milestones={ms} count={successful} />
          </div>
        </div>

        {/* Motivation */}
        <div className="relative flex items-center gap-3 px-4 pb-4 pt-3">
          <p className="flex-1 text-[12.5px] leading-[17px] text-[#3E4146]">
            {successful === 0
              ? "Your first successful referral unlocks your first badge."
              : `You've already earned ${inr(earned)}. Keep referring to earn more.`}
          </p>
          <button onClick={onInvite} className="h-9 shrink-0 rounded-[10px] bg-black px-3.5 text-[13px] font-medium text-white active:bg-[#3E4146]">
            Invite
          </button>
        </div>
      </div>
      <p className="mt-2 flex gap-1.5 text-[11px] leading-[15px] text-[#696B6F]">
        <Info className="mt-px size-3 shrink-0" />
        Badges recognise your referrals. Thresholds are provisional, and badges don't carry extra cash rewards.
      </p>
    </section>
  );
});
ReferralProgress.displayName = "ReferralProgress";
