import { motion, useReducedMotion } from "framer-motion";
import type { BusinessRules } from "@/config/businessRules";
import { Sparkle } from "@/components/app/refer/CoinArt";
import { home } from "@/assets/home";
import { inr } from "@/lib/utils";

/**
 * Refer & Earn banner, in the Airtel Points banner style:
 * Airtel gold coin in the centre with tilted coins scattered around (they drop in, bounce, then float),
 * and the amount set like the points balance — Inter Extra Bold Italic — with a light sweep and a soft zoom.
 */

export const HERO_HEIGHT = 440;

// Scattered tilted coins (positions follow the Airtel Points banner).
const SCATTER = [
  { x: 14, y: 132, w: 52, rot: -18, blur: 0.8, delay: 0.25 },
  { x: 312, y: 118, w: 42, rot: 16, blur: 0.8, delay: 0.35 },
  { x: 82, y: 214, w: 30, rot: -8, blur: 1.2, delay: 0.45 },
  { x: 284, y: 208, w: 44, rot: 10, blur: 0.4, delay: 0.55 },
  { x: 334, y: 262, w: 32, rot: -12, blur: 1.4, delay: 0.65 },
];

function Rings() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {[560, 440, 320].map((s) => (
        <span
          key={s}
          className="absolute left-1/2 rounded-full border border-white/60"
          style={{ width: s, height: s, top: 196 - s / 2, marginLeft: -s / 2 }}
        />
      ))}
    </div>
  );
}

export function PremiumHero({ rules }: { rules: BusinessRules }) {
  const reduce = useReducedMotion();
  const yearly = rules.referrerReward * rules.referralCapYear;
  const drop = (delay: number, from = -160) =>
    reduce
      ? {}
      : {
          initial: { y: from, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          transition: { delay, type: "spring" as const, stiffness: 240, damping: 12 },
        };
  const float = (delay: number, amp = 6, dur = 3.4) =>
    reduce ? {} : { animate: { y: [0, -amp, 0] }, transition: { duration: dur, repeat: Infinity, ease: "easeInOut" as const, delay } };

  return (
    <section
      aria-labelledby="hero-amount"
      className="relative overflow-hidden bg-[linear-gradient(180deg,#F8E4DD_0%,#FCEFEA_45%,#FBE7E1_100%)]"
      style={{ height: HERO_HEIGHT }}
    >
      <Rings />

      {/* scattered tilted coins */}
      {SCATTER.map((c, i) => (
        <motion.div key={i} className="absolute" style={{ left: c.x, top: c.y }} {...drop(c.delay, -220)}>
          <motion.img
            src={home("coin-tilted.png")}
            alt=""
            className="block"
            style={{ width: c.w, rotate: c.rot, filter: `blur(${c.blur}px)` }}
            {...float(1 + i * 0.4, 5, 3 + (i % 3) * 0.6)}
          />
        </motion.div>
      ))}

      <div className="relative flex h-full flex-col items-center pt-[108px]">
        {/* hero coin */}
        <div className="relative">
          <Sparkle className="-left-5 top-3" size={12} />
          <Sparkle className="-right-4 top-14" size={10} delay={0.9} color="#E0A33A" />
          <span className="absolute left-1/2 top-[70%] h-6 w-24 -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse,rgba(115,77,13,0.28),transparent_70%)]" />
          <motion.div {...drop(0.1, -260)}>
            <motion.img src={home("coin-gold.png")} alt="" className="relative block size-[96px] drop-shadow-[0_10px_18px_rgba(115,77,13,0.28)]" {...float(1.2, 6, 3.6)} />
          </motion.div>
        </div>

        {/* amount, points-balance style */}
        <motion.p
          className="mt-4 text-[13px] font-medium text-[#3E4146]"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Earn up to
        </motion.p>
        <motion.h1
          id="hero-amount"
          className="amount-shine -mr-2 px-2 text-[48px] font-extrabold italic leading-[60px] tracking-[-1.92px] tabular-nums"
          initial={reduce ? false : { opacity: 0, scale: 0.94 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, scale: [0.94, 1, 1, 1.05, 1] }}
          transition={reduce ? {} : { opacity: { delay: 0.55, duration: 0.3 }, scale: { delay: 0.55, duration: 4.2, times: [0, 0.12, 0.62, 0.8, 1], repeat: Infinity, repeatDelay: 0.6 } }}
        >
          {inr(yearly)}
        </motion.h1>
        <p className="text-[14px] font-medium text-[#3E4146]">every year, by referring friends</p>

        {/* key numbers */}
        <div className="mt-5 flex items-center gap-2.5 text-[12px] font-semibold text-[#3E4146]">
          <span className="rounded-full bg-white/80 px-3 py-1.5">{inr(rules.referrerReward)} for you</span>
          <span className="rounded-full bg-white/80 px-3 py-1.5">
            {inr(rules.friendReward)} + {rules.friendDataGB}GB for friend
          </span>
          <span className="rounded-full bg-white/80 px-3 py-1.5">Up to {rules.referralCapYear}</span>
        </div>
      </div>
    </section>
  );
}
