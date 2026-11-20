import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { AppBar, Screen, ScreenBody } from "@/components/app/primitives";
import { home } from "@/assets/home";
import { currentMilestone } from "@/components/app/refer/ReferralProgress";
import { ReferralActivity } from "@/components/app/refer/ReferralActivity";
import { MilestoneUnlockSheet } from "@/components/app/refer/MilestoneUnlockSheet";
import { SheetSection } from "@/components/app/refer/SheetUI";
import { HowItWorksGrid, IMAGE_HERO_HEIGHT, ImageHero, InviteActions, MilestoneStrip, RewardSplit, StatsBlock } from "@/components/app/refer/LandingBlocks";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { referralStats, useProto } from "@/store/useProto";
import { track, trackWhenVisible } from "@/lib/analytics";
import { inr } from "@/lib/utils";

const BADGE_KEY = "refer:lastSeenBadge";
const NAV_H = 44 + 56;

function readSeenBadge() {
  try {
    return localStorage.getItem(BADGE_KEY);
  } catch {
    return null;
  }
}
function writeSeenBadge(id: string) {
  try {
    localStorage.setItem(BADGE_KEY, id);
  } catch {
    /* storage can be unavailable; the celebration may simply show again */
  }
}

/**
 * A02 — Refer & Earn landing.
 * Banner + overlay bottom sheet (Airtel Points / My Rewards pattern): the ₹5,000 banner stays put
 * while a white sheet with a grabber scrolls up over it. Both entry points land here.
 */
