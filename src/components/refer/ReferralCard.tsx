import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { animate, motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import airtelLogo from "@/assets/refer/airtel-logo.svg";
import { useProto } from "@/store/useProto";
import { haptic } from "@/lib/device";
import { cn, inr } from "@/lib/utils";

/** Card proportions (credit-card-like) — every size inside the faces is in `em`, so the card scales from one number. */
export const CARD_RATIO = 180 / 304; // Figma refer_2 hero card

const FLIP_SPRING = { type: "spring", stiffness: 120, damping: 17, mass: 1 } as const;
const TILT_SPRING = { stiffness: 220, damping: 22, mass: 0.6 };
const MAX_TILT = 10;
const clamp = (v: number) => Math.max(-0.5, Math.min(0.5, v));

/* ───────────────────────── Faces ───────────────────────── */

/**
 * Logo coin: the Airtel logo on both faces. It flips in place like a tossed coin,
 * on tap and every few seconds on its own. The ground shadow narrows as the coin turns edge-on.
 */
function LogoCoin({ size, interactive }: { size: number; interactive: boolean }) {
  const reduce = useReducedMotion();
  const [spins, setSpins] = useState(0);
  const spin = useMotionValue(0);
  const edge = useTransform(spin, (v) => 0.5 + 0.5 * Math.abs(Math.cos((v * Math.PI) / 180)));

  useEffect(() => {
    if (reduce || !interactive) return;
    const id = setInterval(() => setSpins((n) => n + 1), 4200);
    return () => clearInterval(id);
  }, [reduce, interactive, spins]);

  useEffect(() => {
    if (spins === 0) return;
    const a = animate(spin, spins * 360, reduce ? { duration: 0 } : { type: "spring", stiffness: 55, damping: 11, mass: 1 });
    return () => a.stop();
  }, [spins, reduce, spin]);

  const toss = (e: { stopPropagation: () => void }) => {
    e.stopPropagation(); // flip the coin, not the whole card
    haptic([6, 30, 8]);
    setSpins((n) => n + 1);
  };

  const face = "absolute inset-0 rounded-[26%] [backface-visibility:hidden] drop-shadow-[0_0.35em_0.6em_rgba(160,20,26,0.22)]";
  const coin = (
    <motion.div className="relative size-full" style={{ rotateY: spin, transformStyle: "preserve-3d" }}>
      <div className={face}>
        <img src={airtelLogo} alt="" className="size-full" draggable={false} />
      </div>
      <div className={face} style={{ transform: "rotateY(180deg)" }}>
        <img src={airtelLogo} alt="" className="size-full" draggable={false} />
      </div>
    </motion.div>
  );

  return (
    <div className="relative" style={{ width: size, height: size, perspective: 500 }}>
      <motion.span
        aria-hidden
        className="absolute inset-x-[14%] -bottom-[14%] h-[16%] rounded-[50%] bg-black/25 blur-[6px]"
        style={{ scaleX: edge, opacity: edge }}
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
          aria-label="Airtel app logo. Tap to flip it."
          data-testid="logo-coin"
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

/** Front (Figma "refer_2"): soft pink radial wash, concentric rings, the Airtel logo coin and "Airtel App". */
export function CardFront({ width, shimmer = true, interactive = false, className }: { width: number; shimmer?: boolean; interactive?: boolean; className?: string }) {
  const reduce = useReducedMotion();
  const k = width / 304; // design scale
  const px = (n: number) => n * k;
  const ring = (l: number, t: number, size: number) => (
    <span className="absolute rounded-full border border-[#FFEDED]" style={{ left: px(l), top: px(t), width: px(size), height: px(size) }} aria-hidden />
  );
  return (
    <div
      className={cn("relative overflow-hidden border border-[#E6E9EF]", className)}
      style={{
        width,
        height: width * CARD_RATIO,
        borderRadius: px(24),
        background: `radial-gradient(${px(181)}px ${px(117)}px at 50% 45%, #FFDEDE 0%, #FFFFFF 100%)`,
      }}
    >
      {ring(162, -109, 177)}
      {ring(-38, 101, 177)}
      {ring(136, -135, 229)}
      {ring(-64, 75, 229)}
      {ring(111, -160, 281)}
      {ring(-89, 50, 281)}
      <span
        className="absolute rounded-full"
        style={{ left: px(62), top: px(-13), width: px(90), height: px(90), background: "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 65%)" }}
        aria-hidden
      />

      {shimmer && !reduce && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-y-[-30%] w-[35%] rotate-[18deg] bg-gradient-to-r from-transparent via-white/70 to-transparent"
          initial={{ left: "-45%" }}
          animate={{ left: ["-45%", "130%"] }}
          transition={{ duration: 1.6, ease: [0.4, 0, 0.2, 1], repeat: Infinity, repeatDelay: 3.2, delay: 0.8 }}
        />
      )}

      <div className="absolute left-1/2 -translate-x-1/2" style={{ top: px(90 - 12.47 - 50.5) }}>
        <LogoCoin size={px(101)} interactive={interactive} />
      </div>
      <p
        className="absolute inset-x-0 text-center font-extrabold italic text-black"
        style={{ top: px(90 + 57.57 - 5.5), fontSize: px(14.29), lineHeight: `${px(11)}px`, letterSpacing: px(0.14) }}
      >
        Airtel App
      </p>
    </div>
  );
}

/** Back: the programme as a four-line story, no icons. */
function CardBack({ width }: { width: number }) {
  const r = useProto((s) => s.rules);
  const story = [
    "You share your link.",
    "Your friend joins Airtel.",
    `They recharge ${inr(r.minTransaction)}+ within ${r.firstTxnDeadlineDays} days.`,
    `You get ${inr(r.referrerReward)}. They get ${inr(r.friendReward)} + ${r.friendDataBenefit}.`,
  ];
  return (
    <div
      className="relative overflow-hidden border border-[#E6E9EF] bg-white text-refer-ink"
      style={{ width, height: width * CARD_RATIO, fontSize: width / 21, borderRadius: (24 * width) / 304 }}
    >
      <div className="flex h-full flex-col px-[1.3em] py-[1.05em]">
        <p className="text-[0.6em] font-bold uppercase tracking-[0.16em] text-refer-accent">How it works</p>
        <ol className="relative mt-[0.75em] flex flex-1 flex-col justify-between pb-[0.2em]">
          <span className="absolute bottom-[0.65em] left-[0.32em] top-[0.65em] w-px bg-[#F2D3D5]" aria-hidden />
          {story.map((line, i) => (
            <li key={line} className="relative flex items-center gap-[0.75em]">
              <span className={cn("relative z-10 size-[0.65em] shrink-0 rounded-full border-2 bg-white", i === story.length - 1 ? "border-refer-accent bg-refer-accent" : "border-[#E9A9AD]")} aria-hidden />
              <span className={cn("text-[0.82em] leading-[1.25em]", i === story.length - 1 ? "font-bold" : "font-medium text-[#3E4146]")}>{line}</span>
            </li>
          ))}
        </ol>
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
  const shadowY = useTransform(rx, (v) => v * 0.9);
  const shadowScale = useTransform(edgeOn, (e) => 0.62 + e * 0.3);
  const shadowOpacity = useTransform(edgeOn, (e) => 0.45 + e * 0.55);
  // Lift: the card rises slightly mid-flip
  const lift = useTransform(edgeOn, (e) => (1 - e) * -14);
  const scale = useTransform(edgeOn, (e) => 1 + (1 - e) * 0.06);
  // The card dips back a little mid-flip, so the turn reads as a physical tilt.
  const rotateX = useTransform([rx, edgeOn], ([t, e]: number[]) => t + (1 - e) * 12);

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
  // Tilt with the phone: device orientation drives the same tilt as the pointer.
  useEffect(() => {
    if (reduce) return;
    const on = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      tx.set(clamp(e.gamma / 40));
      ty.set(clamp((e.beta - 45) / 40));
    };
    window.addEventListener("deviceorientation", on);
    return () => window.removeEventListener("deviceorientation", on);
  }, [reduce, tx, ty]);
  const askMotion = useRef(false);
  const requestMotion = () => {
    if (askMotion.current) return;
    askMotion.current = true;
    const D = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> } | undefined;
    D?.requestPermission?.().catch(() => undefined);
  };
  const toggle = () => {
    requestMotion();
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
        className="absolute inset-x-[17.6%] -bottom-[6%] h-[16%] rounded-[20px] bg-[rgba(202,199,199,0.9)] blur-[17px]"
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
        className="relative size-full cursor-pointer rounded-[24px] outline-none [touch-action:pan-y] focus-visible:ring-4 focus-visible:ring-[#075EE8]/40"
        style={{ rotateX, rotateY, y: lift, scale, transformStyle: "preserve-3d" }}
      >
        <div className="absolute inset-0 [backface-visibility:hidden]" style={{ transform: "translateZ(1px)" }} aria-hidden={flipped}>
          <CardFront width={width} interactive />
          <motion.span className="pointer-events-none absolute inset-0 rounded-[24px] mix-blend-soft-light" style={{ background: glare }} aria-hidden />
        </div>
        <div className="absolute inset-0 [backface-visibility:hidden]" style={{ transform: "rotateY(180deg) translateZ(1px)" }} aria-hidden={!flipped}>
          <CardBack width={width} />
        </div>
      </motion.div>
    </div>
  );
}
