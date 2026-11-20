import { motion, useReducedMotion } from "framer-motion";
import type { BusinessRules } from "@/config/businessRules";
import { home } from "@/assets/home";
import { inr } from "@/lib/utils";

/**
 * Refer a friend header (Figma "Page 48", node 81697:10660):
 * warm gold wash, coin stack, "EARN UP TO", a big extruded gold ₹5,000 and "PER YEAR".
 * Light motion only: coins float in, the amount pops and a glint sweeps across it.
 */

export const HERO_HEIGHT = 432;

const AMOUNT_GRADIENT =
  "linear-gradient(74.27deg, #906409 5.69%, #FFBB2C 6.15%, #FCD991 52.17%, #FFBB2C 88.56%, #7D5500 114.71%)";

function Sparkle({ left }: { left: number }) {
  return <img src={home("hero-sparkle.svg")} alt="" aria-hidden className="absolute top-[240px] h-[9.01px] w-[9.008px]" style={{ left }} />;
}

export function GoldHero({ rules }: { rules: BusinessRules }) {
  const reduce = useReducedMotion();
  const yearly = inr(rules.referrerReward * rules.referralCapYear);
  return (
    <section aria-labelledby="hero-amount" className="relative overflow-hidden bg-white" style={{ height: HERO_HEIGHT }}>
      {/* gold wash (Figma "Image": #F8E7B7 → white) */}
      <div className="absolute inset-x-0 top-0 h-[556px] bg-[linear-gradient(180deg,#F8E7B7_23.5%,#FFFFFF_94.6%)]" aria-hidden />
      {/* soft arc behind the copy */}
      <div className="absolute left-[-28px] top-[187px] h-[209px] w-[419px]" aria-hidden>
        <img src={home("hero-arc.svg")} alt="" className="absolute left-[-0.95%] top-[-1.91%] block h-[103.82%] w-[101.9%] max-w-none" />
      </div>

      {/* coin stack */}
      <motion.div
        className="absolute left-[calc(50%+0.5px)] top-[121px] h-[101px] w-[170px]"
        style={{ x: "-50%" }}
        initial={reduce ? false : { opacity: 0, y: -14, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden
      >
        <motion.div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          animate={reduce ? undefined : { y: [0, -4, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        >
          <img src={home("hero-coins.png")} alt="" className="absolute left-[-60.24%] top-[-58.42%] h-[464.36%] w-[222.24%] max-w-none" />
        </motion.div>
      </motion.div>

      <h1 id="hero-amount" className="absolute inset-x-0 top-0">
        {/* EARN UP TO with sparkles */}
        <Sparkle left={115} />
        <span className="absolute left-[calc(50%-0.5px)] top-[227.46px] h-[34px] w-[102px] -translate-x-1/2 whitespace-nowrap text-center text-[14px] font-medium uppercase leading-[32.3px] tracking-[2px] text-[#946503]">
          Earn up to
        </span>
        <Sparkle left={251} />

        {/* ₹5,000 — dark extrude layer + gold face */}
        <motion.span
          className="absolute left-[186.5px] top-[255.39px] block h-[103px] w-[285px]"
          style={{ x: "-50%" }}
          initial={reduce ? false : { scale: 0.86, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.15 }}
        >
          <span aria-hidden className="absolute left-1/2 top-[9.61px] -translate-x-1/2 whitespace-nowrap text-center text-[76.354px] font-black uppercase italic leading-[normal] text-[#8F4C00]">
            {yearly}
          </span>
          <span
            className="absolute left-1/2 top-0 w-[285px] -translate-x-1/2 bg-clip-text text-center text-[76.354px] font-black uppercase italic leading-[normal] text-transparent"
            style={{ backgroundImage: AMOUNT_GRADIENT }}
          >
            {yearly}
          </span>
          {/* glint */}
          {!reduce && <span aria-hidden className="gold-glint absolute left-1/2 top-0 w-[285px] -translate-x-1/2 text-center text-[76.354px] font-black uppercase italic leading-[normal]">{yearly}</span>}
        </motion.span>

        {/* PER YEAR with fading rules */}
        <span className="absolute left-1/2 top-[371.32px] h-[2.118px] w-[96px] -translate-x-[calc(50%+100.5px)] bg-[linear-gradient(90deg,rgba(253,231,159,0),#F3C563)]" aria-hidden />
        <span className="absolute left-1/2 top-[365.52px] h-[18px] w-[81px] -translate-x-1/2 whitespace-nowrap text-center text-[14px] font-medium uppercase leading-[normal] tracking-[2px] text-[#906409]">Per year</span>
        <span className="absolute left-1/2 top-[371.32px] h-[2.118px] w-[87px] translate-x-[calc(-50%+105px)] bg-[linear-gradient(270deg,rgba(253,231,159,0),#F3C563)]" aria-hidden />
      </h1>
    </section>
  );
}
