import { forwardRef, useRef, useState, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { SectionTitle } from "@/components/app/gen4";
import { Button } from "@/components/ui/button";
import type { BusinessRules } from "@/config/businessRules";
import { home } from "@/assets/home";
import { cn, inr } from "@/lib/utils";

const Em = ({ children }: { children: ReactNode }) => <b className="font-bold italic text-[#292C31]">{children}</b>;

/** How it works: three offer-style step cards in a swipeable carousel, each leading to the invite flow. */
export const HowItWorks = forwardRef<HTMLElement, { rules: BusinessRules; onInvite: () => void }>(({ rules, onInvite }, ref) => {
  const [active, setActive] = useState(0);
  const track = useRef<HTMLDivElement>(null);

  const steps: { img: string; title: string; body: ReactNode; imgClass: string }[] = [
    {
      img: "how-share.png",
      title: "Share link",
      imgClass: "h-[112px]",
      body: (
        <>
          Invite on WhatsApp, SMS or any app. Valid for <Em>{rules.linkValidityHours} hours</Em>
        </>
      ),
    },
    {
      img: "how-recharge.png",
      title: `Recharge ${inr(rules.minTransaction)}+`,
      imgClass: "h-[112px]",
      body: (
        <>
          Your friend joins Airtel and recharges within <Em>{rules.firstTxnDeadlineDays} days</Em>
        </>
      ),
    },
    {
      img: "how-earn.png",
      title: `Earn ${inr(rules.referrerReward)}`,
      imgClass: "h-[124px]",
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
            className="relative h-[208px] w-[86%] shrink-0 snap-start overflow-hidden rounded-[16px] border border-[#F3DDA3] bg-[linear-gradient(135deg,#FFF0C7_0%,#FFF8E6_48%,#FFFDF7_100%)] p-4"
          >
            <img src={home(s.img)} alt="" draggable={false} className={cn("pointer-events-none absolute bottom-3 right-3 w-auto max-w-[112px] object-contain", s.imgClass)} />
            <h3 className="w-fit whitespace-nowrap bg-[linear-gradient(90deg,#7A4300,#B87A08)] bg-clip-text pr-1 text-[28px] font-black italic leading-8 text-transparent">{s.title}</h3>
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
