import { ChevronRight, UserPlus } from "lucide-react";
import { AppBar, Screen, ScreenBody, ScreenFooter } from "@/components/app/primitives";
import { ReferralLinkField, ShareRow } from "@/components/app/InviteKit";
import { CARD, LinkButton, SectionTitle } from "@/components/app/gen4";
import { MilestoneTrack } from "@/components/app/Milestones";
import { motion } from "framer-motion";
import { home } from "@/assets/home";
import { ContactAvatar } from "@/components/app/primitives";
import { CONTACTS } from "@/domain/data";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { referralStats, useProto } from "@/store/useProto";
import { inr } from "@/lib/utils";

/** A02 — Refer & Earn landing, in the Airtel Home (Gen4 Figma) visual language. */
export function LandingScreen() {
  const rules = useProto((s) => s.rules);
  const referrals = useProto((s) => s.referrals);
  const past = useProto((s) => s.pastSuccesses);
  const granted = useProto((s) => s.contactsGranted);
  const navigate = useProto((s) => s.navigate);
  const stats = referralStats(referrals, past, rules.referrerReward);
  const nextM = rules.milestones.find((m) => stats.milestoneCount < m.target);
  const inviteContacts = () => navigate(granted ? "a_contacts" : "a_permission");

  return (
    <Screen className="bg-[#FFE3E3]">
      <AppBar title="Refer & Earn" transparent className="bg-[#FFE3E3]" />
      <ScreenBody className="bg-white pb-8">
        {/* Hero — illustrated stage in the curated-banner style */}
        <div className="relative overflow-hidden bg-[linear-gradient(180deg,#FFE3E3_0%,#FFF1EC_55%,#FFFFFF_100%)] pb-6">
          {/* concentric rings (Explore card motif), faded at the top so there's no hard edge under the header */}
          <div className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(180deg,transparent_0%,black_35%,black_70%,transparent_100%)]">
            <span className="absolute left-1/2 top-[-60px] size-[360px] -translate-x-1/2 rounded-full border-[28px] border-white/45" />
            <span className="absolute left-1/2 top-[10px] size-[220px] -translate-x-1/2 rounded-full border-[22px] border-white/50" />
          </div>

          <div className="relative mx-auto h-[196px] w-[343px]">
            {/* megaphone */}
            <motion.img
              src={home("tile-refer.png")}
              alt=""
              className="absolute left-[54px] top-[34px] h-[140px] w-[236px] object-contain drop-shadow-[0_14px_18px_rgba(150,20,30,0.18)]"
              initial={{ scale: 0.85, opacity: 0, rotate: -6 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 160, damping: 14 }}
            />
            {/* gift */}
            <motion.img
              src={home("tile-rewards.png")}
              alt=""
              className="absolute right-[-6px] top-[112px] h-[78px] w-[130px] object-contain"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            />
            {/* reward badges */}
            {[
              { cls: "left-[6px] top-[96px]", d: 0.25 },
              { cls: "right-[34px] top-[22px]", d: 0.35 },
            ].map((b, i) => (
              <motion.span
                key={i}
                className={`absolute ${b.cls} rounded-[12px] bg-[linear-gradient(180deg,#FC5252,#E32121)] px-3 py-1.5 text-[18px] font-bold text-white shadow-[0_8px_16px_rgba(227,33,33,0.35)]`}
                initial={{ scale: 0 }}
                animate={{ scale: 1, y: [0, -4, 0] }}
                transition={{ scale: { delay: b.d, type: "spring" }, y: { duration: 3, repeat: Infinity, delay: b.d } }}
              >
                {inr(rules.referrerReward)}
              </motion.span>
            ))}
            {/* friends */}
            {[
              { img: "avatar-1.jpg", cls: "left-[18px] top-[18px]", s: 44 },
              { img: "avatar-2.jpg", cls: "left-[150px] top-[4px]", s: 38 },
              { img: "avatar-3.jpg", cls: "right-[96px] top-[146px]", s: 40 },
            ].map(({ img, cls, s: size }, i) => (
              <motion.span
                key={img}
                className={`absolute ${cls} rounded-full ring-[3px] ring-white shadow-[0_6px_14px_rgba(0,0,0,0.12)]`}
                initial={{ scale: 0 }}
                animate={{ scale: 1, y: [0, -5, 0] }}
                transition={{ scale: { delay: 0.15 + i * 0.08, type: "spring" }, y: { duration: 3.4, repeat: Infinity, delay: i * 0.6 } }}
              >
                <img src={home(img)} alt="" className="block rounded-full object-cover" style={{ width: size, height: size }} />
              </motion.span>
            ))}
          </div>

          <div className="relative px-5 text-center">
            <h1 className="mt-1 text-[26px] font-bold leading-8 text-[#292C31]">
              Invite friends, get
              <br />
              <span className="text-[#E32121]">{inr(rules.referrerReward)} cashback</span> each
            </h1>
            <p className="mx-auto mt-2 max-w-[290px] text-[13px] leading-[19px] text-[#3E4146]">
              Credited when your friend registers. They get {inr(rules.friendReward)} cashback + {rules.friendDataGB}GB data on their first recharge or bill payment.
            </p>
          </div>

          <div className="relative mx-4 mt-5 grid grid-cols-2 gap-2">
            {[
              { l: "You get", v: `${inr(rules.referrerReward)}`, d: "Cashback for every friend who registers" },
              { l: "Friend gets", v: `${inr(rules.friendReward)} + ${rules.friendDataGB}GB`, d: "Cashback + data on first recharge or bill" },
            ].map(({ l, v, d }) => (
              <div key={l} className={`rounded-[16px] px-3 py-3 text-center ${CARD}`}>
                <p className="text-[11px] font-bold uppercase tracking-[1.76px] text-[#696B6F]">{l}</p>
                <p className="mt-0.5 text-[22px] font-bold text-[#292C31]">{v}</p>
                <p className="mt-0.5 text-[11px] leading-[14px] text-[#696B6F]">{d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Share */}
        <div className="mt-8 px-4">
          <SectionTitle>your invite link</SectionTitle>
          <ReferralLinkField className="mt-4" />
          <p className="mt-2 text-[12px] leading-[16px] text-[#696B6F]">Each invite gets its own link, valid for {rules.linkValidityHours} hours.</p>
          <div className="mt-5">
            <ShareRow onShare={() => navigate("a_preview", { mode: "manual" })} />
          </div>
        </div>

        {/* Your referrals — single summary card */}
        <div className="mt-8 px-4">
          <SectionTitle>your referrals</SectionTitle>
          <button onClick={() => navigate("a_dashboard")} className={`mt-4 block w-full rounded-[16px] text-left active:scale-[0.99] ${CARD}`}>
            <div className="grid grid-cols-3 divide-x divide-[#E6E9EF] py-4 text-center">
              {[
                { l: "Earned", v: inr(stats.earned), c: "text-[#292C31]" },
                { l: "Pending", v: String(stats.pending), c: stats.pending ? "text-[#DA9802]" : "text-[#292C31]" },
                { l: "Successful", v: String(stats.successful), c: stats.successful ? "text-[#0F7033]" : "text-[#292C31]" },
              ].map(({ l, v, c }) => (
                <div key={l}>
                  <p className={`text-[20px] font-bold leading-6 tabular ${c}`}>{v}</p>
                  <p className="mt-1 text-[11px] font-medium text-[#696B6F]">{l}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 border-t border-[#E6E9EF] px-4 py-3">
              {referrals.length > 0 ? (
                <span className="flex -space-x-2">
                  {referrals.slice(0, 3).map((r) => {
                    const c = CONTACTS.find((x) => x.id === r.contactId);
                    return <ContactAvatar key={r.id} name={r.name} hue={c?.hue ?? 200} size={26} className="ring-2 ring-white" />;
                  })}
                </span>
              ) : null}
              <span className="flex-1 text-[13px] font-medium text-[#3E4146]">
                {stats.total === 0 ? "No friends invited yet" : `${stats.total} ${stats.total === 1 ? "friend" : "friends"} invited`}
              </span>
              <span className="flex items-center text-[14px] font-medium text-[#075EE8]">
                View all <ChevronRight className="size-4" />
              </span>
            </div>
          </button>
        </div>

        {/* Milestones — highlighted */}
        <div className="mt-8 px-4">
          <SectionTitle action={<LinkButton onClick={() => navigate("a_milestones")}>View all</LinkButton>}>milestones</SectionTitle>
          <button
            onClick={() => navigate("a_milestones")}
            className="relative mt-4 block w-full overflow-hidden rounded-[20px] border border-[#FFD5D7] bg-[linear-gradient(135deg,#FFF0F0_0%,#FFF8EE_100%)] text-left shadow-[0_8px_24px_rgba(227,33,33,0.10)] active:scale-[0.99]"
          >
            <span className="pointer-events-none absolute -right-10 -top-12 size-40 rounded-full border-[18px] border-white/60" />
            <div className="relative flex items-center gap-3 px-4 pt-4">
              <img src={home("tile-rewards.png")} alt="" className="h-[58px] w-[92px] shrink-0 object-contain drop-shadow-[0_6px_10px_rgba(120,60,20,0.18)]" />
              <div className="min-w-0 flex-1">
                {nextM ? (
                  <>
                    <p className="text-[10px] font-bold uppercase tracking-[1.76px] text-[#E32121]">Next level</p>
                    <p className="text-[18px] font-bold leading-6 text-[#292C31]">{nextM.label}</p>
                    <p className="text-[12px] leading-4 text-[#3E4146]">
                      <b>{nextM.target - stats.milestoneCount}</b> more {nextM.target - stats.milestoneCount === 1 ? "referral" : "referrals"} to unlock
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-[10px] font-bold uppercase tracking-[1.76px] text-[#E32121]">All levels unlocked</p>
                    <p className="text-[18px] font-bold leading-6 text-[#292C31]">You're at Gold</p>
                  </>
                )}
              </div>
            </div>
            {nextM && (
              <div className="relative mx-4 mt-3 flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white">
                  <motion.div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#FC5252,#E32121)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(4, (stats.milestoneCount / nextM.target) * 100)}%` }}
                    transition={{ duration: 0.9, delay: 0.2 }}
                  />
                </div>
                <span className="text-[12px] font-bold text-[#292C31] tabular">
                  {stats.milestoneCount}/{nextM.target}
                </span>
              </div>
            )}
            <div className="relative mx-4 mb-4 mt-4 rounded-[14px] bg-white/80 px-2 pb-3 pt-4">
              <MilestoneTrack milestones={rules.milestones} count={stats.milestoneCount} />
            </div>
          </button>
        </div>

        {/* How it works */}
        <div className="mt-8 px-4">
          <SectionTitle>how it works</SectionTitle>
          <ol className="mt-4 space-y-4">
            {[
              ["Share your link", "By SMS, WhatsApp, QR or any app."],
              [`Friend registers, you get ${inr(rules.referrerReward)}`, "Cashback you can use on your next recharge or bill payment."],
              [`Friend gets ${inr(rules.friendReward)} + ${rules.friendDataGB}GB`, "Cashback and data on their first recharge or bill payment."],
            ].map(([t, d], i) => (
              <li key={t} className="flex items-start gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#F0F4F9] text-[13px] font-bold text-[#292C31]">{i + 1}</span>
                <span>
                  <span className="block text-[14px] font-bold leading-[18px] text-[#292C31]">{t}</span>
                  <span className="block text-[12px] leading-[18px] text-[#696B6F]">{d}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* FAQ */}
        <div className="mt-8 px-4">
          <SectionTitle>questions</SectionTitle>
          <Accordion type="single" collapsible className="mt-1">
            <AccordionItem value="when">
              <AccordionTrigger>When will I get my reward?</AccordionTrigger>
              <AccordionContent>
                Your {inr(rules.referrerReward)} cashback is credited for every friend who registers on Airtel with your link. Use it on your next recharge
                or bill payment. Track every invite in My Referrals.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="existing">
              <AccordionTrigger>What does my friend get?</AccordionTrigger>
              <AccordionContent>
                {inr(rules.friendReward)} cashback plus {rules.friendDataGB}GB data, credited when they complete their first bill payment or recharge. Only for
                first-time Airtel users.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="expired">
              <AccordionTrigger>My friend's link expired. What now?</AccordionTrigger>
              <AccordionContent>Links last {rules.linkValidityHours} hours. Resend from My Referrals to create a fresh one.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="tnc">
              <AccordionTrigger>Terms & Conditions</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc space-y-1.5 pl-4">
                  <li>Referrer benefit: {inr(rules.referrerReward)} cashback for every user that registers, usable on the next recharge or bill payment.</li>
                  <li>
                    Referee benefit: {inr(rules.friendReward)} cashback + {rules.friendDataGB}GB data on completing the first bill payment or recharge.
                  </li>
                  <li>Referee benefit applies to first-time users only.</li>
                  <li>The referral goes to the first valid invite link your friend opens.</li>
                </ul>
                <p className="mt-2 text-[11px] italic">All values shown are provisional working assumptions.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </ScreenBody>
      <ScreenFooter className="bg-white">
        <Button size="lg" block onClick={inviteContacts}>
          <UserPlus /> Invite from contacts
        </Button>
      </ScreenFooter>
    </Screen>
  );
}
