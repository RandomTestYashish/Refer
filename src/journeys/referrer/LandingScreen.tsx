import { useState } from "react";
import { motion } from "framer-motion";
import { Info, Link2, Users } from "lucide-react";
import { AppBar, Screen, ScreenFooter } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { PullToInvite } from "@/features/pull-invite/PullToInvite";
import { useProto } from "@/store/useProto";
import { inr } from "@/lib/utils";

/**
 * A02 — Refer a App · Pull, Aim & Invite.
 * Answers three questions on one screen: what can I earn (hero), what should I do (cord + target),
 * how do I start (pull gesture, or the always-visible "Choose contacts" button).
 */
export function LandingScreen() {
  const rules = useProto((s) => s.rules);
  const granted = useProto((s) => s.contactsGranted);
  const navigate = useProto((s) => s.navigate);
  const [how, setHow] = useState(false);
  const openContacts = () => navigate(granted ? "a_contacts" : "a_permission");

  return (
    <Screen>
      <AppBar
        title="Refer a App"
        transparent
        right={
          <button
            onClick={() => navigate("a_dashboard")}
            className="flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[13px] font-semibold text-airtel-ink transition active:scale-95 active:bg-black/5"
          >
            <Users className="size-4" /> My referrals
          </button>
        }
      />

      <main className="flex min-h-0 flex-1 flex-col">
        <section className="px-6 pt-3">
          <motion.h1
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            className="text-balance text-[34px] font-bold leading-[40px] tracking-[-0.03em] text-airtel-ink"
          >
            Earn up to {inr(rules.annualEarningCap)} a year
          </motion.h1>
          <p className="mt-2.5 text-[15px] leading-[22px] text-airtel-sub">
            Get {inr(rules.referrerReward)} for every friend who joins Airtel with your invite and completes their first {rules.qualifyingAction}.
          </p>
          <button onClick={() => setHow(true)} className="mt-2 inline-flex items-center gap-1 rounded-md text-[13px] font-semibold text-airtel-ink underline decoration-gen4-bg-200 underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gen4-action">
            <Info className="size-3.5" /> How referrals work
          </button>
        </section>

        <PullToInvite onInvite={openContacts} className="mx-4 mt-4 min-h-[340px] flex-1" />
      </main>

      <ScreenFooter className="border-t-0 bg-white pt-2">
        <Button size="lg" block onClick={openContacts}>
          <Users /> Choose contacts
        </Button>
        <Button variant="tertiary" className="mx-auto mt-3 flex text-airtel-ink" onClick={() => navigate("a_preview", { mode: "manual" })}>
          <Link2 /> Share your link instead
        </Button>
      </ScreenFooter>

      <Sheet open={how} onOpenChange={setHow}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>How referrals work</SheetTitle>
            <SheetDescription>Your reward is confirmed only after your friend's first {rules.qualifyingAction}.</SheetDescription>
          </SheetHeader>
          <div className="no-scrollbar overflow-y-auto px-5 pb-10 pt-4">
            <ol className="space-y-4">
              {[
                ["Invite a friend", "Send your invite by SMS, WhatsApp or any app."],
                ["They join Airtel", "Your friend opens your link, downloads the Airtel app if needed and registers."],
                [`They complete a first ${rules.qualifyingAction}`, `Of ${inr(rules.minTransaction)} or more, within ${rules.firstTxnDeadlineDays} days.`],
                ["You get rewarded", `${inr(rules.referrerReward)} after validation, which can take up to ${rules.rewardValidationDays} days.`],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-airtel-surface text-[13px] font-bold tabular">{i + 1}</span>
                  <span>
                    <span className="block text-[15px] font-semibold">{t}</span>
                    <span className="block text-[13px] leading-[19px] text-airtel-sub">{d}</span>
                  </span>
                </li>
              ))}
            </ol>
            <div className="mt-6 rounded-[16px] bg-airtel-surface p-4 text-[12.5px] leading-[19px] text-airtel-sub">
              <p className="font-semibold text-airtel-ink">Good to know</p>
              <ul className="mt-1.5 list-disc space-y-1 pl-4">
                <li>Sending an invite or your friend registering doesn't earn a reward on its own.</li>
                <li>The referral goes to the first valid invite link your friend opens.</li>
                <li>Earnings are capped at {inr(rules.annualEarningCap)} a year.</li>
                <li>Reversed or refunded transactions don't qualify.</li>
              </ul>
              <p className="mt-2 text-[11px] italic">Prototype: reward values and limits are awaiting business confirmation.</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </Screen>
  );
}
