import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Copy, MessageSquareText, Phone, RotateCw, ScrollText, TrendingUp, Users, WifiOff } from "lucide-react";
import { ContactAvatar, Screen, ScreenBody } from "@/components/app/primitives";
import { CONTACTS } from "@/domain/data";
import { copyInviteLink } from "@/components/app/InviteKit";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ReferralCard } from "@/components/refer/ReferralCard";
import { MilestoneCollection, useMilestones } from "@/components/refer/MilestoneCollection";
import { UnlockCelebration } from "@/components/refer/AchievementBadge";
import iconWhatsapp from "@/assets/refer/icon-whatsapp.png";
import { referralStats, useProto } from "@/store/useProto";
import { haptic, useOnline } from "@/lib/device";
import { cn, inr } from "@/lib/utils";

/**
 * A02 — Refer a App.
 * Calm, white layout: earnings pill → hero card (flip = how it works) → serif proposition → one black CTA →
 * share shortcuts → milestones → how it works → FAQs → T&C → footer.
 */
export function LandingScreen() {
  const rules = useProto((s) => s.rules);
  const referrals = useProto((s) => s.referrals);
  const granted = useProto((s) => s.contactsGranted);
  const navigate = useProto((s) => s.navigate);
  const back = useProto((s) => s.back);
  const celebrated = useProto((s) => s.celebrated);
  const markCelebrated = useProto((s) => s.markCelebrated);
  const online = useOnline();
  const earned = referralStats(referrals, 0, rules.referrerReward).earned;

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

  const cardW = Math.min(248, width - 110);
  const invite = () => navigate(granted ? "a_contacts" : "a_permission");
  const scrollTo = (el: HTMLElement | null) => el?.scrollIntoView({ behavior: "smooth", block: "start" });
  const flip = (v: boolean) => {
    haptic(8);
    setFlipped(v);
  };

  return (
    <Screen className="relative">
      {/* Header */}
      {/* Gen4 Top Nav · L1 · heading centred */}
      <header className={cn("relative z-20 grid h-[72px] shrink-0 grid-cols-[40px_1fr_40px] items-center gap-3 border-b bg-white px-4", scrolled ? "border-gen4-bg-200" : "border-transparent")}>
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

      <ScreenBody ref={bodyRef} className="pb-4">
        {/* Earnings pill */}
        <div className="flex justify-center pt-2">
          <button
            onClick={() => navigate("a_dashboard")}
            aria-label={`My referrals. Earned ${inr(earned)} so far`}
            className="rounded-[16px] border border-refer-line bg-gradient-to-b from-white to-[#F5F5F5] px-5 py-2.5 text-center shadow-card active:scale-[0.98]"
          >
            <span className="block text-[11px] font-bold uppercase leading-[14px] tracking-[1.76px] text-refer-muted">Earned from referrals</span>
            <span className="mt-1 flex items-center justify-center gap-2 text-[18px] font-semibold leading-[20px] text-refer-ink tabular">
              {inr(earned)} <TrendingUp className="size-4 text-refer-accent" strokeWidth={1.8} />
            </span>
          </button>
        </div>

        {/* Hero card */}
        <section className="mt-9" aria-label="Referral card">
          <ReferralCard width={cardW} flipped={flipped} onFlippedChange={setFlipped} />
          <div className="mt-10 flex flex-col items-center gap-2.5">
            <div className="flex items-center gap-2" role="tablist" aria-label="Card side">
              {[false, true].map((side) => (
                <button
                  key={String(side)}
                  role="tab"
                  aria-selected={flipped === side}
                  aria-label={side ? "How it works side" : "Reward side"}
                  onClick={() => flip(side)}
                  className="flex h-6 items-center"
                >
                  <motion.span layout className={cn("block h-2 rounded-full border", flipped === side ? "w-6 border-refer-strong bg-refer-strong" : "w-2 border-gen4-black-400 bg-white")} />
                </button>
              ))}
            </div>
            <button
              onClick={() => flip(!flipped)}
              aria-pressed={flipped}
              className="flex items-center gap-1.5 text-[12px] font-medium leading-[14px] text-refer-muted active:scale-95"
              data-testid="flip-toggle"
            >
              <motion.span animate={{ rotate: flipped ? 180 : 0 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}>
                <RotateCw className="size-3.5" />
              </motion.span>
              {flipped ? "Show reward" : "How it works"}
            </button>
          </div>
        </section>

        {/* Proposition */}
        <section className="mt-8 px-6 text-center">
          <h2 className="text-[28px] font-black leading-[36px] tracking-[-0.02em] text-refer-ink [text-wrap:balance]">
            earn up to <span className="italic text-refer-accent tabular">{inr(rules.yearlyEarningCap)}</span>
            <br />a year inviting <span className="italic text-refer-accent">friends</span>
          </h2>
          <p className="mx-auto mt-4 flex h-6 w-fit items-center rounded-[20px] border border-gen4-bg-400 bg-gen4-bg-100 px-3 text-[11px] font-bold italic leading-[14px] text-refer-ink">
            {inr(rules.referrerReward)} for you · {inr(rules.friendReward)} + {rules.friendDataBenefit} for your friend
          </p>
        </section>

        {/* Primary action */}
        <section className="mt-7 px-5" aria-label="Invite a friend">
          {rules.socialProof.trim() && (
            <div className="mb-4 flex items-center justify-center gap-2" data-testid="social-proof">
              <div className="flex shrink-0 -space-x-1.5" aria-hidden>
                {CONTACTS.slice(0, 3).map((c) => (
                  <ContactAvatar key={c.id} name={c.name} hue={c.hue} size={26} className="ring-2 ring-white" />
                ))}
              </div>
              <p className="min-w-0 text-[12px] leading-[18px] text-refer-muted">
                {(() => {
                  const [first, ...rest] = rules.socialProof.trim().split(" ");
                  return (
                    <>
                      <span className="font-bold text-refer-ink">{first}</span> {rest.join(" ")}
                    </>
                  );
                })()}
              </p>
            </div>
          )}
          <motion.button
            whileTap={{ scale: 0.985 }}
            onClick={() => {
              haptic(10);
              invite();
            }}
            disabled={!online}
            data-testid="invite-friends"
            className="flex h-14 w-full items-center justify-center gap-1 rounded-[16px] border border-black bg-black px-3 text-[14px] font-bold leading-[16px] text-white disabled:border-gen4-black-400 disabled:bg-gen4-black-300 disabled:text-gen4-black-500"
          >
            <Users className="size-5" strokeWidth={2} /> Invite Friends
          </motion.button>
          <p className="mt-3 text-center text-[11px] font-bold uppercase leading-[14px] tracking-[1.76px] text-refer-subtle">
            Rewards unlock after a {inr(rules.minTransaction)}+ recharge
          </p>

          <div className="mt-6 flex justify-center gap-6">
            <ShareCircle label="Copy link" onClick={() => void copyInviteLink()} icon={<Copy className="size-[19px] text-refer-ink" strokeWidth={1.7} />} />
            <ShareCircle label="WhatsApp" onClick={() => navigate("a_preview", { mode: "manual", channel: "whatsapp" })} icon={<img src={iconWhatsapp} alt="" className="size-[22px]" />} />
            <ShareCircle label="SMS" onClick={() => navigate("a_preview", { mode: "manual", channel: "sms" })} icon={<MessageSquareText className="size-[19px] text-refer-ink" strokeWidth={1.7} />} />
          </div>
        </section>

        {/* Milestones */}
        <section ref={milestonesRef} className="mx-5 mt-12 scroll-mt-4" aria-labelledby="ms-title">
          <SectionHead id="ms-title" action={{ label: "view all", onClick: () => navigate("a_milestones") }}>
            Your milestones
          </SectionHead>
          <MilestoneCollection />
        </section>

        {/* How it works (minimal) */}
        <section className="mx-5 mt-11" aria-labelledby="hiw-title">
          <SectionHead id="hiw-title">How it works</SectionHead>
          <ol className="rounded-[16px] border border-refer-line bg-gradient-to-b from-white to-[#F5F5F5] px-4 py-1 shadow-card">
            {[
              ["Invite a friend", "Share your link or pick friends from your contacts."],
              ["Friend downloads Airtel", `They open your link within ${rules.linkValidityHours} hours and sign in.`],
              ["Friend completes a qualifying transaction", `A first recharge of ${inr(rules.minTransaction)} or more within ${rules.firstTxnDeadlineDays} days.`],
              ["Reward eligibility is fulfilled", `You get ${inr(rules.referrerReward)}, your friend gets ${inr(rules.friendReward)} + ${rules.friendDataBenefit}.`],
            ].map(([t, d], i, arr) => (
              <li key={t} className={cn("flex gap-3 py-4", i < arr.length - 1 && "border-b border-refer-line")}>
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-gen4-bg-200 bg-white text-[12px] font-bold leading-[14px] text-refer-ink tabular">{i + 1}</span>
                <span>
                  <span className="block text-[14px] font-semibold leading-[20px] text-refer-ink">{t}</span>
                  <span className="block text-[12px] leading-[18px] text-refer-muted">{d}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        {/* FAQ */}
        <section ref={faqRef} className="mx-5 mt-11 scroll-mt-4" aria-labelledby="faq-title">
          <SectionHead id="faq-title">FAQs</SectionHead>
          <AccordionPrimitive.Root type="single" collapsible value={faqOpen} onValueChange={setFaqOpen} className="overflow-hidden rounded-[16px] border border-refer-line bg-gradient-to-b from-white to-[#F5F5F5] shadow-card" data-testid="faq">
            {[
              ["who", "Who can I invite?", "Friends who are new to the Airtel app and haven't made a qualifying transaction before."],
              ["earn", "How much can I earn?", `${inr(rules.referrerReward)} for each friend who qualifies, up to ${inr(rules.yearlyEarningCap)} a year. Milestone badges can add more rewards.`],
              ["friend", "What does my friend get?", `${inr(rules.friendReward)} + ${rules.friendDataBenefit} after their first recharge of ${inr(rules.minTransaction)} or more.`],
              ["download", "Does downloading the app count?", "No. Your friend needs to complete a qualifying recharge. Installing or signing up alone doesn't unlock a reward."],
              ["track", "How do I track my invites?", "Tap your earnings at the top of this page to see who joined, who's recharged and which rewards are on the way."],
            ].map(([v, q, a]) => (
              <AccordionRow key={v} value={v} title={q}>
                {a}
              </AccordionRow>
            ))}
          </AccordionPrimitive.Root>
        </section>

        {/* Terms & conditions */}
        <section className="mx-5 mt-3" aria-label="Terms and conditions">
          <AccordionPrimitive.Root type="single" collapsible value={tncOpen} onValueChange={setTncOpen} className="overflow-hidden rounded-[16px] border border-refer-line bg-gradient-to-b from-white to-[#F5F5F5] shadow-card" data-testid="tnc">
            <AccordionRow value="tnc" title="Terms & conditions" icon={<ScrollText className="size-[18px] text-refer-muted" strokeWidth={1.8} />}>
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
        <footer className="mx-6 mb-6 mt-14">
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
      className="flex w-[74px] flex-col items-center gap-2 text-[12px] leading-[18px] text-refer-ink"
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

function AccordionRow({ value, title, icon, children }: { value: string; title: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <AccordionPrimitive.Item value={value} className="border-b border-refer-line last:border-0">
      <AccordionPrimitive.Header>
        <AccordionPrimitive.Trigger className="flex min-h-[56px] w-full items-center gap-3 px-4 py-4 text-left text-[16px] leading-[18px] text-refer-ink outline-none focus-visible:bg-gen4-bg-50 [&[data-state=open]>svg:last-child]:rotate-180">
          {icon}
          <span className="flex-1">{title}</span>
          <ChevronDown className="size-5 shrink-0 text-refer-ink transition-transform duration-300 ease-out" strokeWidth={1.8} />
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content className="overflow-hidden text-[14px] leading-[20px] text-refer-muted data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <div className="px-4 pb-4">{children}</div>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  );
}
