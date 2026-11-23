import { forwardRef, useRef, useState, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { SectionTitle } from "@/components/app/gen4";
import { Button } from "@/components/ui/button";
import type { BusinessRules } from "@/config/businessRules";
import { EarnArt, RechargeArt, ShareArt } from "@/components/app/refer/CashArt";
import { cn, inr } from "@/lib/utils";

const Em = ({ children }: { children: ReactNode }) => <b className="font-bold italic text-[#292C31]">{children}</b>;

/** How it works: three offer-style step cards in a swipeable carousel, each leading to the invite flow. */
export const HowItWorks = forwardRef<HTMLElement, { rules: BusinessRules; onInvite: () => void }>(({ rules, onInvite }, ref) => {
  const [active, setActive] = useState(0);
  const track = useRef<HTMLDivElement>(null);

  const steps: { Art: typeof ShareArt; title: string; body: ReactNode }[] = [
    {
      Art: ShareArt,
      title: "Share link",
      body: (
        <>
          Invite on WhatsApp, SMS or any app. Valid for <Em>{rules.linkValidityHours} hours</Em>
        </>
      ),
    },
    {
      Art: RechargeArt,
      title: `Recharge ${inr(rules.minTransaction)}+`,
      body: (
        <>
          Your friend joins Airtel and recharges within <Em>{rules.firstTxnDeadlineDays} days</Em>
        </>
      ),
    },
    {
      Art: EarnArt,
      title: `Earn ${inr(rules.referrerReward)}`,
      body: (
        <>
          Your friend also gets <Em>{inr(rules.friendReward)} + {rules.friendDataGB} GB</Em> after validation
        </>
      ),
    },
  ];

  const onScroll = () => {
    const el = track.current;
    const card = el?.firstElementChild as HTMLElement | null;
    if (!el || !card) return;
    setActive(Math.round(el.scrollLeft / (card.offsetWidth + 12)));
  };
  const goTo = (i: number) => {
    const el = track.current;
    const card = el?.children[i] as HTMLElement | undefined;
    if (el && card) el.scrollTo({ left: card.offsetLeft - 16, behavior: "smooth" });
  };

  return (
    <section ref={ref} aria-labelledby="how-title" className="px-4 pt-8">
      <h2 id="how-title">
        <SectionTitle>How it works</SectionTitle>
      </h2>
      <div
        ref={track}
        onScroll={onScroll}
        className="-mx-4 mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="list"
      >
        {steps.map((s, i) => (
          <article
            key={s.title}
            role="listitem"
            className="relative h-[208px] w-[86%] shrink-0 snap-start overflow-hidden rounded-[16px] border border-[#E6E9EF] bg-[linear-gradient(135deg,#EDEDEA_0%,#F6F6F4_48%,#FFFFFF_100%)] p-4"
          >
            <s.Art className="pointer-events-none absolute bottom-3 right-2 h-[106px] w-[116px]" />
            <h3 className="w-fit whitespace-nowrap bg-[linear-gradient(90deg,#17181B,#55585E)] bg-clip-text pr-1 text-[28px] font-black italic leading-8 text-transparent">{s.title}</h3>
            <p className="mt-0.5 text-[12px] font-medium uppercase italic leading-[18px] text-black">
              Step {i + 1} of {steps.length}
            </p>
            <p className="mt-2 w-[150px] text-[13px] leading-[18px] text-[#3E4146]">{s.body}</p>
            <Button size="sm" className="absolute bottom-4 left-4 hover:border-black hover:bg-black" onClick={onInvite}>
              Invite Now <ArrowRight />
            </Button>
          </article>
        ))}
      </div>

      <div className="mt-3 flex justify-center gap-1" aria-hidden>
        {steps.map((_, i) => (
          <button key={i} tabIndex={-1} onClick={() => goTo(i)} className={cn("h-1 rounded-full transition-all", i === active ? "w-4 bg-[#292C31]" : "w-1 bg-[#D4D5D6]")} />
        ))}
      </div>
    </section>
  );
});
HowItWorks.displayName = "HowItWorks";
