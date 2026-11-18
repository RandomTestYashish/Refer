import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ChevronRight, Gift, Lock, QrCode, UserPlus, Users } from "lucide-react";
import { AppBar, Screen, ScreenBody, ScreenFooter } from "@/components/app/primitives";
import { AvatarStack, QrInviteSheet, ReferralLinkField, ShareRow } from "@/components/app/InviteKit";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { referralStats, useProto } from "@/store/useProto";
import { cn, inr } from "@/lib/utils";

/**
 * A02 — Refer & Earn landing.
 * Patterns from the "Refer a Friend — Mobile Screens" Mobbin collection: bold who-gets-what headline
 * (Instacart / Oportun), benefit rows (Locals / KOHO), copyable link field (Superpower / Whatnot),
 * round share targets (Urban Company / Setel), QR invite (Tabby / Greenlight), earned/pending summary
 * (Oportun / Rakuten), vertical milestone ladder (Numo / Origin), numbered steps + FAQ (GoPay / Trip.com).
 */
export function LandingScreen() {
  const rules = useProto((s) => s.rules);
  const referrals = useProto((s) => s.referrals);
  const past = useProto((s) => s.pastSuccesses);
  const granted = useProto((s) => s.contactsGranted);
  const navigate = useProto((s) => s.navigate);
  const [qr, setQr] = useState(false);
  const stats = referralStats(referrals, past, rules.referrerReward);
  const inviteContacts = () => navigate(granted ? "a_contacts" : "a_permission");

  return (
    <Screen>
      <AppBar
        title="Refer & Earn"
        right={
          <button
            onClick={() => navigate("a_dashboard")}
            className="flex h-8 items-center gap-1.5 rounded-full bg-airtel-surface pl-2.5 pr-3 text-[12.5px] font-bold active:scale-95"
            aria-label="My Referrals"
          >
            <Gift className="size-3.5 text-airtel-red" />
            {inr(stats.earned)} earned
          </button>
        }
      />
      <ScreenBody className="pb-6">
        {/* Hero */}
        <div className="px-5 pt-3">
          <AvatarStack size={60} />
          <motion.h1 initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="mt-5 text-display">
            {inr(rules.referrerReward)} for you,
            <br />
            <span className="text-airtel-red">{inr(rules.friendReward)} for your friend</span>
          </motion.h1>
          <p className="mt-2 text-[14px] leading-[20px] text-airtel-sub">
            Invite friends to Airtel. When they complete their first eligible recharge, you both get rewarded.
          </p>
        </div>

        {/* Who gets what */}
        <ul className="mx-5 mt-5 divide-y divide-airtel-line rounded-[18px] border border-airtel-line">
          {[
            { icon: Gift, t: `You get ${inr(rules.referrerReward)}`, d: "For every friend who completes a qualifying recharge" },
            { icon: UserPlus, t: `Your friend gets ${inr(rules.friendReward)}`, d: `On their first recharge of ${inr(rules.minTransaction)}+ within ${rules.firstTxnDeadlineDays} days` },
          ].map(({ icon: Icon, t, d }) => (
            <li key={t} className="flex items-center gap-3.5 px-4 py-3.5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-airtel-red-soft text-airtel-red">
                <Icon className="size-5" />
              </span>
              <span>
                <span className="block text-[15px] font-bold">{t}</span>
                <span className="block text-[12.5px] leading-[17px] text-airtel-sub">{d}</span>
              </span>
            </li>
          ))}
        </ul>

        {/* Share */}
        <div className="mx-5 mt-6">
          <p className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-airtel-sub">Your invite link</p>
          <ReferralLinkField />
          <p className="mt-1.5 text-[11.5px] text-airtel-sub">Each invite sent to a contact gets its own link, valid for {rules.linkValidityHours} hours.</p>
          <div className="mt-5">
            <ShareRow onShare={() => navigate("a_preview", { mode: "manual" })} onQr={() => setQr(true)} />
          </div>
        </div>

        {/* Summary */}
        <button onClick={() => navigate("a_dashboard")} className="mx-5 mt-7 block w-[calc(100%-40px)] rounded-[18px] bg-airtel-surface p-4 text-left active:scale-[0.99]">
          <div className="grid grid-cols-3 divide-x divide-[#E2E2E2]">
            {[
              ["Total earned", inr(stats.earned)],
              ["Pending", String(stats.pending)],
              ["Successful", String(stats.successful)],
            ].map(([l, v], i) => (
              <div key={l} className={cn(i > 0 && "pl-3.5")}>
                <p className="text-[11.5px] text-airtel-sub">{l}</p>
                <p className="text-[20px] font-extrabold tracking-[-0.02em] tabular">{v}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-[#E2E2E2] pt-3 text-[13px] font-semibold">
            <span className="flex items-center gap-2">
              <Users className="size-4 text-airtel-sub" /> {stats.total} {stats.total === 1 ? "friend" : "friends"} invited
            </span>
            <span className="flex items-center text-airtel-red">
              My Referrals <ChevronRight className="size-4" />
            </span>
          </div>
        </button>

        {/* Milestone ladder */}
        <div className="mx-5 mt-7">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[17px] font-bold tracking-[-0.01em]">Milestones</h3>
            <button onClick={() => navigate("a_milestones")} className="flex items-center text-[13px] font-semibold text-airtel-red">
              View all <ChevronRight className="size-4" />
            </button>
          </div>
          <ol className="relative">
            {rules.milestones.map((m, i, arr) => {
              const unlocked = stats.milestoneCount >= m.target;
              const current = !unlocked && (i === 0 || stats.milestoneCount >= arr[i - 1].target);
              return (
                <li key={m.id} className="relative flex gap-3.5 pb-4 last:pb-0">
                  {i < arr.length - 1 && <span className={cn("absolute left-[17px] top-9 h-[calc(100%-36px)] w-[2px] rounded", unlocked ? "bg-airtel-success" : "bg-airtel-line")} />}
                  <span
                    className={cn(
                      "relative z-[1] flex size-9 shrink-0 items-center justify-center rounded-full text-[13px] font-bold",
                      unlocked ? "bg-airtel-success text-white" : current ? "bg-airtel-red text-white" : "bg-airtel-surface text-airtel-sub",
                    )}
                  >
                    {unlocked ? <Check className="size-4" strokeWidth={3} /> : current ? m.target : <Lock className="size-3.5" />}
                  </span>
                  <div className={cn("flex flex-1 items-center justify-between rounded-[14px] px-3.5 py-2.5", current ? "bg-airtel-red-soft/60" : "bg-transparent")}>
                    <span>
                      <span className="block text-[14px] font-bold">{m.label}</span>
                      <span className="block text-[12px] text-airtel-sub">
                        {m.target} successful {m.target === 1 ? "referral" : "referrals"}
                        {m.id !== "first" && " · benefit to be announced"}
                      </span>
                    </span>
                    <span className="text-[12px] font-semibold text-airtel-sub tabular">
                      {Math.min(stats.milestoneCount, m.target)}/{m.target}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* How it works */}
        <div className="mx-5 mt-8">
          <h3 className="mb-3 text-[17px] font-bold tracking-[-0.01em]">How it works</h3>
          <ol className="space-y-3">
            {[
              ["Share your link", "Send it by SMS, WhatsApp, QR code or any app."],
              ["Your friend joins Airtel", "They open the link and sign in to the Airtel app."],
              [`They recharge ${inr(rules.minTransaction)}+`, `Their first eligible recharge within ${rules.firstTxnDeadlineDays} days.`],
              ["You both get rewarded", `After validation (up to ${rules.rewardValidationDays} days), ${inr(rules.referrerReward)} each.`],
            ].map(([t, d], i) => (
              <li key={t} className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-[8px] bg-airtel-ink text-[12px] font-bold text-white">{i + 1}</span>
                <span>
                  <span className="block text-[14px] font-semibold">{t}</span>
                  <span className="block text-[12.5px] leading-[18px] text-airtel-sub">{d}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* FAQ */}
        <div className="mx-5 mt-8">
          <h3 className="mb-1 text-[17px] font-bold tracking-[-0.01em]">Questions</h3>
          <Accordion type="single" collapsible>
            <AccordionItem value="when">
              <AccordionTrigger>When will I get my reward?</AccordionTrigger>
              <AccordionContent>
                After your friend's first eligible recharge is validated, which can take up to {rules.rewardValidationDays} days. Track every step in My Referrals.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="what">
              <AccordionTrigger>What does my friend need to do?</AccordionTrigger>
              <AccordionContent>
                Open your link, sign in to the Airtel app and complete a first recharge of {inr(rules.minTransaction)} or more within {rules.firstTxnDeadlineDays} days.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="existing">
              <AccordionTrigger>Can I invite someone who already uses Airtel?</AccordionTrigger>
              <AccordionContent>
                Existing active users who have already made a qualifying transaction aren't eligible. Rules for existing users without one are still being finalised.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="expired">
              <AccordionTrigger>My friend's link expired. What now?</AccordionTrigger>
              <AccordionContent>
                Links last {rules.linkValidityHours} hours. Resend from My Referrals to create a fresh link. The earlier invite stays in your history.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="tnc">
              <AccordionTrigger>Terms & Conditions</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc space-y-1.5 pl-4">
                  <li>
                    {inr(rules.referrerReward)} to the referrer and {inr(rules.friendReward)} to the referred friend per successful referral.
                  </li>
                  <li>The referral goes to the first valid invitation link your friend opens.</li>
                  <li>Reversed or refunded transactions are not eligible.</li>
                  <li>Milestone benefits (Bronze, Silver, Gold) will be announced separately.</li>
                </ul>
                <p className="mt-2 text-[11px] italic">All values shown are provisional working assumptions.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </ScreenBody>
      <ScreenFooter>
        <div className="flex gap-2.5">
          <Button size="lg" variant="outline" className="w-[56px] shrink-0 px-0" onClick={() => setQr(true)} aria-label="Show QR code">
            <QrCode />
          </Button>
          <Button size="lg" className="flex-1" onClick={inviteContacts}>
            <UserPlus /> Invite from contacts
          </Button>
        </div>
      </ScreenFooter>
      <QrInviteSheet open={qr} onOpenChange={setQr} />
    </Screen>
  );
}
