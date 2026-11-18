import { forwardRef } from "react";
import { CARD, SectionTitle } from "@/components/app/gen4";
import type { BusinessRules } from "@/config/businessRules";
import { inr } from "@/lib/utils";

/** How it works — 4 steps plus the reward conditions, visible on the page (not only in T&C). */
export const HowItWorks = forwardRef<HTMLElement, { rules: BusinessRules }>(({ rules }, ref) => {
  const steps = [
    ["Invite", "Share your referral link with friends."],
    ["They join Airtel", "Your friend opens your invitation and signs in to the Airtel app."],
    [
      "They complete the eligible action",
      `Their first recharge or bill payment of ${inr(rules.minTransaction)}+, within ${rules.firstTxnDeadlineDays} days.`,
    ],
    ["You earn", `${inr(rules.referrerReward)} cashback, credited after validation (up to ${rules.rewardValidationDays} days).`],
  ];
  const conditions = [
    ["Qualifying action", `First recharge or bill payment of ${inr(rules.minTransaction)}+`],
    ["Friend must complete it within", `${rules.firstTxnDeadlineDays} days`],
    ["Your reward", `${inr(rules.referrerReward)} cashback per successful referral`],
    ["Your friend gets", `${inr(rules.friendReward)} cashback + ${rules.friendDataGB}GB data (first-time users)`],
    ["Use cashback within", `${rules.cashbackValidityDays} days of credit`],
    ["Referral limit", `${rules.referralCapMonth} a month · ${rules.referralCapYear} a year`],
  ];
  return (
    <section ref={ref} aria-labelledby="how-title" className="mt-8 px-4">
      <SectionTitle>
        <span id="how-title">how it works</span>
      </SectionTitle>
      <ol className="relative mt-4 space-y-4">
        <span aria-hidden className="absolute bottom-3 left-[15px] top-3 w-px bg-[#E6E9EF]" />
        {steps.map(([t, d], i) => (
          <li key={t} className="relative flex items-start gap-3">
            <span className="relative flex size-8 shrink-0 items-center justify-center rounded-full bg-[#F0F4F9] text-[13px] font-bold text-[#292C31] ring-4 ring-white">{i + 1}</span>
            <span>
              <span className="block text-[14px] font-bold leading-[18px] text-[#292C31]">{t}</span>
              <span className="block text-[12px] leading-[18px] text-[#696B6F]">{d}</span>
            </span>
          </li>
        ))}
      </ol>
      <div className={`mt-5 rounded-[16px] ${CARD}`}>
        <p className="border-b border-[#E6E9EF] px-4 py-3 text-[13px] font-bold text-[#292C31]">Reward conditions</p>
        <dl className="divide-y divide-[#E6E9EF] text-[12.5px]">
          {conditions.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3 px-4 py-2.5">
              <dt className="text-[#696B6F]">{k}</dt>
              <dd className="text-right font-semibold text-[#292C31]">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
});
HowItWorks.displayName = "HowItWorks";
