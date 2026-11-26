import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Coins, Info, Link2, Smartphone, UserPlus, Users } from "lucide-react";
import { AppBar, Screen } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { PullToInvite } from "@/features/pull-invite/PullToInvite";
import { CONTACTS } from "@/domain/data";
import { useProto } from "@/store/useProto";
import { inr } from "@/lib/utils";

/**
 * A02 — Refer a Friend · Pull, Aim & Invite.
 * 1 Idle: invite card at rest under the proposition. 2 Pull & aim: drag the card down, a beam
 * points at a friend. 3 Let go: confirm and send (A06). Tapping a friend or "All contacts" is the
 * non-gesture route to the same place.
 */
export function LandingScreen() {
  const rules = useProto((s) => s.rules);
  const granted = useProto((s) => s.contactsGranted);
  const referrals = useProto((s) => s.referrals);
  const navigate = useProto((s) => s.navigate);
  const setSelected = useProto((s) => s.setSelected);
  const [how, setHow] = useState(false);

  // Friends you can still invite (no active or completed referral yet).
  const friends = useMemo(
    () => (granted ? CONTACTS.filter((c) => !referrals.some((r) => r.contactId === c.id && r.status !== "expired")) : null),
    [granted, referrals],
  );

  const inviteOne = (id: string) => {
    setSelected([id]);
    navigate("a_preview", { mode: "contacts", from: "pull" });
  };
  const askAccess = () => navigate("a_permission", { from: "landing" });
  const openList = () => navigate(granted ? "a_contacts" : "a_permission");

  return (
    <Screen>
      <AppBar
        title="Refer a Friend"
        transparent
        right={
          <button
            onClick={() => setHow(true)}
            aria-label="How referrals work"
            className="flex size-8 items-center justify-center rounded-full text-[#1D1D1F] transition active:scale-90 active:bg-black/5"
          >
            <Info className="size-[22px]" strokeWidth={1.8} />
          </button>
        }
      />

      <main className="flex min-h-0 flex-1 flex-col">
        <section className="px-6 pt-4">
          <motion.h1
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
            className="text-[40px] font-bold leading-[44px] tracking-[-0.035em] text-[#1D1D1F]"
          >
            Earn up to
            <br />
            <span className="bg-gradient-to-r from-[#E8132F] to-[#FF3B7A] bg-clip-text text-transparent">{inr(rules.annualEarningCap)}</span>
            <br />a year.
          </motion.h1>
          <p className="mt-3 text-[16px] leading-[23px] text-[#3C3C43]/80">
            Invite friends to download the Airtel app and get rewarded when they complete their first {rules.qualifyingAction}.
          </p>
        </section>

        <PullToInvite
          friends={friends}
          onInvite={(id) => (id ? inviteOne(id) : askAccess())}
          onPick={inviteOne}
          onRequestAccess={askAccess}
          onOpenList={openList}
          className="mx-4 mt-5 min-h-[372px] flex-1"
        />
      </main>

      <div className="relative z-10 shrink-0 pb-[30px] pt-1 text-center">
        <button onClick={openList} className="rounded-md px-2 py-1 text-[14px] font-medium text-[hsl(var(--invite))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--invite))]">
          Or choose from your contacts
        </button>
      </div>

      <Sheet open={how} onOpenChange={setHow}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>How referrals work</SheetTitle>
            <SheetDescription>Your reward is confirmed only after your friend's first {rules.qualifyingAction}.</SheetDescription>
          </SheetHeader>
          <div className="no-scrollbar overflow-y-auto px-5 pb-10 pt-4">
            <ul className="divide-y divide-[#F2F2F7]">
              {[
                { icon: UserPlus, tint: "bg-[#E8F1FF] text-[#007AFF]", t: "Invite", d: "Send an invite to your friends." },
                { icon: Smartphone, tint: "bg-[#F4EAFB] text-[#AF52DE]", t: "Get them started", d: "They download the Airtel app and register." },
                {
                  icon: Coins,
                  tint: "bg-[#E6F8EC] text-[#248A3D]",
                  t: "Earn",
                  d: `Get ${inr(rules.referrerReward)} when they complete their first ${rules.qualifyingAction} of ${inr(rules.minTransaction)}+ within ${rules.firstTxnDeadlineDays} days.`,
                },
              ].map(({ icon: Icon, tint, t, d }) => (
                <li key={t} className="flex gap-3.5 py-3">
                  <span className={`flex size-11 shrink-0 items-center justify-center rounded-[14px] ${tint}`}>
                    <Icon className="size-[22px]" />
                  </span>
                  <span>
                    <span className="block text-[16px] font-semibold text-[#1D1D1F]">{t}</span>
                    <span className="block text-[14px] leading-[20px] text-[#3C3C43]/75">{d}</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 rounded-[16px] bg-[#F2F2F7] p-4 text-[12.5px] leading-[19px] text-[#3C3C43]/80">
              <ul className="list-disc space-y-1 pl-4">
                <li>Sending an invite or your friend registering doesn't earn a reward on its own.</li>
                <li>Rewards are confirmed after validation, which can take up to {rules.rewardValidationDays} days.</li>
                <li>The referral goes to the first valid invite link your friend opens.</li>
                <li>Earnings are capped at {inr(rules.annualEarningCap)} a year. Reversed or refunded transactions don't qualify.</li>
              </ul>
              <p className="mt-2 text-[11px] italic">Prototype: reward values and limits are awaiting business confirmation.</p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => { setHow(false); navigate("a_dashboard"); }}>
                <Users /> My referrals
              </Button>
              <Button variant="outline" onClick={() => { setHow(false); navigate("a_preview", { mode: "manual" }); }}>
                <Link2 /> Share link
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </Screen>
  );
}
