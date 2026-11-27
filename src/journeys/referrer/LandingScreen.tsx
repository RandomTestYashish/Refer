import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { BadgeIndianRupee, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Gift, ListChecks, Phone, Receipt, RotateCw, ScrollText, Smartphone, UserPlus, WifiOff } from "lucide-react";
import { Screen, ScreenBody } from "@/components/app/primitives";
import { copyInviteLink } from "@/components/app/InviteKit";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { HeroRadial } from "@/components/refer/HeroRadial";
import { MilestoneCollection, useMilestones } from "@/components/refer/MilestoneCollection";
import { UnlockCelebration } from "@/components/refer/AchievementBadge";
import iconSearch from "@/assets/refer/icon-search.svg";
import iaCopy from "@/assets/refer/ia-copy.svg";
import iaWhatsapp from "@/assets/refer/ia-whatsapp.svg";
import iaMail from "@/assets/refer/ia-mail.svg";
import { useProto } from "@/store/useProto";
import { useStartInvite } from "@/components/refer/ContactsPrompt";
import { haptic, useOnline } from "@/lib/device";
import { cn, inr } from "@/lib/utils";

/**
 * A02 — Refer a App.
 * Calm, white layout: earnings pill → hero card (flip = how it works) → serif proposition → one black CTA →
 * share shortcuts → milestones → how it works → FAQs → T&C → footer.
 */
