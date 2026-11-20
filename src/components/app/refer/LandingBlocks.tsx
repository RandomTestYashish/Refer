import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, ChevronRight, Copy, FileText, Gift, Link2, MessageCircle, Search, Smartphone, Trophy, Wallet } from "lucide-react";
import { CoinBadge, type BadgeState } from "@/components/app/Milestones";
import { copyInviteLink } from "@/components/app/InviteKit";
import type { BusinessRules } from "@/config/businessRules";
import { PERSONAL_CODE } from "@/domain/data";
import { cn, inr } from "@/lib/utils";

/**
 * Building blocks for the enhancement-2 landing layout:
 * reward split → milestone strip → status + stats → invite actions → how-it-works grid.
 */

/** Two-up reward card that sits on the bottom edge of the hero. */
export function RewardSplit({ rules }: { rules: BusinessRules }) {
  return (
    <div className="relative grid grid-cols-[1fr_auto_1fr] items-center rounded-[20px] border border-[#F0E1DC] bg-white px-4 py-4 shadow-[0_10px_28px_rgba(120,40,20,0.10)]">
      <div>
        <p className="text-[26px] font-extrabold leading-8 tracking-[-0.5px] text-[#292C31] tabular-nums">{inr(rules.referrerReward)}</p>
        <p className="mt-0.5 text-[12px] leading-4 text-[#696B6F]">for you, per referral</p>
      </div>
      <div className="relative mx-3 flex h-full items-center">
        <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[#E6E9EF]" aria-hidden />
        <span className="relative flex size-7 items-center justify-center rounded-full bg-[#F4F5F7] text-[16px] font-bold text-[#8D9096]" aria-hidden>
          +
        </span>
      </div>
      <div className="text-right">
        <p className="text-[26px] font-extrabold leading-8 tracking-[-0.5px] text-[#292C31] tabular-nums">
          {inr(rules.friendReward)} <span className="text-[18px]">+ {rules.friendDataGB} GB</span>
        </p>
        <p className="mt-0.5 text-[12px] leading-4 text-[#696B6F]">for your friend</p>
      </div>
    </div>
  );
}

/** Milestone badges in one row, joined by a progress line. Tap to see all badges. */
export function MilestoneStrip({ rules, count, onOpen }: { rules: BusinessRules; count: number; onOpen: () => void }) {
  const ms = rules.milestones;
  const nextIdx = ms.findIndex((m) => count < m.target);
  const reached = ms.filter((m) => count >= m.target).length;
  const pct = ms.length > 1 ? (Math.max(0, reached - 1) / (ms.length - 1)) * 100 : 0;
  return (
    <button onClick={onOpen} className="relative block w-full text-left" aria-label="See all milestone badges">
      <div className="absolute h-[2px] bg-[#ECE6DA]" style={{ left: `${50 / ms.length}%`, right: `${50 / ms.length}%`, top: 21 }} aria-hidden>
        <motion.div
          className="h-full bg-[linear-gradient(90deg,#F5C64F,#D79A1E)]"
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <div className="relative grid" style={{ gridTemplateColumns: `repeat(${ms.length}, minmax(0, 1fr))` }}>
        {ms.map((m, i) => {
          const state: BadgeState = count >= m.target ? "unlocked" : i === nextIdx ? "next" : "locked";
          return (
            <div key={m.id} className="flex flex-col items-center">
              <CoinBadge m={m} state={state} size={44} />
              <span className={cn("mt-2.5 text-[12px] font-bold leading-[14px]", state === "locked" ? "text-[#8D9096]" : "text-[#292C31]")}>
                {m.label === "First referral" ? "First" : m.label}
              </span>
              <span className="mt-0.5 text-[11px] leading-[14px] text-[#8D9096]">
                {m.target} {m.target === 1 ? "referral" : "referrals"}
              </span>
            </div>
          );
        })}
      </div>
    </button>
  );
}

/** Status ribbon tab + two stat cards (successful referrals, cashback earned). */
export function StatsBlock({
  rules,
  successful,
  earned,
  onOpen,
}: {
  rules: BusinessRules;
  successful: number;
  earned: number;
  onOpen: (which: "referrals" | "cashback") => void;
}) {
  const next = rules.milestones.find((m) => successful < m.target);
  const toNext = next ? next.target - successful : 0;
  const status =
    successful === 0
      ? `Earn your first ${inr(rules.referrerReward)}. Start referring!`
      : next
        ? `${toNext} more ${toNext === 1 ? "referral" : "referrals"} to unlock the ${next.label === "First referral" ? "First" : next.label} badge`
        : "Every badge unlocked. Keep referring!";
  const cards = [
    { k: "referrals" as const, v: String(successful), l: "Successful referrals" },
    { k: "cashback" as const, v: inr(earned), l: "Cashback earned" },
  ];
  return (
    <div>
      <div className="mx-auto w-[86%] rounded-t-[14px] bg-[linear-gradient(180deg,#DDF3E4,#F2FBF5)] px-3 pb-2 pt-2 text-center text-[13px] font-semibold text-[#0F5C2B]">{status}</div>
      <div className="grid grid-cols-2 gap-3">
        {cards.map((c) => (
          <button key={c.k} onClick={() => onOpen(c.k)} className="rounded-[16px] border border-[#E6E9EF] bg-white text-center shadow-[0_2px_8px_rgba(41,44,49,0.04)] active:bg-[#F7F7F7]">
            <p className="px-3 pb-3 pt-3.5 text-[24px] font-extrabold leading-7 text-[#292C31] tabular-nums">{c.v}</p>
            <p className="flex items-center justify-center gap-0.5 whitespace-nowrap border-t border-[#EFF0F2] px-2 py-3 text-[12.5px] font-medium text-[#3E4146]">
              {c.l} <ChevronRight className="size-4 text-[#8D9096]" />
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

function Squiggle({ flip }: { flip?: boolean }) {
  return (
    <svg viewBox="0 0 120 10" preserveAspectRatio="none" className={cn("h-2.5 min-w-0 flex-1 text-[#D4D5D6]", flip && "-scale-x-100")} aria-hidden>
      <path d="M0 5 Q 10 0 20 5 T 40 5 T 60 5 T 80 5 T 100 5 T 120 5" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

/** Primary search CTA, personal code with copy, then the WhatsApp shortcut. */
export function InviteActions({ onSearch, onWhatsApp, ctaRef }: { onSearch: () => void; onWhatsApp: () => void; ctaRef?: React.Ref<HTMLDivElement> }) {
  const reduce = useReducedMotion();
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    if (await copyInviteLink()) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  return (
    <div>
      <div ref={ctaRef}>
        <motion.button
          whileTap={reduce ? undefined : { scale: 0.98 }}
          onClick={onSearch}
          className="flex h-14 w-full items-center justify-center gap-2.5 rounded-full bg-[#E32121] text-[17px] font-bold text-white shadow-[0_8px_20px_rgba(227,33,33,0.28)]"
        >
          <Search className="size-5" strokeWidth={2.5} /> Search & Invite Friends
        </motion.button>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Squiggle />
        <button onClick={copy} className="flex shrink-0 items-center gap-2 text-[16px] font-semibold tracking-[0.06em] text-[#3E4146]" aria-label={copied ? "Link copied." : `Copy your referral link, code ${PERSONAL_CODE}`}>
          {PERSONAL_CODE}
          {copied ? <Check className="size-4 text-[#0F7033]" strokeWidth={3} /> : <Copy className="size-4 text-[#696B6F]" />}
        </button>
        <Squiggle flip />
      </div>

      <motion.button
        whileTap={reduce ? undefined : { scale: 0.98 }}
        onClick={onWhatsApp}
        className="mt-4 flex h-14 w-full items-center justify-center gap-2.5 rounded-full border border-[#D4D5D6] bg-white text-[17px] font-bold text-[#292C31]"
      >
        <span className="flex size-6 items-center justify-center rounded-full bg-[#1DA851]">
          <MessageCircle className="size-3.5 fill-white text-white" />
        </span>
        Invite via WhatsApp
      </motion.button>
    </div>
  );
}

/** How it works as a 3×2 tile grid; the last tile opens the terms. */
export function HowItWorksGrid({ rules, onTerms }: { rules: BusinessRules; onTerms: () => void }) {
  const tiles = [
    { icon: Link2, tint: "#E9F1FF", fg: "#075EE8", t: "Share your link", d: "With friends new to Airtel" },
    { icon: Smartphone, tint: "#FFF1E6", fg: "#C2570C", t: `They recharge ${inr(rules.minTransaction)}+`, d: `Within ${rules.firstTxnDeadlineDays} days of joining` },
    { icon: Wallet, tint: "#E7F6EC", fg: "#0F7033", t: `You earn ${inr(rules.referrerReward)}`, d: "Cashback after validation" },
    { icon: Gift, tint: "#FFE9E9", fg: "#E32121", t: `They get ${inr(rules.friendReward)} + ${rules.friendDataGB} GB`, d: "On their first recharge" },
    { icon: Trophy, tint: "#FFF6DB", fg: "#B88300", t: "Unlock badges", d: `Up to ${rules.referralCapYear} referrals a year` },
  ];
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {tiles.map(({ icon: Icon, tint, fg, t, d }, i) => (
        <motion.div
          key={t}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.05, duration: 0.35 }}
          className="flex min-h-[148px] flex-col items-center rounded-[16px] border border-[#EFF0F2] bg-[linear-gradient(180deg,#FFFFFF,#F7F7F7)] px-2 pb-3 pt-4 text-center"
        >
          <span className="flex size-11 items-center justify-center rounded-[14px]" style={{ background: tint, color: fg }}>
            <Icon className="size-[22px]" strokeWidth={2.2} />
          </span>
          <p className="mt-3 text-[13px] font-bold leading-[17px] text-[#292C31]">{t}</p>
          <p className="mt-1 text-[11px] leading-[14px] text-[#696B6F]">{d}</p>
        </motion.div>
      ))}
      <button
        onClick={onTerms}
        className="flex min-h-[148px] flex-col items-center justify-center rounded-[16px] border border-[#EFF0F2] bg-[linear-gradient(180deg,#FFFFFF,#F7F7F7)] px-2 text-center active:bg-[#F0F0F0]"
      >
        <span className="flex size-11 items-center justify-center rounded-[14px] bg-[#F0F1F3] text-[#5C5F66]">
          <FileText className="size-[22px]" strokeWidth={2.2} />
        </span>
        <p className="mt-3 flex items-center gap-0.5 text-[13px] font-bold leading-[17px] text-[#292C31]">
          Terms & conditions
        </p>
      </button>
    </div>
  );
}

