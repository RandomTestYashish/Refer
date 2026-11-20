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

const COINS = [
  { img: "coin-tilted.png", x: 22, y: 128, s: 34, r: -18, blur: 0, d: 0 },
  { img: "coin-gold.png", x: 312, y: 112, s: 26, r: 14, blur: 0, d: 0.8 },
  { img: "coin-gold.png", x: 58, y: 206, s: 16, r: 22, blur: 1.2, d: 1.4 },
  { img: "coin-tilted.png", x: 300, y: 196, s: 20, r: -26, blur: 0.8, d: 0.4 },
  { img: "coin-gold.png", x: 8, y: 318, s: 22, r: -8, blur: 1.6, d: 1.1 },
  { img: "coin-tilted.png", x: 340, y: 300, s: 24, r: 20, blur: 1.4, d: 1.8 },
];
const SPARKS = [
  { x: 92, y: 104, s: 10, d: 0 },
  { x: 268, y: 98, s: 12, d: 0.9 },
  { x: 40, y: 262, s: 8, d: 1.6 },
  { x: 330, y: 250, s: 10, d: 0.5 },
  { x: 150, y: 96, s: 7, d: 2.1 },
  { x: 236, y: 196, s: 8, d: 1.2 },
];

function HeroBackdrop({ reduce }: { reduce: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {/* sunburst behind the coin stack */}
      <motion.div
        className="absolute left-1/2 top-[172px] size-[520px] [mask-image:radial-gradient(closest-side,#000_0%,rgba(0,0,0,0.5)_45%,transparent_75%)]"
        style={{
          x: "-50%",
          y: "-50%",
          background: "repeating-conic-gradient(from 0deg, rgba(255,214,120,0.38) 0deg 7deg, rgba(255,214,120,0) 7deg 18deg)",
        }}
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
      />
      {/* warm glow */}
      <div className="absolute left-1/2 top-[110px] h-[160px] w-[260px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,236,186,0.95),rgba(255,236,186,0))]" />
      {COINS.map((c, i) => (
        <motion.img
          key={i}
          src={home(c.img)}
          alt=""
          className="absolute select-none drop-shadow-[0_4px_6px_rgba(143,76,0,0.25)]"
          style={{ left: c.x, top: c.y, width: c.s, height: c.s, filter: c.blur ? `blur(${c.blur}px)` : undefined, rotate: c.r }}
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={reduce ? { opacity: 0.9 } : { opacity: c.blur ? 0.7 : 0.95, y: [0, -6, 0], rotate: [c.r, c.r + 8, c.r] }}
          transition={{ opacity: { duration: 0.6, delay: 0.3 + c.d * 0.2 }, y: { duration: 3.6 + i * 0.3, repeat: Infinity, ease: "easeInOut", delay: c.d }, rotate: { duration: 4.2 + i * 0.3, repeat: Infinity, ease: "easeInOut", delay: c.d } }}
        />
      ))}
      {SPARKS.map((p, i) => (
        <motion.img
          key={`s${i}`}
          src={home("hero-sparkle.svg")}
          alt=""
          className="absolute"
          style={{ left: p.x, top: p.y, width: p.s, height: p.s }}
          animate={reduce ? { opacity: 0.6 } : { opacity: [0, 1, 0], scale: [0.6, 1.1, 0.6] }}
          transition={{ duration: 2.4, repeat: Infinity, delay: p.d, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/** What each side gets — sits at the top of the sheet. */
export function OfferCard({ rules }: { rules: BusinessRules }) {
  return (
    <div className="relative grid grid-cols-[1fr_auto_1fr] items-stretch overflow-hidden rounded-[20px] border border-[#F3DDA3] bg-[linear-gradient(180deg,#FFFBF0,#FFFFFF)] shadow-[0_6px_18px_rgba(148,101,3,0.10)]">
      <div className="flex items-center gap-2.5 py-4 pl-4">
        <img src={home("coin-gold.png")} alt="" className="size-9 shrink-0" />
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[1px] text-[#946503]">You get</p>
          <p className="text-[20px] font-extrabold leading-6 text-[#292C31] tabular-nums">{inr(rules.referrerReward)}</p>
          <p className="text-[11px] leading-[14px] text-[#696B6F]">per referral</p>
        </div>
      </div>
      <div className="relative flex w-8 items-center justify-center" aria-hidden>
        <span className="absolute inset-y-3 left-1/2 border-l border-dashed border-[#EBCF8A]" />
        <span className="relative flex size-6 items-center justify-center rounded-full bg-[#FDF1D2] text-[14px] font-bold text-[#946503]">+</span>
      </div>
      <div className="flex items-center justify-end gap-2.5 py-4 pr-4 text-right">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[1px] text-[#946503]">Friend gets</p>
          <p className="text-[20px] font-extrabold leading-6 text-[#292C31] tabular-nums">
            {inr(rules.friendReward)} <span className="text-[15px]">+ {rules.friendDataGB} GB</span>
          </p>
          <p className="text-[11px] leading-[14px] text-[#696B6F]">on first recharge</p>
        </div>
      </div>
    </div>
  );
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

      {/* background elements: slow sunburst, drifting coins, twinkling sparkles */}
      <HeroBackdrop reduce={!!reduce} />

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
