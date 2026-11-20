import { motion, useReducedMotion } from "framer-motion";
import type { BusinessRules } from "@/config/businessRules";
import { home } from "@/assets/home";
import { inr } from "@/lib/utils";

/**
 * Refer & Earn hero. One 3D illustration (gift box bursting with ₹ coins) on its own matching
 * blush background, and the yearly amount as the largest thing on the page:
 * Inter Extra Bold Italic with a light sweep and a soft, repeating zoom.
 */

export const HERO_BG = "#FDE6DE";
export const HERO_HEIGHT = 492;

export function PremiumHero({ rules }: { rules: BusinessRules }) {
  const reduce = useReducedMotion();
  const yearly = rules.referrerReward * rules.referralCapYear;

  return (
    <section aria-labelledby="hero-amount" className="relative overflow-hidden" style={{ height: HERO_HEIGHT, background: HERO_BG }}>
      {/* soft glow behind the illustration */}
      <span className="pointer-events-none absolute left-1/2 top-[70px] size-[330px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.85),rgba(255,255,255,0)_68%)]" aria-hidden />

      <div className="relative flex h-full flex-col items-center pt-[78px]">
        {/* illustration: pops in, then floats */}
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.86, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 210, damping: 16, delay: 0.05 }}
        >
          <motion.img
            src={home("refer-hero.jpg")}
            alt=""
            className="block h-[210px] w-[315px] object-cover [mask-image:radial-gradient(ellipse_at_center,#000_62%,transparent_76%)]"
            animate={reduce ? undefined : { y: [0, -7, 0] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
          />
        </motion.div>

        <motion.p
          className="mt-1 text-[14px] font-semibold text-[#5A3A32]"
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Refer friends and earn up to
        </motion.p>
        <motion.h1
          id="hero-amount"
          className="amount-shine -mr-2 px-2 text-[52px] font-extrabold italic leading-[60px] tracking-[-2px] tabular-nums"
          initial={reduce ? false : { opacity: 0, scale: 0.94 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, scale: [0.94, 1, 1, 1.05, 1] }}
          transition={reduce ? {} : { opacity: { delay: 0.4, duration: 0.3 }, scale: { delay: 0.4, duration: 4.2, times: [0, 0.12, 0.62, 0.8, 1], repeat: Infinity, repeatDelay: 0.6 } }}
        >
          {inr(yearly)}
        </motion.h1>
        <p className="text-[14px] font-medium text-[#5A3A32]">every year in Airtel cashback</p>

        <div className="mt-4 flex items-center rounded-full bg-white/75 px-1 py-1 text-[12px] font-semibold text-[#3E4146] shadow-[0_1px_0_rgba(255,255,255,0.8)_inset]">
          <span className="px-3 py-1">{inr(rules.referrerReward)} per friend</span>
          <span className="h-4 w-px bg-[#E8CFC6]" />
          <span className="px-3 py-1">Up to {rules.referralCapYear} friends</span>
        </div>
      </div>
    </section>
  );
}
