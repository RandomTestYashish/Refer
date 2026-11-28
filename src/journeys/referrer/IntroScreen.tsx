import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BadgeIndianRupee, Check, MailOpen, Send, Smartphone, UserCheck } from "lucide-react";
import { ContactAvatar } from "@/components/app/primitives";
import { LogoTile } from "@/components/refer/LogoTile";
import { LogoFamily } from "@/components/refer/LogoFamily";
import { TierBadge } from "@/components/refer/AchievementBadge";
import { useStartInvite } from "@/components/refer/ContactsPrompt";
import { CONTACTS } from "@/domain/data";
import { useProto } from "@/store/useProto";
import { haptic } from "@/lib/device";
import { cn, inr } from "@/lib/utils";
import airtelLogo from "@/assets/refer/airtel-logo.svg";

/**
 * A02a — Refer story.
 * Opens with the prize (win up to ₹5,000 a year), then explains how. A six-step, dark onboarding for Refer a App: each step has its own animated hero built around the
 * Airtel logo, an eyebrow, a title, one line of copy, page dots and a single white button.
 * Swipe or tap Continue to move on; Skip opens the full Refer a App page.
 */
const STEP_MS = 4200;
const LAST_HOLD_MS = 4800;

export function IntroScreen() {
  const rules = useProto((s) => s.rules);
  const replace = useProto((s) => s.replace);
  const invite = useStartInvite();
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  // Auto-play: each step holds for STEP_MS (shown as progress in its dot). Touching the screen pauses it.
  // After the last step has been on screen for a moment, the invite opens on its own.
  const [paused, setPaused] = useState(false);

  // Story: the prize first (₹5,000 a year), then how you win it, step by step.
  const steps = [
    {
      key: "earn",
      eyebrow: "Welcome",
      title: `Win up to ${inr(rules.yearlyEarningCap)} a year`,
      body: "Just by inviting your friends to the Airtel Thanks app. Here's how it works.",
      cta: "Show me how",
      hero: <VaultHero amount={rules.yearlyEarningCap} />,
    },
    {
      key: "welcome",
      eyebrow: "How you earn",
      title: `Every friend gets you ${inr(rules.referrerReward)}`,
      body: `Bring a friend into the Airtel family. You get ${inr(rules.referrerReward)}, they get ${inr(rules.friendReward)} + ${rules.friendDataBenefit}.`,
      cta: "Continue",
      hero: <WelcomeHero />,
    },
    {
      key: "invite",
      eyebrow: "Invite",
      title: "Pick friends, send one link",
      body: `Choose from your contacts or share on WhatsApp. Each link stays valid for ${rules.linkValidityHours} hours.`,
      cta: "Continue",
      hero: <InviteHero reward={rules.referrerReward} />,
    },
    {
      key: "unlock",
      eyebrow: "Unlock",
      title: "Their first recharge unlocks it",
      body: `When your friend recharges ${inr(rules.minTransaction)} or more within ${rules.firstTxnDeadlineDays} days, you both get paid.`,
      cta: "Continue",
      hero: <ChainHero reward={rules.referrerReward} />,
    },
    {
      key: "badges",
      eyebrow: "Milestones",
      title: "Collect all four badges",
      body: "Hit monthly milestones to unlock Bronze, Silver, Gold and Platinum.",
      cta: "Continue",
      hero: <BadgesHero />,
    },
    {
      key: "reminders",
      eyebrow: "Rewards",
      title: "Never miss a reward",
      body: "We let you know when a friend joins, recharges, or a link is about to expire.",
      cta: "Start inviting",
      hero: <NotifyHero reward={rules.referrerReward} />,
    },
  ];
  const step = steps[i];
  const last = i === steps.length - 1;
  const hold = last ? LAST_HOLD_MS : STEP_MS;

  const go = (n: number) => {
    if (n < 0 || n >= steps.length || n === i) return;
    haptic(6);
    setDir(n > i ? 1 : -1);
    setI(n);
  };
  const skip = () => replace("a_landing");
  const next = () => {
    if (!last) return go(i + 1);
    replace("a_landing");
    setTimeout(invite, 220);
  };
  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => {
      if (last) next();
      else {
        setDir(1);
        setI((n) => n + 1);
      }
    }, hold);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, paused, hold, last]);

  return (
    <div
      className="relative flex h-full flex-col overflow-hidden bg-white pt-[var(--sb,44px)] text-[#1B1C1F]"
      data-testid="refer-intro"
      onPointerDown={() => setPaused(true)}
      onPointerUp={() => setPaused(false)}
      onPointerCancel={() => setPaused(false)}
    >
      <Aurora />
      <Dust />

      {/* Skip */}
      <div className="relative z-10 flex h-11 shrink-0 items-center justify-end px-5">
        {!last && (
          <button onClick={skip} className="rounded-full px-2 py-1 text-[15px] text-[#5B5E66] active:text-[#1B1C1F]" data-testid="intro-skip">
            Skip
          </button>
        )}
      </div>

      {/* Hero + copy; swipe to move between steps */}
      <motion.div
        className="relative z-10 flex min-h-0 flex-1 touch-pan-y flex-col"
        onPanEnd={(_, info) => {
          if (Math.abs(info.offset.x) < 50 || Math.abs(info.offset.x) < Math.abs(info.offset.y)) return;
          go(info.offset.x < 0 ? i + 1 : i - 1);
        }}
      >
        <div className="relative min-h-0 flex-1">
          <AnimatePresence mode="popLayout" custom={dir} initial={false}>
            <motion.div
              key={step.key}
              custom={dir}
              variants={{
                enter: (d: number) => ({ opacity: 0, x: d * 60, scale: 0.92, filter: "blur(8px)" }),
                center: { opacity: 1, x: 0, scale: 1, filter: "blur(0px)" },
                exit: (d: number) => ({ opacity: 0, x: d * -60, scale: 0.92, filter: "blur(8px)" }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {step.hero}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="shrink-0 px-7 pb-2 text-center">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step.key}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-[11px] font-semibold uppercase leading-[14px] tracking-[3px] text-[#C2424A]">{step.eyebrow}</p>
              <h1 className="mt-2.5 text-[28px] font-bold leading-[34px] tracking-[-0.3px] [text-wrap:balance]">{step.title}</h1>
              <p className="mx-auto mt-2.5 max-w-[300px] text-[15px] leading-[21px] text-[#5B5E66]">{step.body}</p>
            </motion.div>
          </AnimatePresence>

          {/* Page dots */}
          <div className="mt-6 flex items-center justify-center gap-1.5" role="tablist" aria-label="Story steps">
            {steps.map((s, n) => (
              <button key={s.key} onClick={() => go(n)} role="tab" aria-selected={n === i} aria-label={`Step ${n + 1}`} className="flex h-4 items-center">
                <motion.span className="relative block h-[5px] overflow-hidden rounded-full bg-[#1B1C1F]/15" animate={{ width: n === i ? 26 : 5 }} transition={{ type: "spring", stiffness: 400, damping: 30 }}>
                  {n < i && <span className="absolute inset-0 bg-[#CA262B]" />}
                  {n === i && (
                    <motion.span
                      key={`${i}-${paused}`}
                      className="absolute inset-y-0 left-0 bg-[#CA262B]"
                      initial={{ width: "0%" }}
                      animate={{ width: paused ? undefined : "100%" }}
                      transition={{ duration: hold / 1000, ease: "linear" }}
                    />
                  )}
                </motion.span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="relative z-10 shrink-0 px-4 pb-[30px] pt-4">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={next}
          className="h-[52px] w-full rounded-full bg-[#1B1C1F] text-[16px] font-medium text-white shadow-[0_12px_28px_rgba(27,28,31,0.18)]"
          data-testid="intro-next"
        >
          {step.cta}
        </motion.button>
        <div className="flex h-9 items-end justify-center">
          {last && (
            <button onClick={skip} className="text-[14px] text-[#5B5E66] active:text-[#1B1C1F]" data-testid="intro-details">
              See how it works
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────── shared bits ───────────────────────────── */

/** Soft pastel light (blush, peach, lilac) drifting slowly behind the hero. */
function Aurora() {
  const blobs = [
    { c: "#FFD6DA", x: "-18%", y: "-6%", s: 300, d: 14 },
    { c: "#FFE7D6", x: "48%", y: "4%", s: 280, d: 17 },
    { c: "#ECE5FF", x: "18%", y: "30%", s: 260, d: 19 },
    { c: "#FFE0E9", x: "-10%", y: "62%", s: 320, d: 21 },
  ];
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {blobs.map((b, k) => (
        <motion.span
          key={k}
          className="absolute rounded-full blur-[46px]"
          style={{ left: b.x, top: b.y, width: b.s, height: b.s, background: b.c }}
          animate={{ x: [0, 24, -16, 0], y: [0, -18, 14, 0], scale: [1, 1.08, 0.96, 1] }}
          transition={{ duration: b.d, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      <div className="absolute inset-x-0 bottom-0 h-[42%] bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,#FFFFFF_55%)]" />
    </div>
  );
}

/** Slow-drifting specks of light, like dust in a beam. */
function Dust() {
  const specks = Array.from({ length: 22 }, (_, k) => ({ x: (k * 37) % 100, y: (k * 53) % 70, d: 6 + (k % 5) * 2, s: 1 + (k % 3) * 0.6 }));
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {specks.map((p, k) => (
        <motion.span
          key={k}
          className="absolute rounded-full bg-[#F4A9AE]"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.s, height: p.s }}
          animate={{ y: [0, -24, 0], opacity: [0, 0.8, 0] }}
          transition={{ duration: p.d, repeat: Infinity, delay: k * 0.37, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function Float({ children, d = 4, a = 8, delay = 0 }: { children: React.ReactNode; d?: number; a?: number; delay?: number }) {
  return (
    <motion.div animate={{ y: [-a / 2, a / 2] }} transition={{ duration: d, repeat: Infinity, repeatType: "mirror", ease: "easeInOut", delay }}>
      {children}
    </motion.div>
  );
}

/* ───────────────────────────── heroes ───────────────────────────── */

/** 1 · A light flare, then the Airtel tile drops in, framed by the Airtel family of small logos. */
function WelcomeHero() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 650);
    return () => clearTimeout(t);
  }, []);
  const W = 375;
  const H = 360;
  return (
    <div className="relative flex items-center justify-center" style={{ width: W, height: H }}>
      {/* The Airtel family: the same logo repeated small around the one big logo, fading into the dark */}
      {ready && (
        <div className="absolute inset-0 [mask-image:radial-gradient(closest-side,#000_55%,transparent_100%)]">
          <LogoFamily width={W} height={H} gap={40} icon={22} hole={96} tone="light" strength={0.42} />
        </div>
      )}
      {/* Flare */}
      <motion.div className="absolute" initial={{ scale: 0, opacity: 0, rotate: -20 }} animate={{ scale: [0, 1.2, 0.2], opacity: [0, 1, 0], rotate: 20 }} transition={{ duration: 1.1, ease: "easeOut" }} aria-hidden>
        <div className="absolute left-1/2 top-1/2 h-[2px] w-[220px] -translate-x-1/2 -translate-y-1/2 bg-[linear-gradient(90deg,transparent,#F28A92,transparent)]" />
        <div className="absolute left-1/2 top-1/2 h-[140px] w-[2px] -translate-x-1/2 -translate-y-1/2 bg-[linear-gradient(180deg,transparent,#F28A92,transparent)]" />
        <div className="absolute left-1/2 top-1/2 size-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FFC2C7] blur-md" />
      </motion.div>
      {ready && (
        <motion.div initial={{ opacity: 0, scale: 0.5, y: -30, filter: "blur(10px)" }} animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }} transition={{ type: "spring", stiffness: 140, damping: 13 }}>
          <Float d={4} a={12}>
            <LogoTile size={132} depth={12} />
          </Float>
        </motion.div>
      )}
    </div>
  );
}

/** 2 · The tile turns like a coin while friends get ticked off one by one. */
function InviteHero({ reward }: { reward: number }) {
  const rows = CONTACTS.slice(0, 3);
  const [ticked, setTicked] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTicked((n) => (n >= rows.length + 1 ? 0 : n + 1)), 900);
    return () => clearInterval(t);
  }, [rows.length]);
  return (
    <div className="flex w-full flex-col items-center px-6">
      <Float d={4} a={8}>
        <LogoTile size={96} depth={12} motionMode="spin" />
      </Float>
      <ul className="mt-7 w-full">
        {rows.map((c, k) => {
          const on = k < ticked;
          return (
            <motion.li
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + k * 0.08 }}
              className="flex items-center gap-3 border-t border-dashed border-[#1B1C1F]/12 py-3 last:border-b"
            >
              <motion.span
                className="flex size-6 shrink-0 items-center justify-center rounded-[7px] border"
                animate={{ backgroundColor: on ? "#CA262B" : "rgba(255,255,255,0.8)", borderColor: on ? "#CA262B" : "rgba(27,28,31,0.25)" }}
              >
                <AnimatePresence>{on && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Check className="size-4 text-white" strokeWidth={3} /></motion.span>}</AnimatePresence>
              </motion.span>
              <ContactAvatar name={c.name} hue={c.hue} size={26} />
              <span className={cn("min-w-0 flex-1 truncate text-left text-[15px] transition-colors", on ? "text-[#1B1C1F]/40 line-through" : "text-[#1B1C1F]")}>{c.name}</span>
              <span className="flex items-center gap-1.5 text-[14px] font-semibold text-[#CA262B]">
                <img src={airtelLogo} alt="" className="size-3.5 rounded-[4px]" />+{inr(reward)}
              </span>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}

/** 3 · A chain links you to your friend, then each stage lights up. */
function ChainHero({ reward }: { reward: number }) {
  const stages = [
    { icon: Send, label: "Invited" },
    { icon: MailOpen, label: "Opened" },
    { icon: UserCheck, label: "Joined" },
    { icon: Smartphone, label: "Recharged" },
    { icon: BadgeIndianRupee, label: `${inr(reward)} each` },
  ];
  const [lit, setLit] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setLit((n) => (n >= stages.length + 1 ? 0 : n + 1)), 750);
    return () => clearInterval(t);
  }, [stages.length]);
  const links = 6;
  return (
    <div className="flex w-full flex-col items-center px-5">
      <div className="relative flex h-[120px] w-full items-center justify-center">
        <motion.div className="absolute left-2" initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 120, damping: 14 }}>
          <LogoTile size={58} depth={8} glow={false} />
          <p className="mt-1.5 text-center text-[11px] text-[#5B5E66]">You</p>
        </motion.div>
        <motion.div className="absolute right-2 flex flex-col items-center" initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 120, damping: 14 }}>
          <div className="rounded-full p-[3px] ring-2 ring-[#F28A92] bg-white">
            <ContactAvatar name={CONTACTS[0].name} hue={CONTACTS[0].hue} size={52} />
          </div>
          <p className="mt-1.5 text-[11px] text-[#5B5E66]">{CONTACTS[0].name.split(" ")[0]}</p>
        </motion.div>
        {/* Chain */}
        <motion.svg width="150" height="60" viewBox="0 0 150 60" className="overflow-visible" animate={{ y: [-3, 3] }} transition={{ duration: 2.8, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}>
          <defs>
            <linearGradient id="chainMetal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#FFE3E5" />
              <stop offset="0.45" stopColor="#F07A82" />
              <stop offset="1" stopColor="#B8262C" />
            </linearGradient>
          </defs>
          {Array.from({ length: links }, (_, k) => {
            const x = 14 + k * 24.4;
            const y = 30 + Math.sin((k / (links - 1)) * Math.PI) * 10;
            const flat = k % 2 === 0;
            return (
              <motion.rect
                key={k}
                x={x - (flat ? 17 : 13)}
                y={y - (flat ? 9 : 6)}
                width={flat ? 34 : 26}
                height={flat ? 18 : 12}
                rx={flat ? 9 : 6}
                fill="none"
                stroke="url(#chainMetal)"
                strokeWidth={flat ? 5 : 4}
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + k * 0.08, type: "spring", stiffness: 260, damping: 16 }}
                style={{ transformOrigin: `${x}px ${y}px`, filter: "drop-shadow(0 3px 4px rgba(202,38,43,0.25))" }}
              />
            );
          })}
        </motion.svg>
      </div>
      {/* Stages */}
      <div className="mt-8 flex w-full justify-between px-1">
        {stages.map((s, k) => {
          const on = k < lit;
          const Icon = s.icon;
          return (
            <div key={s.label} className="flex w-[58px] flex-col items-center gap-2">
              <motion.span
                className="flex size-9 items-center justify-center rounded-full"
                animate={{
                  backgroundColor: on ? "#CA262B" : "#F1F2F5",
                  boxShadow: on ? "0 6px 16px rgba(202,38,43,0.35)" : "0 0 0 rgba(0,0,0,0)",
                  scale: k === lit - 1 ? [1, 1.18, 1] : 1,
                }}
                transition={{ duration: 0.4 }}
              >
                <Icon className={cn("size-[18px]", on ? "text-white" : "text-[#9A9DA5]")} strokeWidth={2} />
              </motion.span>
              <span className={cn("text-center text-[10.5px] leading-[13px]", on ? "text-[#1B1C1F]" : "text-[#9A9DA5]")}>{s.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** 4 · A vault-style dial turns and the digits roll to the yearly cap. */
function VaultHero({ amount }: { amount: number }) {
  const digits = String(amount).split("");
  const [turn, setTurn] = useState(0);
  useEffect(() => {
    const seq = [140, -80, 220, 0];
    let k = 0;
    const t = setInterval(() => setTurn(seq[k++ % seq.length]), 1300);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex flex-col items-center">
      <div className="relative size-[176px]">
        <div className="absolute inset-[-30%] rounded-full bg-[radial-gradient(circle,rgba(255,170,178,0.55),transparent_62%)] blur-xl" />
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,#d9dce2,#ffffff,#c8ccd4,#f4f5f7,#d9dce2,#ffffff,#d9dce2)] p-[7px] shadow-[0_18px_36px_rgba(140,60,70,0.18),inset_0_1px_0_#fff]">
          <div className="size-full rounded-full bg-[radial-gradient(circle_at_50%_35%,#FFFFFF,#F1F2F5_70%)] shadow-[inset_0_3px_10px_rgba(27,28,31,0.12)]" />
        </div>
        {/* Turning dial with ticks */}
        <motion.svg viewBox="0 0 176 176" className="absolute inset-0" animate={{ rotate: turn }} transition={{ type: "spring", stiffness: 40, damping: 10 }}>
          {Array.from({ length: 60 }, (_, k) => {
            const a = (k / 60) * Math.PI * 2;
            const long = k % 5 === 0;
            const r1 = 76, r2 = long ? 64 : 69;
            return <line key={k} x1={88 + Math.cos(a) * r1} y1={88 + Math.sin(a) * r1} x2={88 + Math.cos(a) * r2} y2={88 + Math.sin(a) * r2} stroke={k === 45 ? "#CA262B" : "rgba(27,28,31,0.3)"} strokeWidth={long ? 2 : 1} strokeLinecap="round" />;
          })}
          <circle cx="88" cy="88" r="52" fill="none" stroke="rgba(202,38,43,0.08)" strokeWidth="10" />
        </motion.svg>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <LogoTile size={58} depth={8} motionMode="still" glow={false} />
        </div>
      </div>
      {/* Rolling digits */}
      <div className="mt-7 flex items-center gap-1.5">
        <DigitBox>₹</DigitBox>
        {digits.map((d, k) => (
          <DigitBox key={k}>
            <RollingDigit to={+d} delay={0.35 + k * 0.18} />
          </DigitBox>
        ))}
      </div>
      <p className="mt-2 text-[10px] font-semibold uppercase tracking-[2.5px] text-[#5B5E66]">a year</p>
    </div>
  );
}

function DigitBox({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative flex h-[46px] w-[36px] items-center justify-center overflow-hidden rounded-[10px] border border-[#ECEDF1] bg-white text-[26px] font-bold tabular text-[#1B1C1F] shadow-[0_6px_14px_rgba(140,60,70,0.10),inset_0_-2px_0_#F1F2F5]">
      {children}
    </span>
  );
}

function RollingDigit({ to, delay }: { to: number; delay: number }) {
  const spins = 10 + to; // roll through a full set before landing
  return (
    <span className="absolute inset-0 overflow-hidden">
      <motion.span className="absolute inset-x-0 top-0 flex flex-col" initial={{ y: 0 }} animate={{ y: -46 * spins }} transition={{ duration: 1.4, delay, ease: [0.2, 0.8, 0.2, 1] }}>
        {Array.from({ length: spins + 1 }, (_, k) => (
          <span key={k} className="flex h-[46px] items-center justify-center">
            {k % 10}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

/** 5 · The four badges rotate through, centre one large. */
function BadgesHero() {
  const ms = useProto((s) => s.rules.milestones);
  const [c, setC] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setC((n) => (n + 1) % ms.length), 2000);
    return () => clearInterval(t);
  }, [ms.length]);
  const m = ms[c];
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[190px] w-[340px]">
        {ms.map((x, k) => {
          const off = ((k - c + ms.length + 1) % ms.length) - 1; // -1, 0, 1, 2
          const pos = off === 0 ? { x: 0, s: 1, o: 1, z: 3, b: 0 } : off === -1 ? { x: -118, s: 0.55, o: 0.55, z: 2, b: 1.5 } : off === 1 ? { x: 118, s: 0.55, o: 0.55, z: 2, b: 1.5 } : { x: 0, s: 0.3, o: 0, z: 1, b: 4 };
          return (
            <motion.div
              key={x.id}
              className="absolute left-1/2 top-1/2"
              style={{ zIndex: pos.z }}
              animate={{ x: `calc(-50% + ${pos.x}px)`, y: "-50%", scale: pos.s, opacity: pos.o, filter: `blur(${pos.b}px)`, rotateY: off * -25 }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
            >
              <Float d={3.4} a={off === 0 ? 10 : 4} delay={k * 0.4}>
                <TierBadge tier={x.id} status="earned" size={140} />
              </Float>
            </motion.div>
          );
        })}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="mt-3 text-center">
          <p className="text-[16px] font-semibold">{m.label}</p>
          <p className="mt-0.5 text-[12px] text-[#5B5E66]">
            {m.target} {m.target === 1 ? "referral" : "referrals"} a month{m.reward ? ` · ${inr(m.reward)} bonus` : ""}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/** 6 · The app icon collects a badge count while notifications slide in. */
function NotifyHero({ reward }: { reward: number }) {
  const notes = [
    { title: `${CONTACTS[0].name.split(" ")[0]} joined with your link`, body: "One step away. Their first recharge unlocks your reward." },
    { title: `${inr(reward)} added to your balance`, body: `${CONTACTS[0].name.split(" ")[0]} recharged. You both got ${inr(reward)}.` },
    { title: `${CONTACTS[1].name.split(" ")[0]}'s link expires soon`, body: "Send a reminder before the link runs out." },
  ];
  const [n, setN] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setN((k) => k + 1), 2200);
    return () => clearInterval(t);
  }, []);
  const note = notes[n % notes.length];
  return (
    <div className="flex w-full flex-col items-center px-5">
      <div className="relative">
        <Float d={4} a={10}>
          <LogoTile size={112} depth={12} />
        </Float>
        <AnimatePresence mode="popLayout">
          <motion.span
            key={n}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 18 }}
            className="absolute -right-2.5 -top-2.5 flex size-7 items-center justify-center rounded-full bg-[#CA262B] text-[13px] font-bold text-white shadow-[0_6px_14px_rgba(202,38,43,0.45)] ring-2 ring-white"
          >
            {(n % 9) + 1}
          </motion.span>
        </AnimatePresence>
      </div>
      <div className="relative mt-9 h-[72px] w-full">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={n}
            initial={{ opacity: 0, y: -26, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.94, filter: "blur(4px)" }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            className="absolute inset-x-0 flex items-start gap-2.5 rounded-[18px] border border-[#EEF0F3] bg-white/90 p-3 text-left shadow-[0_12px_30px_rgba(140,60,70,0.12)] backdrop-blur-md"
          >
            <img src={airtelLogo} alt="" className="size-[22px] shrink-0 rounded-[6px]" />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-[13px] font-semibold">{note.title}</p>
                <span className="shrink-0 text-[11px] text-[#9A9DA5]">now</span>
              </div>
              <p className="mt-0.5 line-clamp-2 text-[12px] leading-[16px] text-[#5B5E66]">{note.body}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