export function LandingScreen({ params }: { params?: Record<string, string> }) {
  const rules = useProto((s) => s.rules);
  const referrals = useProto((s) => s.referrals);
  const past = useProto((s) => s.pastSuccesses);
  const granted = useProto((s) => s.contactsGranted);
  const network = useProto((s) => s.scenario.network);
  const navigate = useProto((s) => s.navigate);
  const stats = referralStats(referrals, past, rules.referrerReward);
  const successful = stats.milestoneCount;
  const badge = currentMilestone(rules.milestones, successful);
  const nextM = rules.milestones.find((m) => successful < m.target);

  // Primary CTA: single navigation, no duplicate taps.
  const inviting = useRef(false);
  const invite = (source: string) => {
    if (inviting.current) return;
    inviting.current = true;
    track(source === "sheet_cta" ? "hero_cta_clicked" : "invite_friends_clicked", { source });
    navigate(granted ? "a_contacts" : "a_permission");
    setTimeout(() => (inviting.current = false), 800);
  };

  // Scroll: banner fades/settles as the sheet covers it; header turns solid at the top.
  // Header background fades in over the last 60px before the sheet reaches it.
  const scrollY = useMotionValue(0);
  const heroEnd = IMAGE_HERO_HEIGHT - NAV_H;
  const navBg = useTransform(scrollY, [heroEnd - 80, heroEnd], [0, 1]);
  const [navOn, setNavOn] = useState(false);
  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    scrollY.set(e.currentTarget.scrollTop);
    setNavOn(e.currentTarget.scrollTop > heroEnd - 40);
  };

  // Sticky CTA only once the in-sheet CTA has scrolled away.
  const ctaRef = useRef<HTMLDivElement>(null);
  const [showSticky, setShowSticky] = useState(false);
  useEffect(() => {
    const el = ctaRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setShowSticky(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Analytics: page view + section views.
  const howRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLElement>(null);
  useEffect(() => {
    track("refer_page_viewed", { entry: params?.entry ?? "direct", successful, earned: stats.earned });
    const a = trackWhenVisible(howRef.current, "how_it_works_viewed");
    const b = trackWhenVisible(progressRef.current, "milestone_section_viewed", { badge: badge?.id ?? "none" });
    return () => {
      a();
      b();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Achievement moment the first time a new badge is seen.
  const [unlockOpen, setUnlockOpen] = useState(false);
  useEffect(() => {
    if (!badge || readSeenBadge() === badge.id) return;
    const t = setTimeout(() => {
      setUnlockOpen(true);
      writeSeenBadge(badge.id);
      track("milestone_unlocked", { badge: badge.id, successful });
    }, 3200);
    return () => clearTimeout(t);
  }, [badge, successful]);

  // "Terms & conditions" tile scrolls to the terms and opens the first section.
  const termsRef = useRef<HTMLDivElement>(null);
  const [termsOpen, setTermsOpen] = useState<string>("");
  const openTerms = () => {
    track("terms_viewed", { section: "tile" });
    setTermsOpen("rewards");
    termsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const offline = network === "failure";
  const retry = () => {
    if (useProto.getState().scenario.network === "failure") toast.error("Still offline.", { description: "Your referral data is saved. Try again when you're connected." });
    else toast.success("Activity updated.");
  };

  return (
    <Screen className="bg-white pt-0">
      {/* Header floats over the banner; solid once the sheet reaches the top */}
      <div className="absolute inset-x-0 top-0 z-30 pt-[44px]">
        <AppBar title="Refer & Earn" transparent className="[&_button]:!text-white [&_div]:!text-white" />
        {/* solid header fades in once the hero scrolls away */}
        <motion.div className="absolute inset-0 border-b border-[#E6E9EF] bg-white pt-[44px]" style={{ opacity: navBg, pointerEvents: navOn ? "auto" : "none" }}>
          <AppBar title="Refer & Earn" transparent />
        </motion.div>
      </div>

      <ScreenBody className="overscroll-contain" onScroll={onScroll}>
        {/* Hero */}
        <ImageHero yearly={rules.referrerReward * rules.referralCapYear} />

        <div className="relative bg-white pb-2">
          {/* Reward split, overlapping the hero */}
          <div className="relative z-10 -mt-7 px-4">
            <RewardSplit rules={rules} />
          </div>

          {/* Milestones up top, as a strip */}
          <section ref={progressRef} aria-label="Referral milestones" className="px-4 pt-7">
            <MilestoneStrip rules={rules} count={successful} onOpen={() => navigate("a_milestones")} />
          </section>

          {/* Status + stats */}
          <section aria-label="Your referrals" className="px-4 pt-8">
            <StatsBlock
              rules={rules}
              successful={successful}
              earned={stats.earned}
              onOpen={(k) => {
                track("referral_activity_opened", { id: k });
                navigate("a_dashboard");
              }}
            />
          </section>

          {/* Invite */}
          <section aria-label="Invite friends" className="px-4 pt-8">
            <InviteActions
              ctaRef={ctaRef}
              onSearch={() => invite("search_cta")}
              onWhatsApp={() => {
                track("invite_friends_clicked", { source: "share_whatsapp" });
                navigate("a_preview", { mode: "manual" });
              }}
            />
            <p className="mt-3 text-center text-[11px] leading-[15px] text-[#696B6F]">Each invite gets its own link, valid for {rules.linkValidityHours} hours.</p>
          </section>

          {/* How it works */}
          <section ref={howRef} aria-labelledby="how-title" className="px-4 pt-9">
            <h2 id="how-title" className="text-[20px] font-extrabold leading-6 text-[#292C31]">
              How it works
            </h2>
            <div className="mt-4">
              <HowItWorksGrid rules={rules} onTerms={openTerms} />
            </div>
          </section>

          <ReferralActivity
            referrals={referrals}
            reward={rules.referrerReward}
            offline={offline}
            onRetry={retry}
            onOpen={(id) => {
              track("referral_activity_opened", { id });
              navigate("a_detail", { id });
            }}
            onViewAll={() => {
              track("referral_activity_opened", { id: "all" });
              navigate("a_dashboard");
            }}
            onInvite={() => invite("activity_empty")}
          />

          {/* FAQs — grouped card */}
          <SheetSection id="faq-title" title="Frequently asked questions">
            <Accordion
              type="single"
              collapsible
              className="overflow-hidden rounded-[16px] border border-[#E6E9EF] bg-[linear-gradient(180deg,#FFFFFF,#F7F7F7)] px-4 [&>div:last-child]:border-0"
              onValueChange={(v) => v && track("faq_opened", { question: v })}
            >
              {[
                ["earn", "How can I earn rewards?", `Share your link. You earn ${inr(rules.referrerReward)} cashback for every friend who joins Airtel and completes an eligible recharge or bill payment, up to ${inr(rules.referrerReward * rules.referralCapYear)} a year.`],
                ["successful", "What makes a referral successful?", `Your friend joins through your link and completes their first recharge or bill payment of ${inr(rules.minTransaction)}+ within ${rules.firstTxnDeadlineDays} days, and the transaction passes validation.`],
                ["friend", "What does my friend need to do?", `Open your invitation, sign in to the Airtel app and complete a first recharge or bill payment of ${inr(rules.minTransaction)}+. They get ${inr(rules.friendReward)} cashback + ${rules.friendDataGB} GB data (first-time users only).`],
                ["when", "When will I receive my reward?", `After your friend's transaction is validated, which can take up to ${rules.rewardValidationDays} days. Use your cashback within ${rules.cashbackValidityDays} days on a recharge or bill payment.`],
                ["limit", "Is there a limit on rewards?", `Yes. Up to ${rules.referralCapMonth} rewarded referrals a month and ${rules.referralCapYear} a year.`],
                ["pending", "Why is my reward still pending?", "Your friend may not have made their first recharge or bill payment yet, or the transaction is still being validated. You'll be notified when it's credited."],
                ["ineligible", "Why was my referral not eligible?", "Common reasons: your friend was already an Airtel user, joined through someone else's link first, or didn't make their first recharge or bill payment in time."],
                ["expired", "What happens if an invitation expires?", `Links last ${rules.linkValidityHours} hours. To create a fresh link, resend it from My Referrals. The earlier invite stays in your history.`],
              ].map(([id, q, a]) => (
                <AccordionItem key={id} value={id} className="border-b border-[#E6E9EF]">
                  <AccordionTrigger className="text-[15px] font-bold">{q}</AccordionTrigger>
                  <AccordionContent>{a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

          </SheetSection>

          {/* Terms — same grouped accordion as the FAQs */}
          <div ref={termsRef} className="scroll-mt-[100px]">
          <SheetSection id="terms-title" title="Terms & conditions">
            <Accordion
              type="single"
              collapsible
              value={termsOpen}
              className="overflow-hidden rounded-[16px] border border-[#E6E9EF] bg-[linear-gradient(180deg,#FFFFFF,#F7F7F7)] px-4 [&>div:last-child]:border-0"
              onValueChange={(v) => {
                setTermsOpen(v);
                if (v) track("terms_viewed", { section: v });
              }}
            >
              {[
                ["rewards", "Rewards", [
                  `You get ${inr(rules.referrerReward)} cashback for every eligible referred user, usable on your next recharge or bill payment`,
                  `Your friend gets ${inr(rules.friendReward)} cashback + ${rules.friendDataGB} GB data on their first recharge or bill payment (first-time users only)`,
                  "Milestone badges are recognition only and carry no additional cash reward",
                ]],
                ["eligibility", "Eligibility", [
                  `Minimum transaction value of ${inr(rules.minTransaction)}`,
                  `Your friend must complete the qualifying transaction within ${rules.firstTxnDeadlineDays} days of joining`,
                  "Reversed or refunded transactions are not eligible",
                ]],
                ["limits", "Limits & validity", [
                  `Up to ${rules.referralCapMonth} rewarded referrals a month and ${rules.referralCapYear} a year`,
                  `Rewards are credited after validation, which can take up to ${rules.rewardValidationDays} days`,
                  `Cashback must be used within ${rules.cashbackValidityDays} days of credit`,
                ]],
                ["attribution", "Invitation links", [
                  `A referral counts for the first valid invitation link your friend opens`,
                  `Links are valid for ${rules.linkValidityHours} hours and can be resent from My Referrals`,
                ]],
              ].map(([id, q, items]) => (
                <AccordionItem key={id as string} value={id as string} className="border-b border-[#E6E9EF]">
                  <AccordionTrigger className="text-[15px] font-bold">{q as string}</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc space-y-1.5 pl-4 text-[13px] leading-[18px] text-[#3E4146]">
                      {(items as string[]).map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </SheetSection>
          </div>

          {/* Page footer */}
          <footer className="mt-12 px-5 pb-32">
            <p className="text-[44px] font-extrabold italic leading-[46px] tracking-[-1.6px] text-[#E4E6EB]">
              Refer more.
              <br />
              Earn more.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <div className="flex -space-x-2">
                {(["first", "bronze", "silver", "gold"] as const).map((b) => (
                  <img key={b} src={home(`badge-${b}.png`)} alt="" className="size-6 rounded-full ring-2 ring-white" />
                ))}
              </div>
              <p className="text-[12px] font-medium text-[#8D9096]">Made with care for Airtel friends</p>
            </div>
          </footer>
        </div>
      </ScreenBody>

      {/* Sticky CTA, shown once the in-sheet CTA scrolls away */}
      <AnimatePresence>
        {showSticky && (
          <motion.div
            initial={{ y: 90 }}
            animate={{ y: 0 }}
            exit={{ y: 90 }}
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
            className="absolute inset-x-0 bottom-0 z-20 border-t border-[#E6E9EF] bg-white px-5 pb-[30px] pt-3"
          >
            <Button size="lg" block className="rounded-full bg-[#E32121] hover:bg-[#E32121]" onClick={() => invite("sticky")}>
              <Search /> Search & Invite Friends
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <MilestoneUnlockSheet
        open={unlockOpen}
        onOpenChange={setUnlockOpen}
        badge={badge}
        next={nextM}
        successful={successful}
        earned={stats.earned}
        onInvite={() => invite("milestone_unlock")}
      />
    </Screen>
  );
}