export function LandingScreen() {
  const rules = useProto((s) => s.rules);
  const navigate = useProto((s) => s.navigate);
  const back = useProto((s) => s.back);
  const celebrated = useProto((s) => s.celebrated);
  const markCelebrated = useProto((s) => s.markCelebrated);
  const online = useOnline();

  const bodyRef = useRef<HTMLDivElement>(null);
  const milestonesRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);
  const howRef = useRef<HTMLElement>(null);
  const amountRef = useRef<HTMLSpanElement>(null);
  const [help, setHelp] = useState(false);
  const [faqOpen, setFaqOpen] = useState<string>("");
  const [tncOpen, setTncOpen] = useState<string>("");
  const [scrolled, setScrolled] = useState(false);

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

  const invite = useStartInvite();
  const scrollTo = (el: HTMLElement | null) => el?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <Screen className="relative">
      {/* Header */}
      {/* Gen4 Top Nav · L1 · heading centred */}
      {/* Pink wash behind the header and hero */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[460px] bg-[linear-gradient(180deg,#FFE6E7_0%,#FFF3F3_45%,#FFFFFF_100%)]" aria-hidden />
      {/* Header floats over the hero so the ring can run up behind it */}
      <div className="absolute inset-x-0 top-[var(--sb,44px)] z-20">
      <header className={cn("grid h-[72px] shrink-0 grid-cols-[40px_1fr_40px] items-center gap-3 border-b px-4 transition-colors", scrolled ? "border-gen4-bg-200 bg-white" : "border-transparent bg-transparent")}>
        <button onClick={back} aria-label="Back" className="flex size-10 items-center justify-center rounded-full text-refer-ink active:scale-90 active:bg-black/5">
          <ChevronLeft className="size-6" strokeWidth={1.8} />
        </button>
        <h1 className="text-center text-[20px] font-bold leading-[22px] text-refer-ink">Refer a App</h1>
        <button onClick={() => setHelp(true)} aria-label="Help" className="flex size-10 items-center justify-center rounded-full text-refer-ink active:scale-90 active:bg-black/5">
          <CircleHelp className="size-6" strokeWidth={1.8} />
        </button>
      </header>
      <AnimatePresence>
        {!online && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="z-10 shrink-0 overflow-hidden bg-[#232326] text-white" role="status" data-testid="offline-banner">
            <p className="flex items-center gap-2 px-5 py-2 text-[12.5px]">
              <WifiOff className="size-4" /> You're offline. You can look around, but invites need a connection.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      </div>

      <ScreenBody ref={bodyRef} className="pb-4">
        {/* Hero: app icon inside a large, partly off-screen dotted radial */}
        <section aria-label="Airtel app">
          <HeroRadial syncRef={amountRef} />
        </section>

        {/* Proposition */}
        <section className="relative px-6 pt-1 text-center">
          <h2 className="font-black italic text-[#151515]">
            <span className="block text-[20px] leading-[26px]">Earn up to</span>
            <span
              ref={amountRef}
              className="mx-auto block w-fit bg-clip-text px-1.5 text-[52px] leading-[62px] tracking-[-0.5px] text-transparent tabular"
              style={{
                // Title red gradient with a light band; HeroRadial moves it (--sheen) right after the icon shine.
                filter: "drop-shadow(0 8px 18px rgba(202,38,43,0.22))",
                backgroundImage:
                  "linear-gradient(105deg, transparent 42%, rgba(255,213,215,0.95) 50%, transparent 58%), linear-gradient(101.6deg, #CA262B 30%, #981C20 100%)",
                backgroundSize: "300% 100%, 100% 100%",
                backgroundPosition: "var(--sheen, 100%) 0, 0 0",
                backgroundRepeat: "no-repeat",
              }}
            >
              {inr(rules.yearlyEarningCap)}
            </span>
            <span className="block text-[20px] leading-[26px]">a year by inviting friends</span>
          </h2>
          {/* Reward split: what you get (brand-filled) + what your friend gets */}
          <p
            className="mx-auto mt-5 flex w-fit items-center gap-2.5 rounded-full border border-[#FFD5D7] bg-white p-1 pr-4 text-[13px] leading-[18px] shadow-[0_6px_18px_rgba(202,38,43,0.14)]"
            data-testid="reward-split"
          >
            <span className="flex items-center gap-1.5 rounded-full bg-[linear-gradient(180deg,#D8343A_0%,#CA262B_55%,#B32126_100%)] py-1.5 pl-2 pr-3 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
              <Gift className="size-4" strokeWidth={2} aria-hidden />
              <span>
                <b className="font-bold">{inr(rules.referrerReward)}</b> for you
              </span>
            </span>
            <span className="text-[#292C31]">
              <b className="font-bold text-[#981C20]">
                {inr(rules.friendReward)} + {rules.friendDataBenefit}
              </b>{" "}
              for them
            </span>
          </p>
        </section>

        {/* Primary action */}
        <section className="mt-6 px-4" aria-label="Invite a friend">
          <motion.button
            whileTap={{ scale: 0.985 }}
            onClick={() => {
              haptic(10);
              invite();
            }}
            disabled={!online}
            data-testid="invite-friends"
            className="flex h-14 w-full items-center justify-center gap-1 rounded-[16px] border border-black bg-black px-3 text-[14px] font-medium leading-[16px] text-white disabled:border-gen4-black-400 disabled:bg-gen4-black-300 disabled:text-gen4-black-500"
          >
            <img src={iconSearch} alt="" className="size-[16.7px]" /> Search &amp; Invite Friends
          </motion.button>

          <div className="mt-6 flex justify-center gap-[41px]">
            <ShareCircle label="Copy link" onClick={() => void copyInviteLink()} icon={<img src={iaCopy} alt="" className="size-5" />} />
            <ShareCircle label="WhatsApp" onClick={() => navigate("a_preview", { mode: "manual", channel: "whatsapp" })} icon={<img src={iaWhatsapp} alt="" className="size-[26.7px]" />} />
            <ShareCircle label="SMS" onClick={() => navigate("a_preview", { mode: "manual", channel: "sms" })} icon={<img src={iaMail} alt="" className="size-5" />} />
          </div>
        </section>

        {/* Milestones */}
        <section ref={milestonesRef} className="mx-5 mt-[33px] scroll-mt-4" aria-labelledby="ms-title">
          <SectionHead id="ms-title" action={{ label: "view all", onClick: () => navigate("a_milestones") }}>
            Your milestones
          </SectionHead>
          <MilestoneCollection />
        </section>

        {/* How it works — Gen4 Growth Inventory carousel */}
        <section ref={howRef} className="mt-8 scroll-mt-4" aria-labelledby="hiw-title">
          <h3 id="hiw-title" className="mx-4 text-[11px] font-bold uppercase leading-[14px] tracking-[1.76px] text-[#3E4146]">
            How it works
          </h3>
          <ol className="no-scrollbar mt-4 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-pl-4 px-4" data-testid="how-it-works">
            {[
              { icon: UserPlus, t: "Invite a friend", d: "Share your link or pick friends from your contacts." },
              { icon: Smartphone, t: "Friend downloads Airtel", d: `They open your link within ${rules.linkValidityHours} hours and sign in.` },
              { icon: Receipt, t: "Friend completes a qualifying transaction", d: `A first recharge of ${inr(rules.minTransaction)} or more within ${rules.firstTxnDeadlineDays} days.` },
              { icon: BadgeIndianRupee, t: "Reward eligibility is fulfilled", d: `You get ${inr(rules.referrerReward)}, your friend gets ${inr(rules.friendReward)} + ${rules.friendDataBenefit}.` },
            ].map(({ icon: Icon, t, d }, i) => (
              <li
                key={t}
                className="relative flex h-[182px] w-[303px] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-[16px] border border-[#E6E9EF] p-4"
                style={{ background: "radial-gradient(160px 120px at 85% 20%, #FFDEDE 0%, #FFFFFF 100%)" }}
              >
                <span className="pointer-events-none absolute -right-2 -top-6 text-[110px] font-black italic leading-none text-[#FFEDED]" aria-hidden>
                  {i + 1}
                </span>
                <span className="relative flex size-11 items-center justify-center rounded-[12px] border border-[#E6E9EF] bg-white text-refer-accent">
                  <Icon className="size-[22px]" strokeWidth={1.8} />
                </span>
                <span className="relative">
                  <span className="block text-[11px] font-bold uppercase leading-[14px] tracking-[1.76px] text-refer-accent">Step {i + 1}</span>
                  <span className="mt-1 block text-[16px] font-bold leading-[20px] text-[#292C31]">{t}</span>
                  <span className="mt-1 block text-[12px] leading-[18px] text-[#696B6F]">{d}</span>
                </span>
              </li>
            ))}
            <span className="w-px shrink-0" aria-hidden />
          </ol>
        </section>

        {/* FAQs & Terms — Gen4 Accordion card */}
        <section ref={faqRef} className="mx-4 mt-8 scroll-mt-4" aria-label="FAQs and terms">
          <AccordionPrimitive.Root
            type="multiple"
            value={[faqOpen ? "faqs" : "", tncOpen ? "tnc" : ""].filter(Boolean)}
            onValueChange={(v) => {
              setFaqOpen(v.includes("faqs") ? faqOpen || "open" : "");
              setTncOpen(v.includes("tnc") ? "tnc" : "");
            }}
            className="flex flex-col gap-2 rounded-[16px] border border-[#E6E9EF] bg-gradient-to-b from-white to-[#F5F5F5] py-2"
          >
            <AccordionRow value="faqs" title="FAQs" testId="faq">
              <AccordionPrimitive.Root
                type="single"
                collapsible
                value={faqOpen === "open" ? "" : faqOpen}
                onValueChange={(v) => setFaqOpen(v || "open")}
                className="-mx-4 border-t border-[#E6E9EF]"
              >
                {[
                  ["who", "Who can I invite?", "Friends who are new to the Airtel app and haven't made a qualifying transaction before."],
                  ["earn", "How much can I earn?", `${inr(rules.referrerReward)} for each friend who qualifies, up to ${inr(rules.yearlyEarningCap)} a year. Milestone badges can add more rewards.`],
                  ["friend", "What does my friend get?", `${inr(rules.friendReward)} + ${rules.friendDataBenefit} after their first recharge of ${inr(rules.minTransaction)} or more.`],
                  ["download", "Does downloading the app count?", "No. Your friend needs to complete a qualifying recharge. Installing or signing up alone doesn't unlock a reward."],
                  ["track", "How do I track my invites?", "Open My referrals from the help menu at the top of this page to see who joined and which rewards are on the way."],
                ].map(([v, q, a]) => (
                  <QuestionRow key={v} value={v} title={q}>
                    {a}
                  </QuestionRow>
                ))}
              </AccordionPrimitive.Root>
            </AccordionRow>
            <AccordionRow value="tnc" title="Terms & conditions" testId="tnc">
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
        <footer className="mx-5 mb-6 mt-[62px]">
          <p className="text-[36px] font-black italic leading-[44px] tracking-[-0.02em] text-gen4-black-200">
            Refer more.
            <br />
            Earn more.
          </p>
          <button onClick={invite} className="mt-3 flex items-center gap-1 text-[14px] font-semibold leading-[16px] text-gen4-action">
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
                scrollTo(howRef.current);
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
            <HelpRow
              icon={<ListChecks className="size-5" />}
              title="My referrals"
              onClick={() => {
                setHelp(false);
                navigate("a_dashboard");
              }}
            />
            <HelpRow icon={<ScrollText className="size-5" />} title="Terms & conditions" onClick={() => { setHelp(false); setTncOpen("tnc"); setTimeout(() => scrollTo(faqRef.current), 250); }} />
            <a href="tel:121" className="flex items-center gap-3 rounded-[14px] bg-[#F6F6F7] px-4 py-3.5 text-[15px] font-semibold text-refer-ink active:scale-[0.99]">
              <Phone className="size-5 text-refer-accent" /> Call customer care · 121
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

function SectionHead({ id, children, action }: { id?: string; children: ReactNode; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="mb-3.5 flex items-center justify-between">
      <h3 id={id} className="text-[12px] font-bold uppercase leading-[14px] tracking-[1.92px] text-refer-muted">
        {children}
      </h3>
      {action && (
        <button onClick={action.onClick} className="flex items-center gap-0.5 text-[14px] font-semibold leading-[16px] text-gen4-action active:opacity-60">
          {action.label} <ChevronRight className="size-4" />
        </button>
      )}
    </div>
  );
}

/** Gen4 Icon Action · Standard: 64 ring (#F0F4F9) around a 60 gradient cell, 12/18 label. */
function ShareCircle({ label, icon, onClick }: { label: string; icon: ReactNode; onClick: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.93 }}
      onClick={() => {
        haptic(6);
        onClick();
      }}
      className="flex w-16 flex-col items-center gap-2 whitespace-nowrap text-[11px] font-medium leading-[16px] text-[#292C31]"
    >
      <span className="flex size-16 items-center justify-center rounded-full border-2 border-gen4-bg-50">
        <span className="flex size-[60px] items-center justify-center rounded-full border-2 border-white bg-gradient-to-b from-gen4-bg-50 to-white shadow-[0_5px_5.62px_rgba(143,165,227,0.2)]">
          {icon}
        </span>
      </span>
      {label}
    </motion.button>
  );
}

function HelpRow({ icon, title, onClick }: { icon: ReactNode; title: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 rounded-[14px] bg-[#F6F6F7] px-4 py-3.5 text-left text-[15px] font-semibold text-refer-ink active:scale-[0.99]">
      <span className="text-refer-accent">{icon}</span>
      <span className="flex-1">{title}</span>
      <ChevronRight className="size-4 text-refer-muted" />
    </button>
  );
}

/** Gen4 Accordion row: Bold 16, 16/8 padding, chevron. */
function AccordionRow({ value, title, testId, children }: { value: string; title: string; testId?: string; children: ReactNode }) {
  return (
    <AccordionPrimitive.Item value={value} data-testid={testId}>
      <AccordionPrimitive.Header>
        <AccordionPrimitive.Trigger className="flex w-full items-center gap-2 px-4 py-2 text-left text-[16px] font-bold leading-[24px] text-[#292C31] outline-none focus-visible:bg-gen4-bg-50 [&[data-state=open]>svg]:rotate-180">
          <span className="flex-1">{title}</span>
          <ChevronDown className="size-6 shrink-0 text-[#292C31] transition-transform duration-300 ease-out" strokeWidth={1.6} />
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content className="overflow-hidden text-[14px] leading-[20px] text-refer-muted data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <div className="px-4 pb-3 pt-1">{children}</div>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  );
}

/** A question inside the FAQs row. */
function QuestionRow({ value, title, children }: { value: string; title: string; children: ReactNode }) {
  return (
    <AccordionPrimitive.Item value={value} className="border-b border-[#E6E9EF] last:border-0">
      <AccordionPrimitive.Header>
        <AccordionPrimitive.Trigger className="flex min-h-[48px] w-full items-center gap-3 px-4 py-3 text-left text-[14px] font-semibold leading-[20px] text-[#292C31] outline-none focus-visible:bg-gen4-bg-50 [&[data-state=open]>svg]:rotate-180">
          <span className="flex-1">{title}</span>
          <ChevronDown className="size-5 shrink-0 text-[#696B6F] transition-transform duration-300 ease-out" strokeWidth={1.6} />
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content className="overflow-hidden text-[14px] leading-[20px] text-refer-muted data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <div className="px-4 pb-3">{children}</div>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  );
}
