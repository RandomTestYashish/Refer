import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Copy, MessageSquareText, Phone, RotateCw, ScrollText, Users, WifiOff } from "lucide-react";
import { Screen, ScreenBody } from "@/components/app/primitives";
import { copyInviteLink } from "@/components/app/InviteKit";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ReferralCard } from "@/components/refer/ReferralCard";
import { MilestoneCollection, useMilestones } from "@/components/refer/MilestoneCollection";
import { UnlockCelebration } from "@/components/refer/AchievementBadge";
import iconWhatsapp from "@/assets/refer/icon-whatsapp.png";
import { useProto } from "@/store/useProto";
import { haptic, useOnline } from "@/lib/device";
import { cn, inr } from "@/lib/utils";

/**
 * A02 — Refer a App.
 * Header → proposition → interactive card (flip = how it works) → invite → milestones → how it works → FAQ → T&C → footer.
 */
export function LandingScreen() {
  const rules = useProto((s) => s.rules);
  const granted = useProto((s) => s.contactsGranted);
  const navigate = useProto((s) => s.navigate);
  const back = useProto((s) => s.back);
  const celebrated = useProto((s) => s.celebrated);
  const markCelebrated = useProto((s) => s.markCelebrated);
  const online = useOnline();

  const bodyRef = useRef<HTMLDivElement>(null);
  const milestonesRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(375);
  const [flipped, setFlipped] = useState(false);
  const [help, setHelp] = useState(false);
  const [faqOpen, setFaqOpen] = useState<string>("");
  const [tncOpen, setTncOpen] = useState<string>("");
  const [scrolled, setScrolled] = useState(false);

  useLayoutEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const { scrollY } = useScroll({ container: bodyRef });
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 8));

  // Reward unlock celebration — once per newly earned tier.
  const { ms, statuses } = useMilestones();
  const toCelebrate = useMemo(() => ms.find((m, i) => statuses[i] === "earned" && !celebrated.includes(m.id)) ?? null, [ms, statuses, celebrated]);
  const [celebrate, setCelebrate] = useState(false);
  useEffect(() => {
    if (!toCelebrate) return;
    const t = setTimeout(() => setCelebrate(true), 500);
    return () => clearTimeout(t);
  }, [toCelebrate]);
  const closeCelebration = () => {
    setCelebrate(false);
    markCelebrated(ms.filter((_, i) => statuses[i] === "earned").map((m) => m.id));
  };

  const cardW = Math.min(335, width - 40);
  const invite = () => navigate(granted ? "a_contacts" : "a_permission");
  const scrollTo = (el: HTMLElement | null) => el?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <Screen className="relative">
      {/* Header */}
      <header
        className={cn(
          "relative z-20 grid h-14 shrink-0 grid-cols-[40px_1fr_40px] items-center px-2 transition-colors duration-200",
          scrolled ? "border-b border-gen4-bg-100 bg-white/95 backdrop-blur" : "border-b border-transparent bg-white",
        )}
      >
        <button onClick={back} aria-label="Back" className="flex size-10 items-center justify-center rounded-full text-black active:scale-90 active:bg-black/5">
          <ChevronLeft className="size-6" />
        </button>
        <h1 className="text-center text-[18px] font-bold leading-[22px] text-airtel-ink">Refer a App</h1>
        <button onClick={() => setHelp(true)} aria-label="Help" className="flex size-10 items-center justify-center rounded-full text-airtel-ink active:scale-90 active:bg-black/5">
          <CircleHelp className="size-[22px]" />
        </button>
      </header>
      <AnimatePresence>
        {!online && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="z-10 shrink-0 overflow-hidden bg-[#2B2D33] text-white"
            role="status"
            data-testid="offline-banner"
          >
            <p className="flex items-center gap-2 px-5 py-2 text-[12.5px]">
              <WifiOff className="size-4" /> You're offline. You can look around, but invites need a connection.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <ScreenBody ref={bodyRef} className="pb-4">
        {/* Hero proposition */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(75%_60%_at_50%_30%,#FFE4E7_0%,rgba(255,240,242,0.6)_45%,rgba(255,255,255,0)_100%)]" aria-hidden />
        <section className="relative px-5 pb-2 pt-3">
          <p className="relative text-[12px] font-bold uppercase tracking-[0.14em] text-airtel-red">Invite friends to the Airtel app</p>
          <h2 className="relative mt-1.5 text-[30px] font-extrabold leading-[34px] tracking-[-0.03em] text-airtel-ink">
            Earn up to <span className="text-airtel-red tabular">{inr(rules.yearlyEarningCap)}</span>
            <br />a year
          </h2>
          <p className="relative mt-2 text-[14px] leading-[20px] text-airtel-sub">
            Get {inr(rules.referrerReward)} for every friend who joins and makes a first recharge of {inr(rules.minTransaction)} or more.
          </p>
        </section>

        {/* Interactive card */}
        <section className="relative mt-4 px-5" aria-label="Referral card">
          <ReferralCard width={cardW} flipped={flipped} onFlippedChange={setFlipped} />
          <div className="mt-9 flex justify-center">
            <button
              onClick={() => {
                haptic(8);
                setFlipped((f) => !f);
              }}
              aria-pressed={flipped}
              className="flex h-9 items-center gap-1.5 rounded-full border border-gen4-bg-100 bg-white px-4 text-[13px] font-semibold text-airtel-ink shadow-[0_2px_6px_rgba(41,44,49,0.06)] transition active:scale-95"
              data-testid="flip-toggle"
            >
              <motion.span animate={{ rotate: flipped ? 180 : 0 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}>
                <RotateCw className="size-4 text-airtel-red" />
              </motion.span>
              {flipped ? "Show reward" : "How it works"}
            </button>
          </div>
        </section>

        {/* Invite a friend */}
        <section className="mx-5 mt-7" aria-labelledby="invite-title">
          <SectionTitle id="invite-title">Invite a friend</SectionTitle>
          <Button size="lg" block onClick={invite} disabled={!online} data-testid="invite-friends" className="h-14 rounded-[16px] bg-black text-[16px] hover:bg-black/90">
            <Users /> Invite Friends
          </Button>
          <div className="mt-3 grid grid-cols-3 gap-2.5">
            <ShareTile label="Copy link" onClick={() => void copyInviteLink()} icon={<Copy className="size-[22px] text-airtel-ink" strokeWidth={1.8} />} />
            <ShareTile
              label="WhatsApp"
              onClick={() => navigate("a_preview", { mode: "manual", channel: "whatsapp" })}
              icon={<img src={iconWhatsapp} alt="" className="size-[26px]" />}
            />
            <ShareTile label="SMS" onClick={() => navigate("a_preview", { mode: "manual", channel: "sms" })} icon={<MessageSquareText className="size-[22px] text-airtel-ink" strokeWidth={1.8} />} />
          </div>
          <p className="mt-2.5 text-center text-[11.5px] leading-[16px] text-airtel-sub">Rewards unlock only when your friend completes a qualifying recharge.</p>
        </section>

        {/* Milestones */}
        <section ref={milestonesRef} className="mx-5 mt-9 scroll-mt-4" aria-labelledby="ms-title">
          <div className="flex items-end justify-between">
            <SectionTitle id="ms-title">Your milestones</SectionTitle>
            <button onClick={() => navigate("a_dashboard")} className="mb-3 flex items-center text-[13px] font-semibold text-airtel-red">
              My referrals <ChevronRight className="size-4" />
            </button>
          </div>
          <MilestoneCollection />
        </section>

        {/* How it works (minimal) */}
        <section className="mx-5 mt-9" aria-labelledby="hiw-title">
          <SectionTitle id="hiw-title">How it works</SectionTitle>
          <ol className="relative rounded-[18px] border border-[#ECEEF2] bg-white px-4 py-1">
            {[
              ["Invite a friend", "Share your link or pick friends from your contacts."],
              ["Friend downloads Airtel", `They open your link within ${rules.linkValidityHours} hours and sign in.`],
              ["Friend completes a qualifying transaction", `A first recharge of ${inr(rules.minTransaction)} or more within ${rules.firstTxnDeadlineDays} days.`],
              ["Reward eligibility is fulfilled", `You get ${inr(rules.referrerReward)}, your friend gets ${inr(rules.friendReward)} + ${rules.friendDataBenefit}.`],
            ].map(([t, d], i, arr) => (
              <li key={t} className="relative flex gap-3 py-3">
                {i < arr.length - 1 && <span className="absolute left-[13px] top-[42px] h-[calc(100%-32px)] w-px bg-gen4-bg-100" aria-hidden />}
                <span className="relative flex size-[27px] shrink-0 items-center justify-center rounded-full bg-[#FFF0F1] text-[12px] font-bold text-airtel-red">{i + 1}</span>
                <span>
                  <span className="block text-[14px] font-semibold leading-[19px] text-airtel-ink">{t}</span>
                  <span className="block text-[12.5px] leading-[17px] text-airtel-sub">{d}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        {/* FAQ */}
        <section ref={faqRef} className="mx-5 mt-9 scroll-mt-4" aria-labelledby="faq-title">
          <SectionTitle id="faq-title">FAQs</SectionTitle>
          <AccordionPrimitive.Root type="single" collapsible value={faqOpen} onValueChange={setFaqOpen} className="overflow-hidden rounded-[18px] border border-[#ECEEF2] bg-white" data-testid="faq">
            {[
              ["who", "Who can I invite?", "Friends who are new to the Airtel app and haven't made a qualifying transaction before."],
              ["earn", "How much can I earn?", `${inr(rules.referrerReward)} for each friend who qualifies, up to ${inr(rules.yearlyEarningCap)} a year. Milestone badges can add more rewards.`],
              ["friend", "What does my friend get?", `${inr(rules.friendReward)} + ${rules.friendDataBenefit} after their first recharge of ${inr(rules.minTransaction)} or more.`],
              ["download", "Does downloading the app count?", "No. Your friend needs to complete a qualifying recharge. Installing or signing up alone doesn't unlock a reward."],
              ["track", "How do I track my invites?", "Open My referrals to see who joined, who's recharged and which rewards are on the way."],
            ].map(([v, q, a]) => (
              <AccordionRow key={v} value={v} title={q}>
                {a}
              </AccordionRow>
            ))}
          </AccordionPrimitive.Root>
        </section>

        {/* Terms & conditions */}
        <section className="mx-5 mt-4" aria-label="Terms and conditions">
          <AccordionPrimitive.Root type="single" collapsible value={tncOpen} onValueChange={setTncOpen} className="overflow-hidden rounded-[18px] border border-[#ECEEF2] bg-white" data-testid="tnc">
            <AccordionRow value="tnc" title="Terms & conditions" icon={<ScrollText className="size-[18px] text-airtel-sub" />}>
              <ul className="list-disc space-y-1.5 pl-4">
                <li>The programme is for friends who are new to the Airtel app.</li>
                <li>Your friend must complete a first recharge of {inr(rules.minTransaction)} or more for the offer to activate.</li>
                <li>Credit goes to the first valid referral link your friend opens.</li>
                <li>Platinum is the highest milestone tier you can reach in a month.</li>
                <li>Full programme terms will be published by Airtel.</li>
              </ul>
            </AccordionRow>
          </AccordionPrimitive.Root>
        </section>

        {/* Footer */}
        <footer className="mx-5 mb-4 mt-12">
          <p className="text-[44px] font-extrabold italic leading-[44px] tracking-[-0.04em] text-[#E4E6EB]">
            Refer more.
            <br />
            Earn more.
          </p>
          <button onClick={invite} className="mt-4 flex items-center gap-1 text-[13px] font-semibold text-airtel-red">
            Start inviting <ChevronRight className="size-4" />
          </button>
        </footer>
      </ScreenBody>

      {/* Help */}
      <Sheet open={help} onOpenChange={setHelp}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Need help?</SheetTitle>
            <SheetDescription>Answers about referrals, rewards and eligibility.</SheetDescription>
          </SheetHeader>
          <div className="space-y-2 px-5 pb-8 pt-3">
            <HelpRow
              icon={<RotateCw className="size-5" />}
              title="How referrals work"
              onClick={() => {
                setHelp(false);
                setFlipped(true);
                bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
            <HelpRow
              icon={<CircleHelp className="size-5" />}
              title="Read FAQs"
              onClick={() => {
                setHelp(false);
                setFaqOpen("who");
                setTimeout(() => scrollTo(faqRef.current), 250);
              }}
            />
            <HelpRow icon={<ScrollText className="size-5" />} title="Terms & conditions" onClick={() => { setHelp(false); setTncOpen("tnc"); setTimeout(() => scrollTo(faqRef.current), 250); }} />
            <a href="tel:121" className="flex items-center gap-3 rounded-[14px] bg-airtel-surface px-4 py-3.5 text-[15px] font-semibold text-airtel-ink active:scale-[0.99]">
              <Phone className="size-5 text-airtel-red" /> Call customer care · 121
            </a>
          </div>
        </SheetContent>
      </Sheet>

      <UnlockCelebration
        m={celebrate ? toCelebrate : null}
        onDone={closeCelebration}
        onView={() => {
          closeCelebration();
          setTimeout(() => scrollTo(milestonesRef.current), 200);
        }}
      />
    </Screen>
  );
}

function SectionTitle({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h3 id={id} className="mb-3 text-[17px] font-bold leading-[22px] tracking-[-0.01em] text-airtel-ink">
      {children}
    </h3>
  );
}

function ShareTile({ label, icon, onClick }: { label: string; icon: ReactNode; onClick: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={() => {
        haptic(6);
        onClick();
      }}
      className="flex h-[78px] flex-col items-center justify-center gap-1.5 rounded-[16px] border border-[#ECEEF2] bg-gradient-to-b from-white to-[#F7F8FA] text-[12.5px] font-semibold text-airtel-ink shadow-[0_1px_2px_rgba(41,44,49,0.04)]"
    >
      {icon}
      {label}
    </motion.button>
  );
}

function HelpRow({ icon, title, onClick }: { icon: ReactNode; title: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 rounded-[14px] bg-airtel-surface px-4 py-3.5 text-left text-[15px] font-semibold text-airtel-ink active:scale-[0.99]">
      <span className="text-airtel-red">{icon}</span>
      <span className="flex-1">{title}</span>
      <ChevronRight className="size-4 text-airtel-sub" />
    </button>
  );
}

function AccordionRow({ value, title, icon, children }: { value: string; title: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <AccordionPrimitive.Item value={value} className="border-b border-[#ECEEF2] last:border-0">
      <AccordionPrimitive.Header>
        <AccordionPrimitive.Trigger className="flex min-h-[52px] w-full items-center gap-2.5 px-4 py-3 text-left text-[15px] font-semibold leading-[20px] text-airtel-ink outline-none focus-visible:bg-airtel-surface [&[data-state=open]>svg:last-child]:rotate-180">
          {icon}
          <span className="flex-1">{title}</span>
          <ChevronDown className="size-5 shrink-0 text-airtel-sub transition-transform duration-300 ease-out" />
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content className="overflow-hidden text-[13.5px] leading-[20px] text-airtel-sub data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <div className="px-4 pb-4">{children}</div>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  );
}
