import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { animate, motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { BadgeIndianRupee, Gift, Smartphone, UserPlus } from "lucide-react";
import appIcon from "@/assets/refer/airtel-app-icon.png";
import { useProto } from "@/store/useProto";
import { haptic } from "@/lib/device";
import { cn, inr } from "@/lib/utils";

/** Card proportions (credit-card-like) — every size inside the faces is in `em`, so the card scales from one number. */
export const CARD_RATIO = 212 / 335;

const FLIP_SPRING = { type: "spring", stiffness: 170, damping: 22, mass: 1 } as const;
const TILT_SPRING = { stiffness: 220, damping: 22, mass: 0.6 };
const MAX_TILT = 9;

/* ───────────────────────── Faces ───────────────────────── */

/**
 * Logo coin — the hero of the card. Tap to toss it: it spins like a coin and lands on the other face
 * (app logo ↔ ₹ reward). The shadow shrinks while it's in the air.
 */
function LogoCoin({ size, interactive }: { size: number; interactive: boolean }) {
  const reward = useProto((s) => s.rules.referrerReward);
  const reduce = useReducedMotion();
  const [tosses, setTosses] = useState(0);
  const spin = useMotionValue(0);
  const lift = useMotionValue(0);
  const air = useTransform(lift, [-1, 0], [0.55, 1]);
  const showsReward = tosses % 2 === 1;

  useEffect(() => {
    if (tosses === 0) return;
    const target = tosses * 540; // 1½ turns per toss → alternate face each time
    if (reduce) {
      spin.set(target);
      return;
    }
    const a = animate(spin, target, { type: "spring", stiffness: 70, damping: 13, mass: 1 });
    const b = animate(lift, [0, -1, 0], { duration: 0.75, times: [0, 0.42, 1], ease: ["easeOut", "easeIn"] });
    return () => {
      a.stop();
      b.stop();
    };
  }, [tosses, reduce, spin, lift]);

  const y = useTransform(lift, (v) => v * size * 0.45);
  const toss = (e: { stopPropagation: () => void }) => {
    e.stopPropagation(); // don't flip the whole card
    haptic([6, 30, 8]);
    setTosses((t) => t + 1);
  };

  const face = "absolute inset-0 rounded-[26%] [backface-visibility:hidden]";
  const coin = (
    <motion.div className="relative size-full" style={{ rotateY: spin, y, transformStyle: "preserve-3d" }}>
      {/* logo face */}
      <div className={cn(face, "overflow-hidden shadow-[0_0.45em_0.9em_rgba(20,20,24,0.22)]")}>
        <img src={appIcon} alt="" className="size-full scale-[1.2]" draggable={false} />
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent" aria-hidden />
      </div>
      {/* reward face */}
      <div
        className={cn(face, "flex flex-col items-center justify-center text-[#5B3A00] shadow-[0_0.5em_1em_rgba(30,8,10,0.35)]")}
        style={{
          transform: "rotateY(180deg)",
          background: "radial-gradient(circle at 32% 28%,#FFF4C9 0%,#F4CE63 38%,#C9971E 72%,#94680C 100%)",
          boxShadow: "inset 0 0 0 0.18em rgba(255,240,190,0.55), inset 0 -0.3em 0.6em rgba(90,55,0,0.35)",
        }}
      >
        <span className="text-[1.75em] font-extrabold leading-none tracking-[-0.04em] tabular">₹{reward}</span>
        <span className="mt-[0.2em] text-[0.5em] font-bold uppercase tracking-[0.14em]">per friend</span>
      </div>
    </motion.div>
  );

  return (
    <div className="relative" style={{ width: size, height: size, perspective: 500, fontSize: size / 4.6 }}>
      {/* ground shadow */}
      <motion.span
        aria-hidden
        className="absolute inset-x-[14%] -bottom-[14%] h-[16%] rounded-[50%] bg-black/30 blur-[6px]"
        style={{ scaleX: air, opacity: air }}
      />
      {interactive ? (
        <motion.button
          type="button"
          onClick={toss}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toss(e);
            }
          }}
          whileTap={{ scale: 0.92 }}
          aria-label={showsReward ? `Coin showing ₹${reward} per friend. Tap to toss again.` : "Airtel app logo. Tap to toss the coin."}
          data-testid="logo-coin"
          data-face={showsReward ? "reward" : "logo"}
          className="relative block size-full rounded-[26%] outline-none focus-visible:ring-4 focus-visible:ring-[#075EE8]/40"
        >
          {coin}
        </motion.button>
      ) : (
        coin
      )}
    </div>
  );
}

