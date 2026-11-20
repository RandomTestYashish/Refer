import { forwardRef, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { SheetSection } from "@/components/app/refer/SheetUI";
import type { BusinessRules } from "@/config/businessRules";
import { home } from "@/assets/home";
import { cn, inr } from "@/lib/utils";

/** How it works — three illustrated step cards in a swipeable carousel, conditions one tap away. */
export const HowItWorks = forwardRef<HTMLElement, { rules: BusinessRules }>(({ rules }, ref) => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const track = useRef<HTMLDivElement>(null);

  const steps = [
    { img: "refer-invite.jpg", t: "Share your link", d: "Invite friends on WhatsApp, SMS or any app. Each link works for 24 hours." },
    { img: "refer-step2.jpg", t: `They recharge ${inr(rules.minTransaction)}+`, d: `Your friend joins Airtel and makes a first recharge or bill payment within ${rules.firstTxnDeadlineDays} days.` },
    { img: "refer-step3.jpg", t: "You both earn", d: `${inr(rules.referrerReward)} cashback for you, ${inr(rules.friendReward)} + ${rules.friendDataGB}GB for them, after validation.` },
  ];
  const conditions = [
    ["Qualifying action", `First recharge or bill payment of ${inr(rules.minTransaction)}+`],
    ["Friend must complete it within", `${rules.firstTxnDeadlineDays} days`],
    ["Reward validation", `Up to ${rules.rewardValidationDays} days`],
    ["Use cashback within", `${rules.cashbackValidityDays} days of credit`],
    ["Referral limit", `${rules.referralCapMonth} a month · ${rules.referralCapYear} a year`],
  ];

  const onScroll = () => {
    const el = track.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    if (!card) return;
    setActive(Math.round(el.scrollLeft / (card.offsetWidth + 12)));
  };
  const goTo = (i: number) => {
    const el = track.current;
    const card = el?.children[i] as HTMLElement | undefined;
    if (el && card) el.scrollTo({ left: card.offsetLeft - 16, behavior: "smooth" });
  };

  return (
    <div ref={ref as React.Ref<HTMLDivElement>}>
      <SheetSection id="how-title" title="How it works" subtitle="Three steps from invite to cashback.">
        <div
          ref={track}
          onScroll={onScroll}
          className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="list"
        >
          {steps.map((s, i) => (
            <article key={s.t} role="listitem" className="w-[78%] shrink-0 snap-start overflow-hidden rounded-[20px] bg-[#FEF4EA] ring-1 ring-[#F6E2D2]">
              <div className="relative">
                <img src={home(s.img)} alt="" className="block h-[150px] w-full object-cover" draggable={false} />
                <span className="absolute left-3 top-3 rounded-full bg-[#292C31] px-2.5 py-1 text-[11px] font-bold text-white">Step {i + 1}</span>
              </div>
              <div className="px-4 pb-4 pt-1">
                <h3 className="text-[16px] font-extrabold leading-5 text-[#292C31]">{s.t}</h3>
                <p className="mt-1 text-[13px] leading-[18px] text-[#5C5F66]">{s.d}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-3 flex justify-center gap-1.5" aria-hidden>
          {steps.map((_, i) => (
            <button key={i} tabIndex={-1} onClick={() => goTo(i)} className={cn("h-1.5 rounded-full transition-all", i === active ? "w-5 bg-[#292C31]" : "w-1.5 bg-[#D4D5D6]")} />
          ))}
        </div>

        <button onClick={() => setOpen((o) => !o)} className="mt-2 flex w-full items-center justify-between py-3 text-[14px] font-medium text-[#075EE8]" aria-expanded={open}>
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
      </SheetSection>
    </div>
  );
});
HowItWorks.displayName = "HowItWorks";
