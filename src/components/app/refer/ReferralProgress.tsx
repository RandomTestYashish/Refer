import { forwardRef, useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { Check, ChevronRight, Lock } from "lucide-react";
import type { BusinessRules, Milestone } from "@/config/businessRules";
import { home } from "@/assets/home";
import { cn, inr } from "@/lib/utils";

/** The highest milestone reached for a given count of successful referrals. */
export function currentMilestone(milestones: Milestone[], count: number) {
  return [...milestones].reverse().find((m) => count >= m.target);
}

export const MILESTONE_BG = "#161034";

const GROUP = 3;
const VISIBLE_GROUPS = 4;
const DRIFT_PX_PER_SECOND = 14;
const RESUME_AFTER_MS = 2500;

function LockedSeal() {
  return (
    <span className="relative flex size-11 items-center justify-center">
      <svg viewBox="0 0 44 44" className="absolute inset-0" aria-hidden>
        <defs>
          <linearGradient id="seal-gold" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#FBE7B2" />
            <stop offset="1" stopColor="#E9C46F" />
          </linearGradient>
        </defs>
        <path
          fill="url(#seal-gold)"
          d="M22 2l4.6 3.2 5.5-.8 2.6 4.9 5 2.4-.7 5.6L42 22l-3 4.7.7 5.6-5 2.4-2.6 4.9-5.5-.8L22 42l-4.6-3.2-5.5.8-2.6-4.9-5-2.4.7-5.6L2 22l3-4.7-.7-5.6 5-2.4 2.6-4.9 5.5.8z"
        />
      </svg>
      <Lock className="relative size-4 text-[#946503]" strokeWidth={2.4} />
    </span>
  );
}

function GoldGift({ done }: { done: boolean }) {
  return (
    <span className="relative flex size-11 items-center justify-center">
      <svg viewBox="0 0 44 44" className="size-11 drop-shadow-[0_3px_4px_rgba(148,101,3,0.3)]" aria-hidden>
        <defs>
          <linearGradient id="gift-box" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#FFD873" />
            <stop offset="1" stopColor="#E8A21F" />
          </linearGradient>
          <linearGradient id="gift-lid" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#FFE9A8" />
            <stop offset="1" stopColor="#F4BE45" />
          </linearGradient>
        </defs>
        <path d="M22 13c-3-7-11-9-12.500-4.500C8.300 12.500 15 14 22 13zm0 0c3-7 11-9 12.500-4.500C35.700 12.500 29 14 22 13z" fill="#FFF3CF" stroke="#B97A0A" strokeWidth="1.8" strokeLinejoin="round" />
        <rect x="8" y="21" width="28" height="19" rx="3" fill="url(#gift-box)" />
        <rect x="5" y="13" width="34" height="9" rx="2.500" fill="url(#gift-lid)" />
        <rect x="19" y="13" width="6" height="27" fill="#FFF7DF" />
      </svg>
      {done && (
        <span className="absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-[#946503] ring-2 ring-white">
          <Check className="size-2.5 text-white" strokeWidth={3.5} />
        </span>
      )}
    </span>
  );
}

function Tile({ position, successful, reward }: { position: number; successful: number; reward: number }) {
  const isGift = position % GROUP === 0;
  const done = successful >= position;
  const amount = isGift ? reward * GROUP : reward;
  return (
    <li className="flex w-[62px] shrink-0 flex-col items-center gap-1.5">
      {isGift ? (
        <GoldGift done={done} />
      ) : done ? (
        <span className="relative flex size-11 items-center justify-center">
          <img src={home("coin-gold.png")} alt="" className="size-10" />
          <span className="absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-[#946503] ring-2 ring-white">
            <Check className="size-2.5 text-white" strokeWidth={3.5} />
          </span>
        </span>
      ) : (
        <LockedSeal />
      )}
      <span className={cn("text-[12px] font-bold leading-[14px] tabular-nums", isGift || done ? "text-[#946503]" : "text-[#696B6F]")}>{inr(amount)}</span>
    </li>
  );
}

/** Reward strip: each referral earns the same amount, and every third tile shows that set's total. */
export const ReferralProgress = forwardRef<
  HTMLElement,
  { rules: BusinessRules; successful: number; earned: number; onViewAll: () => void; className?: string }
>(({ rules, successful, earned, onViewAll, className }, ref) => {
  const reduce = useReducedMotion();
  const stripRef = useRef<HTMLDivElement>(null);
  const reward = rules.referrerReward;
  const setTotal = reward * GROUP;
  const firstPosition = Math.floor(successful / GROUP) * GROUP + 1;
  const positions = Array.from({ length: GROUP * VISIBLE_GROUPS }, (_, i) => firstPosition + i);
  const left = GROUP - (successful % GROUP);

  useEffect(() => {
    const el = stripRef.current;
    if (!el || reduce) return;
    let frame = 0;
    let last = performance.now();
    let offset = el.scrollLeft;
    let pausedUntil = 0;
    const pause = () => {
      pausedUntil = Number.POSITIVE_INFINITY;
    };
    const release = () => {
      pausedUntil = performance.now() + RESUME_AFTER_MS;
    };
    const tick = (now: number) => {
      const dt = Math.min(now - last, 64);
      last = now;
      if (now >= pausedUntil) {
        const half = el.scrollWidth / 2;
        offset = (Math.abs(el.scrollLeft - offset) > 2 ? el.scrollLeft : offset) + (DRIFT_PX_PER_SECOND * dt) / 1000;
        if (offset >= half) offset -= half;
        el.scrollLeft = offset;
      } else {
        offset = el.scrollLeft;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    el.addEventListener("pointerdown", pause);
    el.addEventListener("touchstart", pause, { passive: true });
    window.addEventListener("pointerup", release);
    window.addEventListener("touchend", release);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("pointerdown", pause);
      el.removeEventListener("touchstart", pause);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("touchend", release);
    };
  }, [reduce, firstPosition]);

  const status =
    successful === 0
      ? `${inr(reward)} per friend. ${GROUP} friends = ${inr(setTotal)}`
      : successful >= rules.referralCapYear
        ? "You've reached this year's referral limit"
        : `${left} more ${left === 1 ? "friend" : "friends"} to complete your next ${inr(setTotal)}`;

  return (
    <section ref={ref} aria-labelledby="progress-title" className={cn("pt-5", className)}>
      <h2 id="progress-title" className="sr-only">
        Referral rewards
      </h2>

      <div
        ref={stripRef}
        className="no-scrollbar overflow-x-auto [mask-image:linear-gradient(90deg,transparent,#000_16px,#000_calc(100%-16px),transparent)]"
        role="group"
        aria-label={`Rewards: ${inr(reward)} per referral, ${inr(setTotal)} for every ${GROUP} referrals`}
      >
        <div className="flex w-max">
          <ul className="flex">
            {positions.map((p) => (
              <Tile key={p} position={p} successful={successful} reward={reward} />
            ))}
          </ul>
          <ul className="flex" aria-hidden>
            {positions.map((p) => (
              <Tile key={p} position={p} successful={successful} reward={reward} />
            ))}
          </ul>
        </div>
      </div>

      <div className="px-4 pt-4">
        <p className="flex h-10 items-center justify-center rounded-[8px] border border-[#F3DDA3] bg-[linear-gradient(180deg,#FFFFFF,#FFF8E6)] p-2 text-center text-[12px] font-bold leading-[14px] text-[#292C31]">{status}</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {[
            { value: String(successful), label: "Successful referrals" },
            { value: inr(earned), label: "Cashback earned" },
          ].map((s) => (
            <button key={s.label} onClick={onViewAll} className="rounded-[16px] border border-[#E6E9EF] bg-[linear-gradient(180deg,#FFFFFF,#F5F5F5)] p-3 text-center active:brightness-[0.98]">
              <span className="block text-[16px] font-bold leading-[18px] text-[#292C31] tabular-nums">{s.value}</span>
              <span className="mt-1 flex items-center justify-center gap-0.5 text-[12px] leading-[18px] text-[#696B6F]">
                {s.label} <ChevronRight className="size-3.5" />
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
});
ReferralProgress.displayName = "ReferralProgress";
