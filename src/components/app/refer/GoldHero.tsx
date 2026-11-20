import { motion, useReducedMotion } from "framer-motion";
import type { BusinessRules } from "@/config/businessRules";
import { home } from "@/assets/home";
import { inr } from "@/lib/utils";

/**
 * Refer a friend header — ember theme (layout from Figma "Page 48", node 81697:10660):
 * deep ember gradient, glowing coin stack, rising ember sparks, and a tight
 * "EARN UP TO / ₹5,000 / PER YEAR" type block. The amount pops in and a glint sweeps across it.
 */

export const HERO_HEIGHT = 376;

const AMOUNT_GRADIENT = "linear-gradient(74deg, #B8320F 4%, #FF7A2F 18%, #FFD9A8 52%, #FF8A3D 82%, #C2410C 110%)";

function Sparkle() {
  return <img src={home("hero-sparkle.svg")} alt="" aria-hidden className="h-[9px] w-[9px] [filter:hue-rotate(-25deg)_saturate(1.6)]" />;
}

const COINS = [
  { img: "coin-tilted.png", x: 20, y: 118, s: 30, r: -18, blur: 0, d: 0 },
  { img: "coin-gold.png", x: 318, y: 108, s: 24, r: 14, blur: 0, d: 0.8 },
  { img: "coin-gold.png", x: 10, y: 270, s: 18, r: -8, blur: 1.4, d: 1.1 },
  { img: "coin-tilted.png", x: 340, y: 254, s: 20, r: 20, blur: 1.2, d: 1.8 },
];
// Ember particles that rise and fade
const EMBERS = Array.from({ length: 16 }, (_, i) => ({
  x: (i * 53 + 17) % 360 + 6,
  s: 2 + ((i * 7) % 4),
  d: (i * 0.37) % 4,
  t: 4.5 + ((i * 13) % 30) / 10,
  c: i % 3 === 0 ? "#FFD27A" : i % 3 === 1 ? "#FF8A3D" : "#FF5A1F",
}));

