import { motion } from "framer-motion";
import { ArrowRight, ChevronRight, Gift, Send, Smartphone, UserPlus, Wallet } from "lucide-react";
import { AppBar, RewardCoin, Screen, ScreenBody, ScreenFooter, SectionTitle } from "@/components/app/primitives";
import { MilestoneTrack } from "@/components/app/Milestones";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { referralStats, useProto } from "@/store/useProto";
import { inr } from "@/lib/utils";

export function LandingScreen() {
  const rules = useProto((s) => s.rules);
  const referrals = useProto((s) => s.referrals);
  const past = useProto((s) => s.pastSuccesses);
  const granted = useProto((s) => s.contactsGranted);
  const navigate = useProto((s) => s.navigate);
  const stats = referralStats(referrals, past, rules.referrerReward);
  const next = rules.milestones.find((m) => stats.milestoneCount < m.target);

  return (
    <Screen className="bg-white">
      <AppBar
        title="Refer & Earn"
        right={
          <Button size="sm" variant="ghost" onClick={() => navigate("a_dashboard")} className="text-airtel-red">
            My Referrals
          </Button>
        }
      />
      <ScreenBody className="pb-6">
        {/* Hero */}
        <div className="relative mx-4 overflow-hidden rounded-[24px] bg-gradient-to-b from-[#FFF1F3] to-white px-5 pb-6 pt-6">
          <motion.div
            className="absolute -right-6 -top-6 size-36 rounded-full bg-airtel-red/[0.06]"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 5, repeat: Infinity }}
          />
          <Badge variant="soft" className="mb-3">
            <Gift /> Refer & Earn
          </Badge>
          <h1 className="text-display">
            Invite friends.
            <br />
            <span className="text-airtel-red">You both get {inr(rules.referrerReward)}.</span>
          </h1>
          <p className="mt-2 max-w-[270px] text-[14px] leading-[20px] text-airtel-sub">
            When your friend joins Airtel and completes their first eligible recharge, you're both rewarded.
          </p>

          {/* Dual-sided reward */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            {[
              { who: "You get", amt: rules.referrerReward, sub: "for every friend who recharges" },
              { who: "Your friend gets", amt: rules.friendReward, sub: `on first recharge of ${inr(rules.minTransaction)}+` },
            ].map((c, i) => (
              <motion.div
                key={c.who}
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                className="rounded-[18px] border border-airtel-line bg-white p-3.5 shadow-card"
              >
                <RewardCoin amount={c.amt} size={44} />
                <p className="mt-3 text-[12px] font-medium text-airtel-sub">{c.who}</p>
                <p className="text-[24px] font-extrabold tracking-[-0.03em]">{inr(c.amt)}</p>
                <p className="mt-0.5 text-[11.5px] leading-[15px] text-airtel-sub">{c.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <button
          onClick={() => navigate("a_dashboard")}
          className="mx-4 mt-4 flex w-[calc(100%-32px)] items-center gap-3 rounded-[16px] bg-airtel-surface px-4 py-3.5 text-left active:scale-[0.99]"
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-white">
            <Wallet className="size-5 text-airtel-red" />
          </span>
          <span className="flex-1">
            <span className="block text-[12px] text-airtel-sub">Rewards earned</span>
            <span className="block text-[17px] font-bold tabular">
              {inr(stats.earned)}{" "}
              <span className="text-[12px] font-medium text-airtel-sub">
                · {stats.total} invited · {stats.successful} successful
              </span>
            </span>
          </span>
          <ChevronRight className="size-5 text-airtel-sub" />
        </button>

        {/* Milestones */}
        <div className="mt-6">
          <SectionTitle
            action={
              <button onClick={() => navigate("a_milestones")} className="flex items-center gap-0.5 text-[13px] font-semibold text-airtel-red">
                View all <ChevronRight className="size-4" />
              </button>
            }
          >
            Milestones
          </SectionTitle>
          <button onClick={() => navigate("a_milestones")} className="mx-4 block w-[calc(100%-32px)] rounded-[18px] border border-airtel-line p-4 pt-6 text-left">
            <MilestoneTrack milestones={rules.milestones} count={stats.milestoneCount} />
            <p className="mt-3 text-center text-[12.5px] text-airtel-sub">
              {next ? (
                <>
                  <b className="text-airtel-ink">{next.target - stats.milestoneCount}</b> more successful{" "}
                  {next.target - stats.milestoneCount === 1 ? "referral" : "referrals"} to reach <b className="text-airtel-ink">{next.label}</b>
                </>
              ) : (
                "All milestones unlocked — you're a Gold referrer!"
              )}
            </p>
          </button>
        </div>

        {/* How it works */}
        <div className="mt-7">
          <SectionTitle>How it works</SectionTitle>
          <ol className="mx-5 space-y-0">
            {[
              { icon: Send, t: "Invite your friends", d: "Share your personal link by SMS, WhatsApp or any app." },
              { icon: Smartphone, t: "They join Airtel", d: `Your friend opens the link and signs in to the Airtel app.` },
              { icon: UserPlus, t: "They make a first recharge", d: `A recharge of ${inr(rules.minTransaction)} or more within ${rules.firstTxnDeadlineDays} days.` },
              { icon: Gift, t: "You both get rewarded", d: `${inr(rules.referrerReward)} for you and ${inr(rules.friendReward)} for your friend, after validation.` },
            ].map(({ icon: Icon, t, d }, i, arr) => (
              <li key={t} className="relative flex gap-3.5 pb-5">
                {i < arr.length - 1 && <span className="absolute left-[17px] top-9 h-[calc(100%-36px)] w-px bg-airtel-line" />}
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-airtel-red-soft text-airtel-red">
                  <Icon className="size-[18px]" />
                </span>
                <span className="pt-0.5">
                  <span className="block text-[14px] font-semibold">{t}</span>
                  <span className="block text-[13px] leading-[18px] text-airtel-sub">{d}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* Terms */}
        <div className="mx-5 mt-2">
          <Accordion type="single" collapsible>
            <AccordionItem value="tnc">
              <AccordionTrigger>Terms & Conditions</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc space-y-1.5 pl-4">
                  <li>Referrer earns {inr(rules.referrerReward)} and referred friend earns {inr(rules.friendReward)} per successful referral.</li>
                  <li>Friend must complete a first eligible recharge of {inr(rules.minTransaction)} or more within {rules.firstTxnDeadlineDays} days of joining.</li>
                  <li>Each invitation link is valid for {rules.linkValidityHours} hours. You can resend an expired invitation at any time.</li>
                  <li>The referral is attributed to the first valid invitation link your friend opens.</li>
                  <li>Rewards are credited after a validation period of up to {rules.rewardValidationDays} days. Reversed or refunded transactions are not eligible.</li>
                  <li>Existing active Airtel users who have already completed a qualifying transaction are not eligible.</li>
                  <li>Milestone benefits (Bronze, Silver, Gold) will be announced separately.</li>
                </ul>
                <p className="mt-2 text-[11px] italic">All values shown are provisional working assumptions.</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq">
              <AccordionTrigger>When will I get my reward?</AccordionTrigger>
              <AccordionContent>
                As soon as your friend's first eligible recharge is validated. You can track every step in My Referrals.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </ScreenBody>
      <ScreenFooter>
        <Button size="lg" block onClick={() => navigate(granted ? "a_contacts" : "a_permission")}>
          Invite Friends <ArrowRight />
        </Button>
      </ScreenFooter>
    </Screen>
  );
}