/** Front: the logo is the hero (the proposition itself lives in the page headline). */
export function CardFront({ width, shimmer = true, interactive = false, className }: { width: number; shimmer?: boolean; interactive?: boolean; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <div
      className={cn("relative overflow-hidden rounded-[1.25em] text-refer-ink", className)}
      style={{
        width,
        height: width * CARD_RATIO,
        fontSize: width / 21,
        background: "linear-gradient(155deg,#FFFFFF 0%,#F4F4F6 38%,#E2E3E7 78%,#D3D5DA 100%)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.06)",
      }}
    >
      {/* material: fine engraved lines + soft light */}
      <span className="absolute inset-0 opacity-[0.05]" style={{ background: "repeating-linear-gradient(115deg,#000 0 1px,transparent 1px 7px)" }} aria-hidden />
      <span className="absolute left-1/2 top-1/2 size-[13em] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.95),rgba(255,255,255,0)_65%)]" aria-hidden />
      <span className="absolute left-1/2 top-1/2 size-[11em] -translate-x-1/2 -translate-y-1/2 rounded-full border-[0.08em] border-black/[0.06]" aria-hidden />
      <span className="absolute left-1/2 top-1/2 size-[15em] -translate-x-1/2 -translate-y-1/2 rounded-full border-[0.08em] border-black/[0.04]" aria-hidden />

      {shimmer && !reduce && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-y-[-30%] w-[35%] rotate-[18deg] bg-gradient-to-r from-transparent via-white/80 to-transparent"
          initial={{ left: "-45%" }}
          animate={{ left: ["-45%", "130%"] }}
          transition={{ duration: 1.6, ease: [0.4, 0, 0.2, 1], repeat: Infinity, repeatDelay: 3.2, delay: 0.8 }}
        />
      )}

      <div className="relative flex h-full items-center justify-center pb-[0.6em]">
        <LogoCoin size={width * 0.3} interactive={interactive} />
      </div>
      <div className="absolute inset-x-[1.1em] bottom-[0.9em] flex items-center justify-between text-[0.6em] font-semibold uppercase tracking-[0.16em] text-refer-muted">
        <span>Refer a App</span>
        {interactive && <span className="normal-case tracking-normal text-refer-muted/80">Tap the logo</span>}
      </div>
    </div>
  );
}

