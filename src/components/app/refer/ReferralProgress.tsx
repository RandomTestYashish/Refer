import { forwardRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { MilestoneTrack } from "@/components/app/Milestones";
import type { BusinessRules, Milestone } from "@/config/businessRules";
import { home } from "@/assets/home";
import { inr } from "@/lib/utils";

/** The highest milestone reached for a given count of successful referrals. */
export function currentMilestone(milestones: Milestone[], count: number) {
  return [...milestones].reverse().find((m) => count >= m.target);
}

export const MILESTONE_BG = "#161034";

/**
 * Referral milestones — its own banner identity (deep indigo + gold medals) so it reads
 * as an achievement track, separate from the blush earn hero.
 * Badges are recognition only: no extra cash is promised for reaching them.
 */
export const ReferralProgress = forwardRef<
  HTMLElement,
  { rules: BusinessRules; successful: number; earned: number; onViewAll: () => void; onInvite: () => void }
>(({ rules, successful, earned, onViewAll, onInvite }, ref) => {
  const reduce = useReducedMotion();
  const ms = rules.milestones;
  const current = currentMilestone(ms, successful);
  const next = ms.find((m) => successful < m.target);
  const toNext = next ? next.target - successful : 0;
  const title = current ? `${current.label === "First referral" ? "First" : current.label} badge unlocked` : "Win your first badge";

  return (
    <section ref={ref} aria-labelledby="progress-title" className="px-4 pt-8">
      <div className="relative overflow-hidden rounded-[20px] text-white shadow-[0_12px_28px_rgba(22,16,52,0.28)]" style={{ background: MILESTONE_BG }}>
        {/* banner art */}
        <div className="relative h-[150px]">
          <motion.img
            src={home("refer-milestone.jpg")}
            alt=""
            className="absolute -right-12 top-1 h-[140px] w-[210px] object-cover [mask-image:linear-gradient(90deg,transparent_4%,#000_34%)]"
            initial={reduce ? false : { opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
          <div className="relative flex h-full max-w-[58%] flex-col justify-center pl-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#FFCB5C]">Referral milestones</p>
            <h2 id="progress-title" className="mt-1.5 text-[20px] font-extrabold leading-6">
              {title}
            </h2>
            <p className="mt-1.5 text-[12px] leading-4 text-white/70">
              {successful} successful · {inr(earned)} earned
            </p>
          </div>
        </div>

        {/* coin stepper */}
        <div className="px-4 pb-4 pt-1">
          <div className="rounded-[16px] bg-white/[0.06] px-2 pb-3 pt-4 ring-1 ring-white/10">
            <MilestoneTrack milestones={ms} count={successful} dark />
          </div>

          <p className="mt-3 text-center text-[13px] text-white/80">
            {next ? (
              <>
                <b className="text-white">{toNext} more</b> {toNext === 1 ? "friend" : "friends"} to unlock <b className="text-[#FFCB5C]">{next.label}</b>
              </>
            ) : (
              "Every badge unlocked. Keep referring to keep earning."
            )}
          </p>

          <div className="mt-3 flex gap-2">
            <button onClick={onInvite} className="h-11 flex-1 rounded-[12px] bg-[linear-gradient(180deg,#FFD873,#F2B330)] text-[14px] font-bold text-[#2A1A00] active:brightness-95">
              Invite To Level Up
            </button>
            <button onClick={onViewAll} className="flex h-11 items-center gap-0.5 rounded-[12px] px-3 text-[14px] font-semibold text-white ring-1 ring-white/25 active:bg-white/10">
              All Badges <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
      <p className="mt-2 px-1 text-[11px] leading-[15px] text-[#696B6F]">Badges recognise your referrals and don't carry extra cash.</p>
    </section>
  );
});
ReferralProgress.displayName = "ReferralProgress";
