import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BadgeIndianRupee, Check, MailOpen, Send, Smartphone, UserCheck } from "lucide-react";
import { ContactAvatar } from "@/components/app/primitives";
import { LogoTile } from "@/components/refer/LogoTile";
import { TierBadge } from "@/components/refer/AchievementBadge";
import { useStartInvite } from "@/components/refer/ContactsPrompt";
import { useStatusTone } from "@/components/device/statusTone";
import { CONTACTS } from "@/domain/data";
import { useProto } from "@/store/useProto";
import { haptic } from "@/lib/device";
import { cn, inr } from "@/lib/utils";
import airtelLogo from "@/assets/refer/airtel-logo.svg";

/**
 * A02a — Refer story.
 * A six-step, dark onboarding for Refer a App: each step has its own animated hero built around the
 * Airtel logo, an eyebrow, a title, one line of copy, page dots and a single white button.
 * Swipe or tap Continue to move on; Skip opens the full Refer a App page.
 */
export function IntroScreen() {
  useStatusTone("light");
  const rules = useProto((s) => s.rules);
  const replace = useProto((s) => s.replace);
  const invite = useStartInvite();
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);

  const steps = [
    {
      key: "welcome",
      eyebrow: "Welcome",
      title: `Refer a friend, both get ${inr(rules.referrerReward)}`,
      body: `Invite friends to the Airtel Thanks app. You get ${inr(rules.referrerReward)}, they get ${inr(rules.friendReward)} + ${rules.friendDataBenefit}.`,
      cta: "Get started",
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
      key: "earn",
      eyebrow: "Yearly earnings",
      title: `Earn up to ${inr(rules.yearlyEarningCap)} a year`,
      body: `${inr(rules.referrerReward)} for every friend who qualifies. Keep inviting all year round.`,
      cta: "Continue",
      hero: <VaultHero amount={rules.yearlyEarningCap} />,
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

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-black pt-[var(--sb,44px)] text-white" data-testid="refer-intro">
      {/* Airtel-red ember rising from the bottom */}
      <motion.div
        className="pointer-events-none absolute inset-x-[-20%] bottom-[-10%] h-[78%]"
        style={{ background: "radial-gradient(75% 62% at 50% 100%, #FF4A2E 0%, #E2262C 20%, #A3161C 40%, #4A0A0D 62%, rgba(0,0,0,0) 84%)" }}
        animate={{ opacity: [0.85, 1, 0.85], scale: [1, 1.04, 1] }}
        transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
        aria-hidden
      />
      <Dust />

      {/* Skip */}
      <div className="relative z-10 flex h-11 shrink-0 items-center justify-end px-5">
        {!last && (
          <button onClick={skip} className="rounded-full px-2 py-1 text-[15px] text-white/60 active:text-white" data-testid="intro-skip">
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
              <p className="text-[11px] font-semibold uppercase leading-[14px] tracking-[3px] text-white/70">{step.eyebrow}</p>
              <h1 className="mt-2.5 text-[28px] font-bold leading-[34px] tracking-[-0.3px] [text-wrap:balance]">{step.title}</h1>
              <p className="mx-auto mt-2.5 max-w-[300px] text-[15px] leading-[21px] text-white/75">{step.body}</p>
            </motion.div>
          </AnimatePresence>

          {/* Page dots */}
          <div className="mt-6 flex items-center justify-center gap-1.5" role="tablist" aria-label="Story steps">
            {steps.map((s, n) => (
              <button key={s.key} onClick={() => go(n)} role="tab" aria-selected={n === i} aria-label={`Step ${n + 1}`} className="flex h-4 items-center">
                <motion.span className="block h-[5px] rounded-full bg-white" animate={{ width: n === i ? 20 : 5, opacity: n === i ? 1 : 0.35 }} transition={{ type: "spring", stiffness: 400, damping: 30 }} />
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="relative z-10 shrink-0 px-4 pb-[30px] pt-4">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={next}
          className="h-[52px] w-full rounded-full bg-white text-[16px] font-medium text-black shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
          data-testid="intro-next"
        >
          {step.cta}
        </motion.button>
        <div className="flex h-9 items-end justify-center">
          {last && (
            <button onClick={skip} className="text-[14px] text-white/70 active:text-white" data-testid="intro-details">
              See how it works
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────── shared bits ───────────────────────────── */

/** Slow-drifting specks of light, like dust in a beam. */
function Dust() {
  const specks = Array.from({ length: 22 }, (_, k) => ({ x: (k * 37) % 100, y: (k * 53) % 70, d: 6 + (k % 5) * 2, s: 1 + (k % 3) * 0.6 }));
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {specks.map((p, k) => (
        <motion.span
          key={k}
          className="absolute rounded-full bg-[#FFB59A]"
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

/** Small glowing Airtel logo chips. */
function Chip({ size = 34 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div className="absolute inset-[-60%] rounded-full bg-[radial-gradient(circle,rgba(255,120,100,0.55),transparent_65%)] blur-md" />
      <img src={airtelLogo} alt="" className="relative size-full drop-shadow-[0_0_10px_rgba(255,140,120,0.8)]" draggable={false} />
    </div>
  );
}

/* ───────────────────────────── heroes ───────────────────────────── */

/** 1 · A light flare, then the Airtel tile drops in with chips orbiting it. */
function WelcomeHero() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 650);
    return () => clearTimeout(t);
  }, []);
  const chips = [
    { x: -112, y: -52, s: 34, r: -14, d: 3.6 },
    { x: 104, y: -70, s: 30, r: 12, d: 4.2 },
    { x: -92, y: 44, s: 26, r: 10, d: 3.9 },
    { x: 96, y: 34, s: 32, r: -10, d: 4.6 },
    { x: -150, y: -6, s: 18, r: 0, d: 5.1 },
    { x: 146, y: -12, s: 16, r: 0, d: 4.8 },
  ];
  return (
    <div className="relative flex size-[320px] items-center justify-center">
      {/* Flare */}
      <motion.div className="absolute" initial={{ scale: 0, opacity: 0, rotate: -20 }} animate={{ scale: [0, 1.2, 0.2], opacity: [0, 1, 0], rotate: 20 }} transition={{ duration: 1.1, ease: "easeOut" }} aria-hidden>
        <div className="absolute left-1/2 top-1/2 h-[2px] w-[220px] -translate-x-1/2 -translate-y-1/2 bg-[linear-gradient(90deg,transparent,#fff,transparent)]" />
        <div className="absolute left-1/2 top-1/2 h-[140px] w-[2px] -translate-x-1/2 -translate-y-1/2 bg-[linear-gradient(180deg,transparent,#fff,transparent)]" />
        <div className="absolute left-1/2 top-1/2 size-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white blur-md" />
      </motion.div>
      {ready && (
        <>
          {chips.map((c, k) => (
            <motion.div
              key={k}
              className="absolute"
              initial={{ opacity: 0, x: 0, y: 0, scale: 0.3 }}
              animate={{ opacity: 1, x: c.x, y: c.y, scale: 1, rotate: c.r }}
              transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.15 + k * 0.06 }}
            >
              <Float d={c.d} a={10} delay={k * 0.3}>
                <Chip size={c.s} />
              </Float>
            </motion.div>
          ))}
          <motion.div initial={{ opacity: 0, scale: 0.5, y: -30, filter: "blur(10px)" }} animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }} transition={{ type: "spring", stiffness: 140, damping: 13 }}>
            <Float d={4} a={12}>
              <LogoTile size={132} depth={12} />
            </Float>
          </motion.div>
        </>
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
              className="flex items-center gap-3 border-t border-dashed border-white/15 py-3 last:border-b"
            >
              <motion.span
                className="flex size-6 shrink-0 items-center justify-center rounded-[7px] border"
                animate={{ backgroundColor: on ? "#E2262C" : "rgba(255,255,255,0)", borderColor: on ? "#E2262C" : "rgba(255,255,255,0.35)" }}
              >
                <AnimatePresence>{on && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Check className="size-4 text-white" strokeWidth={3} /></motion.span>}</AnimatePresence>
              </motion.span>
              <ContactAvatar name={c.name} hue={c.hue} size={26} />
              <span className={cn("min-w-0 flex-1 truncate text-left text-[15px] transition-colors", on ? "text-white/45 line-through" : "text-white")}>{c.name}</span>
              <span className="flex items-center gap-1.5 text-[14px] font-semibold text-[#FF8A6B]">
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
          <p className="mt-1.5 text-center text-[11px] text-white/60">You</p>
        </motion.div>
        <motion.div className="absolute right-2 flex flex-col items-center" initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 120, damping: 14 }}>
          <div className="rounded-full p-[3px] ring-2 ring-[#E2262C]/70">
            <ContactAvatar name={CONTACTS[0].name} hue={CONTACTS[0].hue} size={52} />
          </div>
          <p className="mt-1.5 text-[11px] text-white/60">{CONTACTS[0].name.split(" ")[0]}</p>
        </motion.div>
        {/* Chain */}
        <motion.svg width="150" height="60" viewBox="0 0 150 60" className="overflow-visible" animate={{ y: [-3, 3] }} transition={{ duration: 2.8, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}>
          <defs>
            <linearGradient id="chainMetal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#FFC2B0" />
              <stop offset="0.45" stopColor="#E2262C" />
              <stop offset="1" stopColor="#6E1216" />
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
                style={{ transformOrigin: `${x}px ${y}px`, filter: "drop-shadow(0 0 6px rgba(253,47,54,0.45))" }}
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
                  backgroundColor: on ? "#E2262C" : "rgba(255,255,255,0.08)",
                  boxShadow: on ? "0 0 18px rgba(253,47,54,0.75)" : "0 0 0 rgba(0,0,0,0)",
                  scale: k === lit - 1 ? [1, 1.18, 1] : 1,
                }}
                transition={{ duration: 0.4 }}
              >
                <Icon className={cn("size-[18px]", on ? "text-white" : "text-white/35")} strokeWidth={2} />
              </motion.span>
              <span className={cn("text-center text-[10.5px] leading-[13px]", on ? "text-white" : "text-white/40")}>{s.label}</span>
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
        <div className="absolute inset-[-30%] rounded-full bg-[radial-gradient(circle,rgba(253,47,54,0.35),transparent_62%)] blur-xl" />
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,#5a5c62,#c9cbd0,#4a4c52,#b5b7bd,#5a5c62,#d6d8dc,#5a5c62)] p-[7px] shadow-[0_18px_40px_rgba(0,0,0,0.6)]">
          <div className="size-full rounded-full bg-[radial-gradient(circle_at_50%_35%,#3a3c42,#16171a_70%)]" />
        </div>
        {/* Turning dial with ticks */}
        <motion.svg viewBox="0 0 176 176" className="absolute inset-0" animate={{ rotate: turn }} transition={{ type: "spring", stiffness: 40, damping: 10 }}>
          {Array.from({ length: 60 }, (_, k) => {
            const a = (k / 60) * Math.PI * 2;
            const long = k % 5 === 0;
            const r1 = 76, r2 = long ? 64 : 69;
            return <line key={k} x1={88 + Math.cos(a) * r1} y1={88 + Math.sin(a) * r1} x2={88 + Math.cos(a) * r2} y2={88 + Math.sin(a) * r2} stroke={k === 45 ? "#FD2F36" : "rgba(255,255,255,0.45)"} strokeWidth={long ? 2 : 1} strokeLinecap="round" />;
          })}
          <circle cx="88" cy="88" r="52" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
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
      <p className="mt-2 text-[10px] font-semibold uppercase tracking-[2.5px] text-white/50">a year</p>
    </div>
  );
}

function DigitBox({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative flex h-[46px] w-[36px] items-center justify-center overflow-hidden rounded-[10px] border border-white/15 bg-white/[0.07] text-[26px] font-bold tabular shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
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
          <p className="mt-0.5 text-[12px] text-white/55">
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
            className="absolute -right-2.5 -top-2.5 flex size-7 items-center justify-center rounded-full bg-[#FD2F36] text-[13px] font-bold shadow-[0_0_14px_rgba(253,47,54,0.8)]"
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
            className="absolute inset-x-0 flex items-start gap-2.5 rounded-[18px] border border-white/10 bg-white/[0.09] p-3 text-left backdrop-blur-md"
          >
            <img src={airtelLogo} alt="" className="size-[22px] shrink-0 rounded-[6px]" />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-[13px] font-semibold">{note.title}</p>
                <span className="shrink-0 text-[11px] text-white/45">now</span>
              </div>
              <p className="mt-0.5 line-clamp-2 text-[12px] leading-[16px] text-white/65">{note.body}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
