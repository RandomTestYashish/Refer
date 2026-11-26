import { useEffect, useRef, type KeyboardEvent, type PointerEvent } from "react";
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

/** Front: the proposition. Also used, non-interactive, inside the envelope and share creative. */
export function CardFront({ width, shimmer = true, className }: { width: number; shimmer?: boolean; className?: string }) {
  const cap = useProto((s) => s.rules.yearlyEarningCap);
  const reward = useProto((s) => s.rules.referrerReward);
  const reduce = useReducedMotion();
  return (
    <div
      className={cn("relative overflow-hidden rounded-[1.25em] text-white", className)}
      style={{
        width,
        height: width * CARD_RATIO,
        fontSize: width / 21,
        background: "linear-gradient(140deg,#F2263F 0%,#D3132B 38%,#A10C1E 100%)",
      }}
    >
      {/* material: fine engraved lines + soft top-left light */}
      <span
        className="absolute inset-0 opacity-[0.10]"
        style={{ background: "repeating-linear-gradient(115deg,#fff 0 1px,transparent 1px 7px)" }}
        aria-hidden
      />
      <span className="absolute -left-[20%] -top-[60%] h-[140%] w-[90%] rounded-full bg-white/15 blur-2xl" aria-hidden />
      <span className="absolute -bottom-[45%] -right-[15%] size-[18em] rounded-full border-[0.12em] border-white/15" aria-hidden />
      <span className="absolute -bottom-[30%] right-[2%] size-[12em] rounded-full border-[0.12em] border-white/10" aria-hidden />

      {shimmer && !reduce && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-y-[-30%] w-[35%] rotate-[18deg] bg-gradient-to-r from-transparent via-white/35 to-transparent mix-blend-soft-light"
          initial={{ left: "-45%" }}
          animate={{ left: ["-45%", "130%"] }}
          transition={{ duration: 1.6, ease: [0.4, 0, 0.2, 1], repeat: Infinity, repeatDelay: 3.2, delay: 0.8 }}
        />
      )}

      <div className="relative flex h-full flex-col justify-between p-[1.1em]">
        <div className="flex items-center gap-[0.55em]">
          <img src={appIcon} alt="" className="size-[2.4em] drop-shadow-[0_0.15em_0.3em_rgba(0,0,0,0.25)]" draggable={false} />
          <span className="leading-[1.15em]">
            <span className="block text-[0.82em] font-bold tracking-[0.01em]">Airtel Thanks</span>
            <span className="block text-[0.66em] font-medium text-white/75">Refer a App</span>
          </span>
          <span className="ml-auto rounded-full bg-white/15 px-[0.6em] py-[0.2em] text-[0.6em] font-semibold uppercase tracking-[0.12em] backdrop-blur-sm">
            Referral
          </span>
        </div>

        <div>
          <p className="text-[0.72em] font-semibold uppercase tracking-[0.18em] text-white/80">Earn up to</p>
          <p
            className="mt-[0.05em] bg-gradient-to-b from-white via-white to-[#FFD9DE] bg-clip-text text-[2.9em] font-extrabold leading-[1em] tracking-[-0.04em] text-transparent tabular"
            data-testid="card-cap"
          >
            {inr(cap)}
          </p>
          <p className="mt-[0.15em] text-[0.82em] font-semibold text-white/90">a year, inviting friends to Airtel</p>
        </div>

        <div className="flex items-end justify-between text-[0.66em] font-medium text-white/80">
          <span>{inr(reward)} for every friend who qualifies</span>
          <span className="flex gap-[0.3em]" aria-hidden>
            <span className="size-[1.1em] rounded-full bg-white/40" />
            <span className="-ml-[0.6em] size-[1.1em] rounded-full bg-white/25" />
          </span>
        </div>
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
      <span className="absolute inset-x-0 top-0 h-[0.25em] bg-gradient-to-r from-[#F2263F] to-[#A10C1E]" aria-hidden />
      <div className="flex h-full flex-col px-[1.05em] pb-[0.8em] pt-[0.95em]">
        <p className="text-[0.62em] font-bold uppercase tracking-[0.16em] text-airtel-red">How it works</p>
        <ol className="mt-[0.5em] grid flex-1 grid-cols-2 gap-x-[0.8em] gap-y-[0.55em]">
          {rows.map(({ icon: Icon, title, body }, i) => (
            <li key={title} className="flex gap-[0.5em]">
              <span className="relative flex size-[1.9em] shrink-0 items-center justify-center rounded-[0.6em] bg-[#FFF0F1] text-airtel-red">
                <Icon className="size-[1em]" strokeWidth={2} />
                <span className="absolute -right-[0.3em] -top-[0.3em] flex size-[1em] items-center justify-center rounded-full bg-airtel-ink text-[0.55em] font-bold text-white">
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
  const shadowOpacity = useTransform(edgeOn, (e) => 0.28 + e * 0.22);
  // Lift: the card rises slightly mid-flip
  const lift = useTransform(edgeOn, (e) => (1 - e) * -10);
  const scale = useTransform(edgeOn, (e) => 1 + (1 - e) * 0.04);

  // Specular glare that follows the pointer on the front face
  const gx = useTransform(tx, [-0.5, 0.5], [10, 90]);
  const gy = useTransform(ty, [-0.5, 0.5], [0, 100]);
  const glare = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.32), rgba(255,255,255,0) 55%)`;

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
        className="absolute inset-x-[8%] bottom-0 h-[38%] rounded-[50%] bg-[#7A0A16] blur-[18px]"
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
          <CardFront width={width} />
          <motion.span className="pointer-events-none absolute inset-0 rounded-[20px]" style={{ background: glare }} aria-hidden />
        </div>
        <div className="absolute inset-0 [backface-visibility:hidden]" style={{ transform: "rotateY(180deg) translateZ(1px)" }} aria-hidden={!flipped}>
          <CardBack width={width} />
        </div>
      </motion.div>
    </div>
  );
}
