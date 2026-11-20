import { useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { Check, Mail, Zap } from "lucide-react";
import type { BusinessRules } from "@/config/businessRules";
import { RewardCoin } from "@/components/app/primitives";
import { home } from "@/assets/home";
import { track } from "@/lib/analytics";
import { inr } from "@/lib/utils";

/**
 * Refer & Earn hero — a short auto-playing story of how ₹5,000 is earned:
 * invite → friend recharges → you both earn → repeat with 200 friends.
 * Story bars on top can be tapped to jump; tapping the stage moves to the next step.
 */

export const HERO_BG = "#FFE3E3";
export const HERO_HEIGHT = 420;

const STEP_MS = [2600, 2400, 2600, 3600];

// Stage geometry (330 × 176)
const YOU = { x: 52, y: 92 };
const FRIEND = { x: 278, y: 92 };
const CROWD = [
  { x: 250, y: 30, s: 30, img: "avatar-2.jpg" },
  { x: 306, y: 40, s: 26, img: "avatar-4.jpg" },
  { x: 312, y: 146, s: 28, img: "avatar-5.jpg" },
  { x: 244, y: 156, s: 26, img: "avatar-6.jpg" },
  { x: 214, y: 92, s: 24, img: "avatar-3.jpg" },
];

function Avatar({ img, size, label, glow }: { img: string; size: number; label?: string; glow?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <motion.span
        className="block rounded-full ring-[3px] ring-white"
        animate={{ boxShadow: glow ? "0 0 0 6px rgba(245,179,0,0.35), 0 8px 18px rgba(150,20,30,0.18)" : "0 0 0 0px rgba(245,179,0,0), 0 8px 18px rgba(150,20,30,0.14)" }}
        transition={{ duration: 0.4 }}
      >
        <img src={home(img)} alt="" className="block rounded-full object-cover" style={{ width: size, height: size }} />
      </motion.span>
      {label && <span className="mt-1.5 rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-[#292C31] shadow-sm">{label}</span>}
    </div>
  );
}

function Counter({ from, to, run }: { from: number; to: number; run: boolean }) {
  const mv = useMotionValue(from);
  const text = useTransform(mv, (v) => inr(Math.round(v / 25) * 25));
  useEffect(() => {
    mv.set(from);
    if (!run) return;
    const c = animate(mv, to, { duration: 2.2, delay: 0.5, ease: [0.3, 0, 0.2, 1] });
    return () => c.stop();
  }, [run, from, to, mv]);
  return <motion.span className="tabular-nums">{text}</motion.span>;
}

export function PremiumHero({ rules }: { rules: BusinessRules }) {
  const reduce = useReducedMotion();
  const yearly = rules.referrerReward * rules.referralCapYear;
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const [step, setStep] = useState(reduce ? 3 : 0);
  const [cycle, setCycle] = useState(0);
  const playing = inView && !reduce;

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => {
      setStep((s) => (s + 1) % 4);
      if (step === 3) setCycle((c) => c + 1);
    }, STEP_MS[step]);
    return () => clearTimeout(t);
  }, [step, playing, cycle]);

  const go = (s: number) => {
    setStep(s);
    setCycle((c) => c + 1);
    track("hero_story_step", { step: s + 1 });
  };

  const captions = [
    { t: "Invite a friend", d: "Share your link on WhatsApp or SMS" },
    { t: `They recharge ${inr(rules.minTransaction)}+`, d: `Their first recharge or bill payment, within ${rules.firstTxnDeadlineDays} days` },
    { t: `You each earn ${inr(rules.referrerReward)}`, d: `Your friend also gets ${rules.friendDataGB} GB data` },
    { t: `Do it with ${rules.referralCapYear} friends`, d: `${inr(rules.referrerReward)} × ${rules.referralCapYear} friends = ${inr(yearly)} a year` },
  ];
  const k = `${cycle}-${step}`;

  return (
    <section ref={ref} aria-label="How you earn up to ₹5,000 a year" className="relative overflow-hidden bg-[linear-gradient(180deg,#FFD9D9_0%,#FFE9E4_55%,#FFF3EF_100%)]" style={{ height: HERO_HEIGHT }}>
      {/* rings */}
      <div className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(180deg,transparent_0%,black_30%,black_70%,transparent_100%)]" aria-hidden>
        <span className="absolute left-1/2 top-[30px] size-[380px] -translate-x-1/2 rounded-full border-[28px] border-white/45" />
        <span className="absolute left-1/2 top-[106px] size-[228px] -translate-x-1/2 rounded-full border-[22px] border-white/50" />
      </div>

      <div className="relative pt-[92px]">
        {/* story bars */}
        <div className="mx-auto flex w-[300px] gap-1.5" role="tablist" aria-label="Story steps">
          {captions.map((c, i) => (
            <button key={i} role="tab" aria-selected={i === step} aria-label={`Step ${i + 1}: ${c.t}`} onClick={() => go(i)} className="h-5 flex-1 py-2">
              <span className="block h-1 overflow-hidden rounded-full bg-[#E32121]/15">
                <motion.span
                  key={i === step ? k : `s${i}-${i < step}`}
                  className="block h-full rounded-full bg-[#E32121]"
                  initial={{ width: i < step ? "100%" : "0%" }}
                  animate={{ width: i <= step ? "100%" : "0%" }}
                  transition={i === step && playing ? { duration: STEP_MS[i] / 1000, ease: "linear" } : { duration: 0 }}
                />
              </span>
            </button>
          ))}
        </div>

        {/* Stage */}
        <div className="relative mx-auto mt-1 h-[176px] w-[330px] cursor-pointer select-none" onClick={() => go((step + 1) % 4)} aria-hidden>
          {/* dotted path */}
          <svg className="absolute inset-0" viewBox="0 0 330 176" fill="none">
            <path d={`M${YOU.x + 34} ${YOU.y - 8} Q165 ${YOU.y - 74} ${FRIEND.x - 34} ${FRIEND.y - 8}`} stroke="#E32121" strokeOpacity="0.25" strokeWidth="2" strokeDasharray="2 6" strokeLinecap="round" />
          </svg>

          {/* You */}
          <div className="absolute" style={{ left: YOU.x - 32, top: YOU.y - 32 }}>
            <Avatar img="avatar-1.jpg" size={64} label="You" glow={step >= 2} />
          </div>

          {/* Friend / crowd */}
          <AnimatePresence>
            {step === 3 &&
              CROWD.map((c, i) => (
                <motion.div
                  key={`${k}-c${i}`}
                  className="absolute"
                  style={{ left: c.x - c.s / 2, top: c.y - c.s / 2 }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ delay: 0.1 + i * 0.12, type: "spring", stiffness: 400, damping: 18 }}
                >
                  <span className="block rounded-full ring-2 ring-white shadow-md">
                    <img src={home(c.img)} alt="" className="block rounded-full object-cover" style={{ width: c.s, height: c.s }} />
                  </span>
                </motion.div>
              ))}
          </AnimatePresence>
          <div className="absolute" style={{ left: FRIEND.x - 32, top: FRIEND.y - 32 }}>
            <motion.div animate={step === 0 ? { scale: [1, 1, 1.12, 1] } : { scale: 1 }} transition={{ duration: 1.6, times: [0, 0.6, 0.8, 1] }} key={`f-${k}`}>
              <Avatar img="avatar-3.jpg" size={64} label={step === 3 ? `×${rules.referralCapYear}` : "Friend"} glow={step === 2} />
            </motion.div>
          </div>

          <AnimatePresence>
            {/* 1. envelope flies you → friend */}
            {step === 0 && (
              <motion.div
                key={`env-${k}`}
                className="absolute left-0 top-0"
                initial={{ x: YOU.x - 18, y: YOU.y - 30, rotate: -15, scale: 0.6, opacity: 0 }}
                animate={{ x: [YOU.x - 18, 147, FRIEND.x - 18], y: [YOU.y - 30, YOU.y - 82, FRIEND.y - 30], rotate: [-15, 0, 12], scale: [0.6, 1.1, 0.7], opacity: [0, 1, 0] }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                transition={{ duration: 1.5, delay: 0.3, ease: "easeInOut", times: [0, 0.5, 1] }}
              >
                <span className="flex size-9 items-center justify-center rounded-[10px] bg-[#E32121] shadow-[0_8px_16px_rgba(227,33,33,0.35)]">
                  <Mail className="size-5 text-white" />
                </span>
              </motion.div>
            )}

            {/* 2. friend recharges */}
            {step === 1 && (
              <motion.div
                key={`rch-${k}`}
                className="absolute"
                style={{ left: FRIEND.x - 150, top: 6 }}
                initial={{ y: 12, opacity: 0, scale: 0.8 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ type: "spring", stiffness: 380, damping: 20, delay: 0.2 }}
              >
                <span className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white py-1.5 pl-1.5 pr-1.5 text-[12px] font-bold text-[#292C31] shadow-[0_8px_18px_rgba(0,0,0,0.12)]">
                  <span className="flex size-6 items-center justify-center rounded-full bg-[#FFF3D6]">
                    <Zap className="size-3.5 text-[#E39A00]" fill="#F5B300" />
                  </span>
                  {inr(rules.minTransaction)}+ recharge
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.9, type: "spring", stiffness: 500 }} className="flex size-5 items-center justify-center rounded-full bg-[#0F7033]">
                    <Check className="size-3 text-white" strokeWidth={4} />
                  </motion.span>
                </span>
              </motion.div>
            )}

            {/* 3. coins to both */}
            {step === 2 && (
              <motion.div key={`earn-${k}`} className="absolute inset-0" exit={{ opacity: 0 }}>
                <motion.span
                  className="absolute left-0 top-0"
                  initial={{ x: 147, y: 0, scale: 0.4, opacity: 0 }}
                  animate={{ x: [147, 120, YOU.x - 22], y: [0, -10, YOU.y - 78], scale: [0.4, 1.1, 1], opacity: 1, rotate: [0, -20, 0] }}
                  transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
                >
                  <RewardCoin amount={rules.referrerReward} size={44} />
                </motion.span>
                <motion.span
                  className="absolute left-0 top-0"
                  initial={{ x: 147, y: 0, scale: 0.4, opacity: 0 }}
                  animate={{ x: [147, 180, FRIEND.x - 40], y: [0, -10, FRIEND.y - 80], scale: [0.4, 1.1, 1], opacity: 1 }}
                  transition={{ duration: 0.9, delay: 0.45, ease: "easeOut" }}
                >
                  <span className="flex items-center gap-1 rounded-full bg-white py-1 pl-1 pr-2.5 text-[12px] font-extrabold text-[#7A4A00] shadow-[0_8px_18px_rgba(229,154,0,0.3)]">
                    <RewardCoin amount={rules.friendReward} size={28} /> + {rules.friendDataGB} GB
                  </span>
                </motion.span>
              </motion.div>
            )}

            {/* 4. coins stream from the crowd into you, running total */}
            {step === 3 && (
              <motion.div key={`rpt-${k}`} className="absolute inset-0" exit={{ opacity: 0 }}>
                {Array.from({ length: 7 }).map((_, i) => (
                  <motion.span
                    key={i}
                    className="absolute left-0 top-0"
                    initial={{ x: FRIEND.x - 14, y: FRIEND.y - 14, opacity: 0, scale: 0.6 }}
                    animate={{ x: [FRIEND.x - 14, 165, YOU.x - 14], y: [FRIEND.y - 14, YOU.y - 70 - (i % 3) * 8, YOU.y - 14], opacity: [0, 1, 0], scale: [0.6, 1, 0.5] }}
                    transition={{ duration: 0.9, delay: 0.5 + i * 0.28, ease: "easeInOut" }}
                  >
                    <RewardCoin amount={rules.referrerReward} size={28} />
                  </motion.span>
                ))}
                <motion.span
                  className="absolute rounded-full bg-[#292C31] px-2.5 py-1 text-[13px] font-extrabold text-white shadow-lg"
                  style={{ left: YOU.x - 8, top: YOU.y - 66 }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 420, damping: 18 }}
                >
                  <Counter from={rules.referrerReward} to={yearly} run={playing} />
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* step caption for screen readers only — the visible copy is the one headline below */}
        <p className="sr-only" aria-live="polite">
          Step {step + 1}: {captions[step].t}. {captions[step].d}
        </p>

        {/* headline */}
        <h1 id="hero-amount" className="mx-auto mt-2 max-w-[320px] text-center text-[28px] font-extrabold leading-[34px] tracking-[-0.6px] text-[#292C31]">
          Refer a friend,
          <br />
          earn up to{" "}
          <span className="amount-shine -mr-1 inline-block px-1 italic tabular-nums">{inr(yearly)}</span>
        </h1>
      </div>
    </section>
  );
}
