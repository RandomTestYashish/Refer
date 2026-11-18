import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Headphones, UserPlus } from "lucide-react";
import { AppBar, Screen, ScreenBody } from "@/components/app/primitives";
import { ReferralLinkField, ShareRow } from "@/components/app/InviteKit";
import { CARD, SectionTitle } from "@/components/app/gen4";
import { EarnHero } from "@/components/app/refer/EarnHero";
import { HowItWorks } from "@/components/app/refer/HowItWorks";
import { ReferralProgress, currentMilestone } from "@/components/app/refer/ReferralProgress";
import { ReferralActivity } from "@/components/app/refer/ReferralActivity";
import { MilestoneUnlockSheet } from "@/components/app/refer/MilestoneUnlockSheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { referralStats, useProto } from "@/store/useProto";
import { track, trackWhenVisible } from "@/lib/analytics";
import { inr } from "@/lib/utils";

const BADGE_KEY = "refer:lastSeenBadge";

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
 * A02 — Refer & Earn landing (Enhance Prompt Zero).
 * Hierarchy: Hero (₹5,000/year) → Invite → How it works → Progress → Activity → FAQs → T&C → Support.
 * Same page for both entry points (Home "Invite a Friend" and menu "Refer a Friend").
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
    track(source === "hero" ? "hero_cta_clicked" : "invite_friends_clicked", { source });
    navigate(granted ? "a_contacts" : "a_permission");
    setTimeout(() => (inviting.current = false), 800);
  };

  // Sticky CTA only once the hero CTA has scrolled away.
  const heroRef = useRef<HTMLDivElement>(null);
  const [showSticky, setShowSticky] = useState(false);
  useEffect(() => {
    const el = heroRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setShowSticky(!e.isIntersecting), { threshold: 0 });
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
    }, 900);
    return () => clearTimeout(t);
  }, [badge, successful]);

  const offline = network === "failure";
  const retry = () => {
    if (useProto.getState().scenario.network === "failure") toast.error("Still offline", { description: "Your referral data is saved. Try again when you're connected." });
    else toast.success("Activity updated");
  };

  return (
    <Screen className="bg-[#FFE3E3]">
      <AppBar title="Refer & Earn" transparent className="bg-[#FFE3E3]" />
      <ScreenBody className="bg-white pb-28">
        {/* 1 — Hero + primary CTA */}
        <div ref={heroRef}>
          <EarnHero rules={rules} onInvite={() => invite("hero")} />
        </div>

        {/* 2 — Share your link */}
        <section aria-labelledby="share-title" className="mt-6 px-4">
          <SectionTitle>
            <span id="share-title">or share your link</span>
          </SectionTitle>
          <ReferralLinkField className="mt-4" />
          <p className="mt-2 text-[12px] leading-[16px] text-[#696B6F]">Each invite gets its own link, valid for {rules.linkValidityHours} hours.</p>
          <div className="mt-5">
            <ShareRow
              onShare={(channel) => {
                track("invite_friends_clicked", { source: `share_${channel}` });
                navigate("a_preview", { mode: "manual" });
              }}
            />
          </div>
        </section>

        {/* 3 — How it works */}
        <HowItWorks ref={howRef} rules={rules} />

        {/* 4 — Milestones */}
        <ReferralProgress
          ref={progressRef}
          rules={rules}
          successful={successful}
          earned={stats.earned}
          onViewAll={() => navigate("a_milestones")}
          onInvite={() => invite("progress")}
        />

        {/* 5 — Referral activity */}
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

        {/* 6 — FAQs */}
        <section aria-labelledby="faq-title" className="mt-8 px-4">
          <SectionTitle>
            <span id="faq-title">questions</span>
          </SectionTitle>
          <Accordion type="single" collapsible className="mt-1" onValueChange={(v) => v && track("faq_opened", { question: v })}>
            {[
              ["earn", "How can I earn rewards?", `Share your link. You earn ${inr(rules.referrerReward)} cashback for every friend who joins Airtel and completes an eligible recharge or bill payment, up to ${inr(rules.referrerReward * rules.referralCapYear)} a year.`],
              ["successful", "What makes a referral successful?", `Your friend joins through your link and completes their first recharge or bill payment of ${inr(rules.minTransaction)}+ within ${rules.firstTxnDeadlineDays} days, and the transaction passes validation.`],
              ["friend", "What does my friend need to do?", `Open your invitation, sign in to the Airtel app and complete a first recharge or bill payment of ${inr(rules.minTransaction)}+. They get ${inr(rules.friendReward)} cashback + ${rules.friendDataGB}GB data (first-time users only).`],
              ["when", "When will I receive my reward?", `After your friend's transaction is validated, which can take up to ${rules.rewardValidationDays} days. Use your cashback within ${rules.cashbackValidityDays} days on a recharge or bill payment.`],
              ["limit", "Is there a monthly invitation limit?", `Yes. Up to ${rules.referralCapMonth} rewarded referrals a month and ${rules.referralCapYear} a year.`],
              ["track", "How can I track my referrals?", "Referral activity on this page shows your latest invites. Tap View all to see every invite and its full timeline in My Referrals."],
              ["pending", "Why is my reward still pending?", "Your friend may not have completed the eligible action yet, or the transaction is still being validated. You'll be notified when it's credited."],
              ["ineligible", "Why was my referral not eligible?", "Common reasons: your friend was already an Airtel user, joined through someone else's link first, or didn't complete the eligible action in time."],
              ["expired", "What happens if an invitation expires?", `Links last ${rules.linkValidityHours} hours. You can resend from My Referrals to create a fresh link; the earlier invite stays in your history.`],
            ].map(([id, q, a]) => (
              <AccordionItem key={id} value={id}>
                <AccordionTrigger>{q}</AccordionTrigger>
                <AccordionContent>{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* 7 — Terms & Conditions */}
        <section aria-labelledby="tnc-title" className="mt-8 px-4">
          <SectionTitle>
            <span id="tnc-title">terms &amp; conditions</span>
          </SectionTitle>
          <Accordion type="single" collapsible className="mt-1" onValueChange={(v) => v && track("terms_viewed")}>
            <AccordionItem value="tnc">
              <AccordionTrigger>Read the programme terms</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc space-y-1.5 pl-4">
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
                <p className="mt-2 text-[11px] italic">Prototype: values shown are working assumptions pending business approval.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* 8 — Support */}
        <section className="mt-6 px-4">
          <button
            onClick={() => {
              track("support_clicked");
              toast("Connecting you to Airtel support", { description: "Prototype: no ticket is actually raised." });
            }}
            className={`flex w-full items-center gap-3 rounded-[16px] px-4 py-3.5 text-left active:scale-[0.99] ${CARD}`}
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#F0F4F9]">
              <Headphones className="size-5 text-[#292C31]" strokeWidth={1.6} />
            </span>
            <span className="flex-1">
              <span className="block text-[14px] font-bold text-[#292C31]">Need help with a referral?</span>
              <span className="block text-[12px] text-[#696B6F]">Contact Airtel support</span>
            </span>
          </button>
        </section>
      </ScreenBody>

      {/* Sticky CTA, shown once the hero CTA scrolls away */}
      <AnimatePresence>
        {showSticky && (
          <motion.div
            initial={{ y: 90 }}
            animate={{ y: 0 }}
            exit={{ y: 90 }}
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
            className="absolute inset-x-0 bottom-0 z-10 border-t border-[#E6E9EF] bg-white px-5 pb-[30px] pt-3"
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