function HeroBackdrop({ reduce }: { reduce: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {/* sunburst behind the coin stack */}
      <motion.div
        className="absolute left-1/2 top-[160px] size-[560px] [mask-image:radial-gradient(closest-side,#000_0%,rgba(0,0,0,0.45)_45%,transparent_75%)]"
        style={{
          x: "-50%",
          y: "-50%",
          background: "repeating-conic-gradient(from 0deg, rgba(255,122,47,0.22) 0deg 6deg, rgba(255,122,47,0) 6deg 18deg)",
        }}
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
      />
      {/* ember glow */}
      <motion.div
        className="absolute left-1/2 top-[86px] h-[220px] w-[320px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,106,43,0.55),rgba(255,106,43,0))]"
        animate={reduce ? undefined : { opacity: [0.75, 1, 0.75] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      />
      {COINS.map((c, i) => (
        <motion.img
          key={i}
          src={home(c.img)}
          alt=""
          className="absolute select-none drop-shadow-[0_4px_10px_rgba(255,106,43,0.35)]"
          style={{ left: c.x, top: c.y, width: c.s, height: c.s, filter: c.blur ? `blur(${c.blur}px)` : undefined, rotate: c.r }}
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={reduce ? { opacity: 0.85 } : { opacity: c.blur ? 0.6 : 0.95, y: [0, -6, 0], rotate: [c.r, c.r + 8, c.r] }}
          transition={{ opacity: { duration: 0.6, delay: 0.3 + c.d * 0.2 }, y: { duration: 3.6 + i * 0.3, repeat: Infinity, ease: "easeInOut", delay: c.d }, rotate: { duration: 4.2 + i * 0.3, repeat: Infinity, ease: "easeInOut", delay: c.d } }}
        />
      ))}
      {!reduce &&
        EMBERS.map((e, i) => (
          <motion.span
            key={`e${i}`}
            className="absolute rounded-full"
            style={{ left: e.x, top: 360, width: e.s, height: e.s, background: e.c, boxShadow: `0 0 ${e.s * 3}px ${e.c}` }}
            animate={{ y: [0, -300], x: [0, i % 2 ? 14 : -14, 0], opacity: [0, 1, 0] }}
            transition={{ duration: e.t, repeat: Infinity, delay: e.d, ease: "easeOut" }}
          />
        ))}
    </div>
  );
}

/** What each side gets — sits at the top of the sheet. */
export function OfferCard({ rules }: { rules: BusinessRules }) {
  return (
    <div className="relative grid grid-cols-[1fr_auto_1fr] items-stretch overflow-hidden rounded-[20px] border border-[#F6CDB4] bg-[linear-gradient(180deg,#FFF5EE,#FFFFFF)] shadow-[0_6px_18px_rgba(194,65,12,0.10)]">
      <div className="flex items-center gap-2.5 py-4 pl-4">
        <img src={home("coin-gold.png")} alt="" className="size-9 shrink-0" />
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[1px] text-[#C2410C]">You get</p>
          <p className="text-[20px] font-extrabold leading-6 text-[#292C31] tabular-nums">{inr(rules.referrerReward)}</p>
          <p className="text-[11px] leading-[14px] text-[#696B6F]">per referral</p>
        </div>
      </div>
      <div className="relative flex w-8 items-center justify-center" aria-hidden>
        <span className="absolute inset-y-3 left-1/2 border-l border-dashed border-[#F3B48E]" />
        <span className="relative flex size-6 items-center justify-center rounded-full bg-[#FFE6D6] text-[14px] font-bold text-[#C2410C]">+</span>
      </div>
      <div className="flex items-center justify-end gap-2.5 py-4 pr-4 text-right">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[1px] text-[#C2410C]">Friend gets</p>
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
    <section aria-labelledby="hero-amount" className="relative overflow-hidden" style={{ height: HERO_HEIGHT, background: "linear-gradient(180deg,#1C0803 0%,#3A1006 45%,#7A2209 100%)" }}>
      <HeroBackdrop reduce={!!reduce} />

      {/* coin stack */}
      <motion.div
        className="absolute left-1/2 top-[100px] h-[101px] w-[170px]"
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

      {/* Tight type block: EARN UP TO / ₹5,000 / PER YEAR */}
      <h1 id="hero-amount" className="absolute inset-x-0 top-[206px] flex flex-col items-center">
        <span className="flex items-center gap-2 text-[12px] font-semibold uppercase leading-[14px] tracking-[0.18em] text-[#FFB27A]">
          <Sparkle /> Earn up to <Sparkle />
        </span>
        <motion.span
          className="relative mt-1 block"
          initial={reduce ? false : { scale: 0.86, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.15 }}
        >
          <span aria-hidden className="absolute inset-x-0 top-[5px] whitespace-nowrap text-center text-[82px] font-black italic leading-[78px] tracking-[-0.055em] text-[#3A0E03]">
            {yearly}
          </span>
          <span className="relative block whitespace-nowrap bg-clip-text px-1 text-center text-[82px] font-black italic leading-[78px] tracking-[-0.055em] text-transparent" style={{ backgroundImage: AMOUNT_GRADIENT }}>
            {yearly}
          </span>
          {!reduce && (
            <span aria-hidden className="gold-glint absolute inset-x-0 top-0 whitespace-nowrap px-1 text-center text-[82px] font-black italic leading-[78px] tracking-[-0.055em]">
              {yearly}
            </span>
          )}
        </motion.span>
        <span className="mt-1.5 flex items-center gap-2.5 text-[12px] font-semibold uppercase leading-[14px] tracking-[0.18em] text-[#FFB27A]">
          <span className="h-px w-14 bg-[linear-gradient(90deg,rgba(255,138,61,0),#FF8A3D)]" aria-hidden />
          Per year
          <span className="h-px w-14 bg-[linear-gradient(270deg,rgba(255,138,61,0),#FF8A3D)]" aria-hidden />
        </span>
      </h1>
    </section>
  );
}
