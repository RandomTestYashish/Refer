import { motion, useReducedMotion } from "framer-motion";
import type { BusinessRules } from "@/config/businessRules";
import { RewardCoin } from "@/components/app/primitives";
import { ScratchCard } from "@/components/app/refer/ScratchCard";
import { home } from "@/assets/home";

/**
 * Refer & Earn hero — the red illustrated stage (megaphone, friends, ₹ coins that drop and float)
 * with an interactive scratch card that reveals the yearly earning potential.
 */

export const HERO_BG = "#FFE3E3";
export const HERO_HEIGHT = 478;

const COINS = [
  { x: 6, y: 64, size: 44, delay: 0.35, float: 3.2 },
  { x: 262, y: 6, size: 38, delay: 0.5, float: 3.8 },
  { x: 284, y: 104, size: 30, delay: 0.65, float: 2.9 },
  { x: 108, y: -4, size: 26, delay: 0.8, float: 3.5 },
];

export function PremiumHero({ rules }: { rules: BusinessRules }) {
  const reduce = useReducedMotion();
  const yearly = rules.referrerReward * rules.referralCapYear;

  return (
    <section
      aria-label="Refer and earn"
      className="relative overflow-hidden bg-[linear-gradient(180deg,#FFD9D9_0%,#FFE9E4_55%,#FFF3EF_100%)]"
      style={{ height: HERO_HEIGHT }}
    >
      {/* rings */}
      <div className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(180deg,transparent_0%,black_30%,black_70%,transparent_100%)]" aria-hidden>
        <span className="absolute left-1/2 top-[20px] size-[380px] -translate-x-1/2 rounded-full border-[28px] border-white/45" />
        <span className="absolute left-1/2 top-[96px] size-[228px] -translate-x-1/2 rounded-full border-[22px] border-white/50" />
      </div>

      <div className="relative pt-[96px]">
        {/* Stage */}
        <div className="relative mx-auto h-[158px] w-[330px]" aria-hidden>
          <motion.img
            src={home("tile-refer.png")}
            alt=""
            className="absolute left-[56px] top-[18px] h-[132px] w-[220px] object-contain drop-shadow-[0_14px_18px_rgba(150,20,30,0.18)]"
            initial={reduce ? false : { scale: 0.85, opacity: 0, rotate: -6 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 160, damping: 14 }}
          />
          {[
            { img: "avatar-1.jpg", cls: "left-[40px] top-[0px]", s: 40 },
            { img: "avatar-3.jpg", cls: "right-[80px] top-[118px]", s: 36 },
          ].map(({ img, cls, s: size }, i) => (
            <motion.span
              key={img}
              className={`absolute ${cls} rounded-full shadow-[0_6px_14px_rgba(0,0,0,0.12)] ring-[3px] ring-white`}
              initial={reduce ? false : { scale: 0 }}
              animate={reduce ? {} : { scale: 1, y: [0, -5, 0] }}
              transition={{ scale: { delay: 0.15 + i * 0.08, type: "spring" }, y: { duration: 3.4, repeat: Infinity, delay: i * 0.6 } }}
            >
              <img src={home(img)} alt="" className="block rounded-full object-cover" style={{ width: size, height: size }} />
            </motion.span>
          ))}
          {COINS.map((c, i) => (
            <motion.span
              key={i}
              className="absolute"
              style={{ left: c.x, top: c.y }}
              initial={reduce ? false : { y: -90, opacity: 0, rotate: -25 }}
              animate={reduce ? {} : { y: [-90, 0, -6, 0], opacity: [0, 1, 1, 1], rotate: [-25, 0, 4, 0] }}
              transition={{ delay: c.delay, duration: 1.1, ease: [0.22, 1, 0.36, 1], times: [0, 0.55, 0.8, 1] }}
            >
              <motion.span
                className="block"
                animate={reduce ? {} : { y: [0, -5, 0] }}
                transition={{ duration: c.float, repeat: Infinity, ease: "easeInOut", delay: c.delay + 1.1 }}
              >
                <RewardCoin amount={rules.referrerReward} size={c.size} />
              </motion.span>
            </motion.span>
          ))}
        </div>

        {/* Interactive scratch card */}
        <motion.div
          className="mt-3"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, type: "spring", stiffness: 200, damping: 20 }}
        >
          <ScratchCard amount={yearly} perFriend={rules.referrerReward} />
        </motion.div>

        <p className="mt-4 text-center text-[12px] font-medium text-[#6B3A33]">
          Up to {rules.referralCapYear} friends a year · {rules.referralCapMonth} a month
        </p>
      </div>
    </section>
  );
}
