import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion";
import { toast } from "sonner";
import { ChevronDown, Headphones, UserPlus } from "lucide-react";
import { AppBar, Screen, ScreenBody } from "@/components/app/primitives";
import { ReferralLinkField, ShareRow } from "@/components/app/InviteKit";
import { PremiumHero, HERO_HEIGHT } from "@/components/app/refer/PremiumHero";
import { HowItWorks } from "@/components/app/refer/HowItWorks";
import { ReferralProgress, currentMilestone } from "@/components/app/refer/ReferralProgress";
import { ReferralActivity } from "@/components/app/refer/ReferralActivity";
import { MilestoneUnlockSheet } from "@/components/app/refer/MilestoneUnlockSheet";
import { ListRow, SheetSection } from "@/components/app/refer/SheetUI";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { referralStats, useProto } from "@/store/useProto";
import { track, trackWhenVisible } from "@/lib/analytics";
import { cn, inr } from "@/lib/utils";

const BADGE_KEY = "refer:lastSeenBadge";
const SHEET_OVERLAP = 28;
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
  const sheetTop = HERO_HEIGHT - SHEET_OVERLAP - NAV_H;
  const navBg = useTransform(scrollY, [sheetTop - 60, sheetTop], [0, 1]);
  const onScroll = (e: React.UIEvent<HTMLDivElement>) => scrollY.set(e.currentTarget.scrollTop);

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

  const [termsOpen, setTermsOpen] = useState(false);
  const offline = network === "failure";
  const retry = () => {
    if (useProto.getState().scenario.network === "failure") toast.error("Still offline", { description: "Your referral data is saved. Try again when you're connected." });
    else toast.success("Activity updated");
  };

  return (
    <Screen className="bg-[#F9E9E3] pt-0">
      {/* Header floats over the banner; solid once the sheet reaches the top */}
      <div className="absolute inset-x-0 top-0 z-30 pt-[44px]">
        <motion.div className="absolute inset-0 border-b border-[#E6E9EF] bg-white" style={{ opacity: navBg }} aria-hidden />
        <AppBar title="Refer & Earn" transparent />
      </div>

      <ScreenBody className="overscroll-contain pb-28" onScroll={onScroll}>
        {/* Banner (stays put) */}
        <div className="sticky top-0 z-0">
          <PremiumHero rules={rules} />
        </div>

        {/* Overlay bottom sheet */}
        <div className="relative z-10 rounded-t-[24px] bg-white shadow-[0_-10px_30px_rgba(120,40,20,0.10)]" style={{ marginTop: -SHEET_OVERLAP }}>
          <div className="flex justify-center pt-4" aria-hidden>
            <span className="h-[5px] w-9 rounded-full bg-[#D4D5D6]" />
          </div>

          {/* Invite */}
          <section aria-label="Invite friends" className="px-4 pt-6">
            <div ref={ctaRef}>
              <Button size="lg" block onClick={() => invite("sheet_cta")}>
                <UserPlus /> Invite Friends
              </Button>
            </div>
            <p className="mt-5 text-[12px] font-semibold text-[#696B6F]">Or share your link</p>
            <ReferralLinkField className="mt-2" />
            <p className="mt-2 text-[12px] leading-[16px] text-[#696B6F]">Each invite gets its own link, valid for {rules.linkValidityHours} hours.</p>
            <div className="mt-4">
              <ShareRow
                onShare={(channel) => {
                  track("invite_friends_clicked", { source: `share_${channel}` });
                  navigate("a_preview", { mode: "manual" });
                }}
              />
            </div>
          </section>

          <ReferralProgress
            ref={progressRef}
            rules={rules}
            successful={successful}
            earned={stats.earned}
            onViewAll={() => navigate("a_milestones")}
            onInvite={() => invite("progress")}
          />

          <HowItWorks ref={howRef} rules={rules} />

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
                ["friend", "What does my friend need to do?", `Open your invitation, sign in to the Airtel app and complete a first recharge or bill payment of ${inr(rules.minTransaction)}+. They get ${inr(rules.friendReward)} cashback + ${rules.friendDataGB}GB data (first-time users only).`],
                ["when", "When will I receive my reward?", `After your friend's transaction is validated, which can take up to ${rules.rewardValidationDays} days. Use your cashback within ${rules.cashbackValidityDays} days on a recharge or bill payment.`],
                ["limit", "Is there a monthly invitation limit?", `Yes. Up to ${rules.referralCapMonth} rewarded referrals a month and ${rules.referralCapYear} a year.`],
                ["pending", "Why is my reward still pending?", "Your friend may not have completed the eligible action yet, or the transaction is still being validated. You'll be notified when it's credited."],
                ["ineligible", "Why was my referral not eligible?", "Common reasons: your friend was already an Airtel user, joined through someone else's link first, or didn't complete the eligible action in time."],
                ["expired", "What happens if an invitation expires?", `Links last ${rules.linkValidityHours} hours. You can resend from My Referrals to create a fresh link; the earlier invite stays in your history.`],
              ].map(([id, q, a]) => (
                <AccordionItem key={id} value={id} className="border-b border-[#E6E9EF]">
                  <AccordionTrigger className="text-[15px] font-bold">{q}</AccordionTrigger>
                  <AccordionContent>{a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {/* Terms */}
            <button
              onClick={() => {
                setTermsOpen((o) => !o);
                if (!termsOpen) track("terms_viewed");
              }}
              className="mt-4 flex items-center gap-1 text-[14px] font-medium text-[#075EE8]"
              aria-expanded={termsOpen}
            >
              Terms & conditions <ChevronDown className={cn("size-4 transition-transform", termsOpen && "rotate-180")} />
            </button>
            {termsOpen && (
              <ul className="mt-3 list-disc space-y-1.5 pl-4 text-[12.5px] leading-[18px] text-[#3E4146]">
                <li>Referrer benefit: {inr(rules.referrerReward)} cashback for every eligible referred user, usable on the next recharge or bill payment.</li>
                <li>Referee benefit: {inr(rules.friendReward)} cashback + {rules.friendDataGB}GB data on completing the first bill payment or recharge. First-time users only.</li>
                <li>Minimum transaction value of {inr(rules.minTransaction)} for reward eligibility.</li>
                <li>Cap on referrals per user: {rules.referralCapMonth} per month, {rules.referralCapYear} per year.</li>
                <li>Cashback must be consumed within {rules.cashbackValidityDays} days from allocation.</li>
                <li>The referred friend must complete the qualifying transaction within {rules.firstTxnDeadlineDays} days of joining.</li>
                <li>Rewards are credited after validation, which can take up to {rules.rewardValidationDays} days.</li>
                <li>The referral is attributed to the first valid invitation link the friend opens. Links are valid for {rules.linkValidityHours} hours.</li>
                <li>Reversed or refunded transactions are not eligible.</li>
                <li>Milestone badges are recognition only and carry no additional cash reward.</li>
              </ul>
            )}
          </SheetSection>

          {/* Support + fine print */}
          <section className="px-4 pt-6">
            <ListRow
              icon={<Headphones />}
              title="Need help with a referral?"
              sub="Contact Airtel support"
              divider={false}
              onClick={() => {
                track("support_clicked");
                toast("Connecting you to Airtel support", { description: "Prototype: no ticket is actually raised." });
              }}
            />
            <p className="pb-6 pt-4 text-center text-[12px] text-[#696B6F]">Cashback has no cash value. Rewards go to the Airtel number that sent the invite.</p>
          </section>
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
            <Button size="lg" block onClick={() => invite("sticky")}>
              <UserPlus /> Invite Friends
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
