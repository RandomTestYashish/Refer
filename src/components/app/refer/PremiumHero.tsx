import { useEffect } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import type { BusinessRules } from "@/config/businessRules";
import { CoinStack, FallingCoins, Sparkle } from "@/components/app/refer/CoinArt";
import { inr } from "@/lib/utils";

/**
 * Refer & Earn banner (built from the "Premium ₹5,000 Rewards" reference):
 * blush arch pattern, a gold ₹ coin stack that drops in and bounces, coins falling through,
 * "EARN UP TO" → ₹5,000 counting up with a light sweep → "A YEAR" → three key numbers.
 * It sits behind the page's bottom sheet, like the Airtel Points / My Rewards banners.
 */

export const HERO_HEIGHT = 492;

function ArchPattern() {
  // Repeating ogee arches, faded towards the bottom.
  const arch = "M0 60 C0 30 14 12 30 0 C46 12 60 30 60 60";
  return (
    <svg className="absolute inset-0 h-full w-full [mask-image:linear-gradient(180deg,black_0%,black_45%,transparent_85%)]" aria-hidden>
      <defs>
        <pattern id="arches" width="60" height="64" patternUnits="userSpaceOnUse">
          <path d={arch} fill="none" stroke="#E9C9BE" strokeWidth="1.2" opacity="0.55" />
          <path d={arch} transform="translate(30 32)" fill="none" stroke="#E9C9BE" strokeWidth="1.2" opacity="0.35" />
          <path d={arch} transform="translate(-30 32)" fill="none" stroke="#E9C9BE" strokeWidth="1.2" opacity="0.35" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#arches)" />
    </svg>
  );
}

function CountUp({ to }: { to: number }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(reduce ? to : 0);
  const text = useTransform(mv, (v) => inr(Math.round(v)));
  useEffect(() => {
    if (reduce) return;
    const c = animate(mv, to, { duration: 1.6, delay: 1.25, ease: [0.16, 1, 0.3, 1] });
    return () => c.stop();
  }, [to, mv, reduce]);
  return <motion.span>{text}</motion.span>;
}

function Diamond() {
  return <span className="block size-[7px] rotate-45 bg-[#B4532A]" />;
}

function StatDivider() {
  return (
    <span className="flex h-14 w-px flex-col items-center justify-center bg-[linear-gradient(180deg,transparent,#D8A98F,transparent)]">
      <Diamond />
    </span>
  );
}

export function PremiumHero({ rules }: { rules: BusinessRules }) {
  const reduce = useReducedMotion();
  const yearly = rules.referrerReward * rules.referralCapYear;
  const fade = (delay: number) => (reduce ? {} : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay, duration: 0.5 } });

  return (
    <section
      aria-labelledby="hero-amount"
      className="relative overflow-hidden bg-[linear-gradient(180deg,#F9E9E3_0%,#FCF3EF_55%,#FBEDE8_100%)]"
      style={{ height: HERO_HEIGHT }}
    >
      <ArchPattern />
      <FallingCoins height={HERO_HEIGHT} />
      <div className="relative flex h-full flex-col items-center pt-[104px]">
        <div className="relative">
          <Sparkle className="-left-6 top-6" size={12} />
          <Sparkle className="-right-4 top-0" size={9} delay={0.8} />
          <Sparkle className="-right-8 top-[86px]" size={11} delay={1.5} color="#E0A33A" />
          <CoinStack />
        </div>

        <motion.p {...fade(1.0)} className="mt-4 flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.34em] text-[#6B3A1F]">
          <span className="text-[#B4532A]">✦</span>Earn up to<span className="text-[#B4532A]">✦</span>
        </motion.p>

        <motion.h1
          id="hero-amount"
          className="amount-shine mt-1 font-['Playfair_Display',Georgia,serif] text-[60px] font-extrabold leading-[66px] tracking-[-0.01em] tabular-nums"
          initial={reduce ? false : { scale: 0.9, opacity: 0 }}
          animate={reduce ? {} : { scale: [0.9, 1, 1.06, 1], opacity: 1 }}
          transition={{ delay: 1.1, duration: 2.1, times: [0, 0.35, 0.85, 1] }}
        >
          <CountUp to={yearly} />
        </motion.h1>

        <motion.div {...fade(2.3)} className="mt-1 flex w-full items-center justify-center gap-3 px-8">
          <span className="h-px flex-1 bg-[linear-gradient(90deg,transparent,#D8A98F)]" />
          <span className="rounded-full border border-[#D8A98F] bg-[#FFF7EE] px-5 py-1 text-[12px] font-bold uppercase tracking-[0.32em] text-[#6B3A1F] shadow-[inset_0_1px_0_#FFFFFF]">
            A year
          </span>
          <span className="h-px flex-1 bg-[linear-gradient(90deg,#D8A98F,transparent)]" />
        </motion.div>

        <motion.dl {...fade(2.6)} className="mt-4 grid w-full grid-cols-[1fr_auto_1fr_auto_1fr] items-center px-4 text-center">
          <div>
            <dt className="font-['Playfair_Display',Georgia,serif] text-[22px] font-extrabold leading-7 text-[#A3121B]">{inr(rules.referrerReward)}</dt>
            <dd className="text-[11.5px] leading-[15px] text-[#4A2C1E]">for you per friend</dd>
          </div>
          <StatDivider />
          <div>
            <dt className="font-['Playfair_Display',Georgia,serif] text-[22px] font-extrabold leading-7 text-[#A3121B]">
              {inr(rules.friendReward)} + {rules.friendDataGB}GB
            </dt>
            <dd className="text-[11.5px] leading-[15px] text-[#4A2C1E]">for your friend</dd>
          </div>
          <StatDivider />
          <div>
            <dt className="font-['Playfair_Display',Georgia,serif] text-[22px] font-extrabold leading-7 text-[#A3121B]">
              <span className="text-[14px]">Up to </span>
              {rules.referralCapYear}
            </dt>
            <dd className="text-[11.5px] leading-[15px] text-[#4A2C1E]">friends a year</dd>
          </div>
        </motion.dl>
      </div>
    </section>
  );
}