/** Back: how the programme works, in four short lines. */
function CardBack({ width }: { width: number }) {
  const r = useProto((s) => s.rules);
  const rows = [
    { icon: UserPlus, title: "Refer the Airtel app", body: "Invite a friend who's new to Airtel." },
    { icon: BadgeIndianRupee, title: `You get ${inr(r.referrerReward)}`, body: "For every friend who qualifies." },
    { icon: Gift, title: `Your friend gets ${inr(r.friendReward)} + ${r.friendDataBenefit}`, body: "Added after their first recharge." },
    { icon: Smartphone, title: `They recharge ${inr(r.minTransaction)} or more`, body: "This activates the offer for both of you." },
  ];
  return (
    <div
      className="relative h-full overflow-hidden rounded-[1.25em] border border-[#ECEEF2] bg-white text-airtel-ink"
      style={{ width, height: width * CARD_RATIO, fontSize: width / 21 }}
    >
      <span className="absolute inset-x-0 top-0 h-[0.25em] bg-gradient-to-r from-refer-accent to-refer-deep" aria-hidden />
      <div className="flex h-full flex-col px-[1.05em] pb-[0.8em] pt-[0.95em]">
        <p className="text-[0.62em] font-bold uppercase tracking-[0.16em] text-refer-accent">How it works</p>
        <ol className="mt-[0.5em] grid flex-1 grid-cols-2 gap-x-[0.8em] gap-y-[0.55em]">
          {rows.map(({ icon: Icon, title, body }, i) => (
            <li key={title} className="flex gap-[0.5em]">
              <span className="relative flex size-[1.9em] shrink-0 items-center justify-center rounded-[0.6em] bg-refer-soft text-refer-accent">
                <Icon className="size-[1em]" strokeWidth={2} />
                <span className="absolute -right-[0.3em] -top-[0.3em] flex size-[1em] items-center justify-center rounded-full bg-refer-ink text-[0.55em] font-bold text-white">
                  {i + 1}
                </span>
              </span>
              <span className="min-w-0">
                <span className="block text-[0.7em] font-bold leading-[1.25em]">{title}</span>
                <span className="mt-[0.1em] block text-[0.6em] leading-[1.3em] text-airtel-sub">{body}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="text-[0.56em] leading-[1.35em] text-airtel-sub">
          Only friends new to Airtel qualify. Installing or signing up alone doesn't unlock the reward.
        </p>
      </div>
    </div>
  );
}

/* ───────────────────────── Interactive card ───────────────────────── */

/**
 * Tactile referral card: tilts towards the finger/pointer, its shadow and glare follow the tilt,
 * and it flips in 3D (tap, Enter / Space, or the external "How it works" control).
 */
export function ReferralCard({ width, flipped, onFlippedChange }: { width: number; flipped: boolean; onFlippedChange: (v: boolean) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const height = width * CARD_RATIO;

  // Pointer tilt (springy) + flip angle (spring-animated)
  const tx = useMotionValue(0);
  const ty = useMotionValue(0);
  const rx = useSpring(useTransform(ty, [-0.5, 0.5], [MAX_TILT, -MAX_TILT]), TILT_SPRING);
  const ry = useSpring(useTransform(tx, [-0.5, 0.5], [-MAX_TILT, MAX_TILT]), TILT_SPRING);
  const flip = useMotionValue(flipped ? 180 : 0);
  const rotateY = useTransform([flip, ry], ([f, t]: number[]) => f + (f > 90 ? -t : t));

  useEffect(() => {
    const c = animate(flip, flipped ? 180 : 0, reduce ? { duration: 0 } : FLIP_SPRING);
    return () => c.stop();
  }, [flipped, flip, reduce]);

  // Shadow reacts to tilt (slides away from the light) and to the flip (narrows at 90°).
  const edgeOn = useTransform(flip, (f) => Math.abs(Math.cos((f * Math.PI) / 180)));
  const shadowX = useTransform(ry, (v) => -v * 1.4);
  const shadowY = useTransform(rx, (v) => 22 + v * 0.9);
  const shadowScale = useTransform(edgeOn, (e) => 0.62 + e * 0.3);
  const shadowOpacity = useTransform(edgeOn, (e) => 0.16 + e * 0.16);
  // Lift: the card rises slightly mid-flip
  const lift = useTransform(edgeOn, (e) => (1 - e) * -10);
  const scale = useTransform(edgeOn, (e) => 1 + (1 - e) * 0.04);

  // Specular glare that follows the pointer on the front face
  const gx = useTransform(tx, [-0.5, 0.5], [10, 90]);
  const gy = useTransform(ty, [-0.5, 0.5], [0, 100]);
  const glare = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.7), rgba(255,255,255,0) 50%)`;

  const onMove = (e: PointerEvent) => {
    if (reduce || !ref.current) return;
    const b = ref.current.getBoundingClientRect();
    tx.set((e.clientX - b.left) / b.width - 0.5);
    ty.set((e.clientY - b.top) / b.height - 0.5);
  };
  const reset = () => {
    tx.set(0);
    ty.set(0);
  };
  const toggle = () => {
    haptic(10);
    onFlippedChange(!flipped);
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  };

  return (
    <div className="relative mx-auto select-none" style={{ width, height, perspective: 1100 }}>
      {/* ground shadow */}
      <motion.span
        aria-hidden
        className="absolute inset-x-[8%] bottom-0 h-[38%] rounded-[50%] bg-[#1A1B1F] blur-[20px]"
        style={{ x: shadowX, y: shadowY, scaleX: shadowScale, opacity: shadowOpacity }}
      />
      <motion.div
        ref={ref}
        role="button"
        tabIndex={0}
        aria-pressed={flipped}
        aria-label={flipped ? "Referral card, how it works side. Activate to see the reward." : "Referral card. Activate to see how it works."}
        data-testid="referral-card"
        data-side={flipped ? "back" : "front"}
        onClick={toggle}
        onKeyDown={onKey}
        onPointerMove={onMove}
        onPointerLeave={reset}
        onPointerUp={reset}
        whileTap={{ scale: 0.975 }}
        className="relative size-full cursor-pointer rounded-[20px] outline-none [touch-action:pan-y] focus-visible:ring-4 focus-visible:ring-[#075EE8]/40"
        style={{ rotateX: rx, rotateY, y: lift, scale, transformStyle: "preserve-3d" }}
      >
        <div className="absolute inset-0 [backface-visibility:hidden]" style={{ transform: "translateZ(1px)" }} aria-hidden={flipped}>
          <CardFront width={width} interactive />
          <motion.span className="pointer-events-none absolute inset-0 rounded-[20px] mix-blend-soft-light" style={{ background: glare }} aria-hidden />
        </div>
        <div className="absolute inset-0 [backface-visibility:hidden]" style={{ transform: "rotateY(180deg) translateZ(1px)" }} aria-hidden={!flipped}>
          <CardBack width={width} />
        </div>
      </motion.div>
    </div>
  );
}
