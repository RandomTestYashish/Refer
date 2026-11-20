import { forwardRef, useState } from "react";
import { ChevronDown, Gift, Link2, Smartphone, Wallet } from "lucide-react";
import { ListRow, SheetSection } from "@/components/app/refer/SheetUI";
import type { BusinessRules } from "@/config/businessRules";
import { cn, inr } from "@/lib/utils";

/** How it works — "Ways to earn" list pattern, plus the reward conditions one tap away. */
export const HowItWorks = forwardRef<HTMLElement, { rules: BusinessRules }>(({ rules }, ref) => {
  const [open, setOpen] = useState(false);
  const steps = [
    { icon: <Link2 />, t: "Share your link", d: "Send it on WhatsApp, SMS or any app." },
    { icon: <Smartphone />, t: "Your friend joins Airtel", d: "They open your invite and sign in to the Airtel app." },
    { icon: <Wallet />, t: `They recharge or pay a bill of ${inr(rules.minTransaction)}+`, d: `Their first one, within ${rules.firstTxnDeadlineDays} days.` },
    { icon: <Gift />, t: `You both earn`, d: `${inr(rules.referrerReward)} cashback for you, ${inr(rules.friendReward)} + ${rules.friendDataGB}GB for them — after validation (up to ${rules.rewardValidationDays} days).` },
  ];
  const conditions = [
    ["Qualifying action", `First recharge or bill payment of ${inr(rules.minTransaction)}+`],
    ["Friend must complete it within", `${rules.firstTxnDeadlineDays} days`],
    ["Use cashback within", `${rules.cashbackValidityDays} days of credit`],
    ["Referral limit", `${rules.referralCapMonth} a month · ${rules.referralCapYear} a year`],
  ];
  return (
    <div ref={ref as React.Ref<HTMLDivElement>}>
      <SheetSection id="how-title" title="How it works" subtitle="Four steps from invite to cashback.">
        <div>
          {steps.map((s) => (
            <ListRow key={s.t} icon={s.icon} iconClass="bg-[#FFF3E2] text-[#B25E09]" title={s.t} sub={s.d} />
          ))}
          <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between py-3 text-[14px] font-medium text-[#075EE8]" aria-expanded={open}>
            Reward conditions
            <ChevronDown className={cn("size-5 transition-transform", open && "rotate-180")} />
          </button>
          {open && (
            <dl className="rounded-[16px] border border-[#E6E9EF] text-[12.5px]">
              {conditions.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3 border-b border-[#E6E9EF] px-4 py-2.5 last:border-0">
                  <dt className="text-[#696B6F]">{k}</dt>
                  <dd className="text-right font-semibold text-[#292C31]">{v}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </SheetSection>
    </div>
  );
});
HowItWorks.displayName = "HowItWorks";
