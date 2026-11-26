import type { CSSProperties, ReactNode } from "react";
import { motion } from "framer-motion";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { BadgeIndianRupee, Check, ChevronDown, Lock, Send, Smartphone, UserPlus } from "lucide-react";
import { Screen, ScreenBody } from "@/components/app/primitives";
import { copyInviteLink } from "@/components/app/InviteKit";
import { referralStats, useProto } from "@/store/useProto";
import { cn, inr } from "@/lib/utils";

import heroBg from "@/assets/refer/hero-bg.jpg";
import earn5000 from "@/assets/refer/earn-5000.png";
import appIcon from "@/assets/refer/airtel-app-icon.png";
import rewardDivider from "@/assets/refer/reward-divider.png";
import sparkle from "@/assets/refer/sparkle.png";
import iconBack from "@/assets/refer/icon-back.png";
import iconSearch from "@/assets/refer/icon-search.png";
import iconCopy from "@/assets/refer/icon-copy.png";
import iconWhatsapp from "@/assets/refer/icon-whatsapp.png";
import iconMail from "@/assets/refer/icon-mail.png";
import referMore from "@/assets/refer/refer-more.png";

/**
 * A02 — Refer a Friend home, built to the "Refer-a-Friend" Figma frame (375 × 1543).
 * Artwork (rays + phone, app icon, chrome ₹5000, icons) is exported from the design at 3×;
 * all copy, rewards and milestone progress are live from the prototype store.
 * Absolute coordinates in the hero mirror the frame 1:1 (y includes the 44px status bar).
 */

const INK = "#292C31";
const SUB = "#696B6F";
const BODY = "#3E4146";
const RED = "#A21818";
const ALERT = "#E32121";

/** Places an exported asset at its exact frame position/size. */
function Img({ src, x, y, w, h, alt = "", className, style }: { src: string; x?: number; y?: number; w: number; h: number; alt?: string; className?: string; style?: CSSProperties }) {
  return (
    <img
      src={src}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      draggable={false}
      width={w}
      height={h}
      className={cn("pointer-events-none select-none", x !== undefined && "absolute", className)}
      style={{ left: x, top: y, width: w, height: h, maxWidth: "none", ...style }}
    />
  );
}

function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={cn("pl-4 text-[11px] font-bold uppercase leading-[14px] tracking-[1.75px]", className)} style={{ color: BODY }}>
      {children}
    </h2>
  );
}

export function LandingScreen() {
  const rules = useProto((s) => s.rules);
  const referrals = useProto((s) => s.referrals);
  const past = useProto((s) => s.pastSuccesses);
  const granted = useProto((s) => s.contactsGranted);
  const navigate = useProto((s) => s.navigate);
  const back = useProto((s) => s.back);
  const stats = referralStats(referrals, past, rules.referrerReward);

  const inviteContacts = () => navigate(granted ? "a_contacts" : "a_permission");
  const share = () => navigate("a_preview", { mode: "manual" });

  return (
    <Screen className="pt-0">
      <ScreenBody>
        {/* ───────────── Hero (frame y 0–603) ───────────── */}
        <section className="relative h-[603px] w-[375px] overflow-hidden">
          <Img src={heroBg} x={0} y={0} w={375} h={600} />

          <h1 className="pointer-events-none absolute inset-x-0 top-[68.5px] text-center text-[20px] font-bold leading-[24px] text-black">Refer a App</h1>

          <button onClick={back} aria-label="Back" className="absolute left-[16px] top-[60px] size-10 rounded-full active:bg-black/5">
            <Img src={iconBack} x={12} y={8} w={16} h={24} />
          </button>

          <p className="pointer-events-none absolute inset-x-0 top-[120.5px] pr-[7px] text-center text-[12px] font-medium italic uppercase leading-[16px] tracking-[2px] text-black">
            Invite your friend to the Airtel app
          </p>

          <Img src={sparkle} x={114} y={157} w={11} h={11} />
          <p className="absolute inset-x-0 top-[152px] text-center text-[16px] font-semibold italic uppercase leading-[20px] tracking-[1.9px]" style={{ color: RED }}>
            Earn upto
          </p>
          <Img src={sparkle} x={250} y={157} w={11} h={11} />

          <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}>
            <Img src={earn5000} x={57} y={186} w={252} h={62} alt="₹5000" />
          </motion.div>
          <p className="absolute inset-x-0 top-[257px] pr-[6px] text-center text-[16px] font-semibold italic uppercase leading-[20px] tracking-[1.8px]" style={{ color: RED }}>
            A year
          </p>

          <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.12, type: "spring", stiffness: 220, damping: 18 }}>
            <Img src={appIcon} x={132} y={292} w={117} h={117} alt="Airtel app icon" />
          </motion.div>
          <p className="absolute left-[133px] top-[414.6px] w-[117px] text-center text-[14px] font-semibold leading-[18px] tracking-[0.4px] text-white">Airtel App</p>

          {/* You get / Friend gets */}
          <div className="absolute left-[82px] top-[515.7px]">
            <p className="text-[11px] font-semibold uppercase leading-[14px] tracking-[0.9px]" style={{ color: RED }}>
              You get
            </p>
            <p className="mt-[1.7px] text-[20px] font-bold leading-[24px] tabular" style={{ color: INK }}>
              {inr(rules.referrerReward)}
            </p>
            <p className="text-[11px] leading-[14px] tracking-[-0.3px]" style={{ color: SUB }}>
              per referral
            </p>
          </div>
          <Img src={rewardDivider} x={160} y={505} w={24} h={75} />
          <div className="absolute right-[81px] top-[515.7px] text-right">
            <p className="text-[11px] font-semibold uppercase leading-[14px] tracking-[0.9px]" style={{ color: RED }}>
              Friend gets
            </p>
            <p className="mt-[1.7px] text-[20px] font-bold leading-[24px] tabular" style={{ color: INK }}>
              {inr(rules.friendReward)}
              <span className="text-[14px] leading-none tracking-[0.3px]"> + 2 GB</span>
            </p>
            <p className="text-[11px] leading-[14px]" style={{ color: SUB }}>
              on first recharge
            </p>
          </div>
        </section>

        {/* ───────────── Primary CTA (y 603–659) ───────────── */}
        <div className="px-4">
          <button
            onClick={inviteContacts}
            className="relative flex h-[56px] w-[343px] items-center justify-center gap-[6px] rounded-[16px] bg-black text-[14px] font-medium leading-[20px] text-white transition active:scale-[0.985]"
          >
            <Img src={iconSearch} w={17} h={17} />
            Search &amp; Invite Friends
          </button>
        </div>

        {/* ───────────── Share targets (y 679–766) ───────────── */}
        <div className="mt-[20px] flex justify-center gap-[37px]">
          {[
            { label: "Copy link", onClick: () => void copyInviteLink(), icon: <Img src={iconCopy} x={24.5} y={23.6} w={19} h={21} /> },
            { label: "WhatsApp", onClick: share, icon: <Img src={iconWhatsapp} x={19.5} y={19.6} w={29} h={29} /> },
            { label: "SMS", onClick: share, icon: <Img src={iconMail} x={23.5} y={25.6} w={21} h={17} /> },
          ].map(({ label, onClick, icon }) => (
            <button key={label} onClick={onClick} className="group flex w-[68px] flex-col items-center">
              <span className="relative size-[68px] rounded-full bg-[#F0F4F9] transition group-active:scale-95">
                <span className="absolute inset-[2px] rounded-full bg-white" />
                <span className="absolute inset-[4px] rounded-full bg-gradient-to-b from-[#F0F4F9] to-white" />
                {icon}
              </span>
              <span className="mt-[5.9px] whitespace-nowrap text-[11px] leading-[14px]" style={{ color: INK }}>
                {label}
              </span>
            </button>
          ))}
        </div>

        {/* ───────────── Referral progress (y 804–1007) ───────────── */}
        <Eyebrow className="mt-[37.6px]">Your referral progress</Eyebrow>
        <ReferralProgress count={stats.milestoneCount} onOpen={() => navigate("a_milestones")} />

        {/* ───────────── How it works (y 1030–1242) ───────────── */}
        <Eyebrow className="mt-[22.2px]">How it works</Eyebrow>
        <HowItWorks
          steps={[
            { icon: UserPlus, title: "Invite your friends", body: "Search your contacts or share your link on WhatsApp, SMS or any app." },
            { icon: Smartphone, title: "They join the Airtel app", body: `Your friend opens the link and signs in within ${rules.linkValidityHours} hours.` },
            { icon: Send, title: `They recharge ${inr(rules.minTransaction)}+`, body: `Their first eligible recharge within ${rules.firstTxnDeadlineDays} days counts.` },
            { icon: BadgeIndianRupee, title: "You both get rewarded", body: `${inr(rules.referrerReward)} for you, ${inr(rules.friendReward)} + 2 GB for your friend.` },
          ]}
        />

        {/* ───────────── FAQs / T&C (y 1265–1372) ───────────── */}
        <AccordionPrimitive.Root
          type="single"
          collapsible
          className="ml-[15px] mt-[23.2px] w-[345px] overflow-hidden rounded-[16px] border border-[#E6E9EF] bg-gradient-to-b from-white via-[#FAFAFA] to-[#F6F6F6]"
        >
          <FaqItem value="faqs" title="FAQs" className="pb-[7px]">
            <dl className="space-y-3">
              {[
                ["When will I get my reward?", `After your friend's first eligible recharge is validated, which can take up to ${rules.rewardValidationDays} days.`],
                ["What does my friend need to do?", `Open your link, sign in to the Airtel app and recharge ${inr(rules.minTransaction)} or more within ${rules.firstTxnDeadlineDays} days.`],
                ["Can I invite someone who already uses Airtel?", "Existing users who have already made a qualifying transaction aren't eligible."],
                ["My friend's link expired. What now?", `Links last ${rules.linkValidityHours} hours. Resend from My Referrals to create a fresh link.`],
              ].map(([q, a]) => (
                <div key={q}>
                  <dt className="font-semibold" style={{ color: INK }}>
                    {q}
                  </dt>
                  <dd>{a}</dd>
                </div>
              ))}
            </dl>
          </FaqItem>
          <div className="h-px bg-[#E6E9EF]" />
          <FaqItem value="tnc" title="Terms & conditions">
            <ul className="list-disc space-y-1.5 pl-4">
              <li>Rewards apply only to friends new to the Airtel app who complete a first recharge of {inr(rules.minTransaction)} or more.</li>
              <li>The first valid referral link your friend opens gets the credit.</li>
              <li>Rewards are credited after validation of up to {rules.rewardValidationDays} days and can't be exchanged for cash.</li>
              <li>Airtel may change or end the programme at any time.</li>
            </ul>
          </FaqItem>
        </AccordionPrimitive.Root>

        <Img src={referMore} w={236} h={84} alt="Refer more. Earn more." className="ml-[18px] mt-[57.5px]" />
        <div className="h-[30px]" />
      </ScreenBody>
    </Screen>
  );
}

/* ───────────────────────── Progress card ───────────────────────── */

function ReferralProgress({ count, onOpen }: { count: number; onOpen: () => void }) {
  const milestones = useProto((s) => s.rules.milestones);
  const nextIdx = milestones.findIndex((m) => count < m.target);
  const next = nextIdx === -1 ? milestones[milestones.length - 1] : milestones[nextIdx];
  const done = nextIdx === -1;
  const remaining = Math.max(0, next.target - count);
  const pct = Math.min(1, count / next.target);
  const short = (label: string) => label.replace(/ referral$/i, "");

  return (
    <button
      onClick={onOpen}
      className="ml-[14.5px] mt-[15.1px] flex h-[174.5px] flex-col overflow-hidden w-[346px] rounded-[14px] border border-[#CDD3DD] bg-gradient-to-b from-white via-[#FAFAFA] to-[#F6F6F6] px-[13px] pt-[12.6px] text-left transition active:scale-[0.99]"
    >
      <div className="flex items-center justify-between text-[12px] leading-[16px]" style={{ color: INK }}>
        <span className="font-semibold">{done ? "All milestones unlocked" : `Next achievement: ${next.label}`}</span>
        <span className="font-bold tabular">
          {Math.min(count, next.target)} / {next.target}
        </span>
      </div>
      <div className="mt-[7.4px] h-[8px] w-[318px] overflow-hidden rounded-full bg-[#EEF2F7]">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#FF4D4D] to-[#E32121]"
          initial={{ width: 11 }}
          animate={{ width: Math.max(11, 318 * pct) }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
      <p className="mt-[7.6px] text-[12px] leading-[16px]" style={{ color: BODY }}>
        {done
          ? "You've unlocked every milestone. Keep referring to earn more."
          : `${remaining} more successful ${remaining === 1 ? "referral" : "referrals"} to unlock ${next.label}.`}
      </p>

      <ol className="relative mt-[7.4px] grid w-[319.2px] grid-cols-4">
        <span className="absolute left-[39.9px] top-[20.6px] h-[3.3px] w-[239.4px] bg-[#E6E9EF]" aria-hidden />
        {milestones.map((m, i) => {
          const unlocked = count >= m.target;
          const current = i === nextIdx;
          return (
            <li key={m.id} className="relative flex flex-col items-center">
              <span
                className={cn(
                  "relative flex size-[44.5px] items-center justify-center rounded-full text-[14px] font-bold",
                  current && "bg-white shadow-[0_0_0_2.2px_#E32121,0_0_0_4.45px_rgba(227,33,33,0.12)]",
                  unlocked && "bg-[#E32121] text-white",
                  !current && !unlocked && "bg-[#F0F4F9] shadow-[0_0_0_1.1px_#E6E9EF]",
                )}
                style={current ? { color: ALERT } : undefined}
              >
                {unlocked ? <Check className="size-5" strokeWidth={3} /> : current ? m.target : <Lock className="size-4 text-[#A0A2A4]" strokeWidth={1.6} />}
              </span>
              <span className="mt-[6.6px] text-[14px] font-semibold leading-[18px]" style={{ color: current || unlocked ? INK : SUB }}>
                {short(m.label)}
              </span>
              <span className="mt-[1px] whitespace-nowrap text-[12px] leading-[16px]" style={{ color: SUB }}>
                {m.target} {m.target === 1 ? "referral" : "referrals"}
              </span>
            </li>
          );
        })}
      </ol>
    </button>
  );
}

/* ───────────────────────── How it works carousel ───────────────────────── */

function HowItWorks({ steps }: { steps: { icon: typeof UserPlus; title: string; body: string }[] }) {
  return (
    <div className="no-scrollbar mt-[17px] flex snap-x snap-mandatory gap-[20px] overflow-x-auto scroll-pl-4 px-4">
      {steps.map(({ icon: Icon, title, body }, i) => (
        <article
          key={title}
          className="relative flex h-[181.7px] w-[303px] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-[16px] bg-gradient-to-br from-[#FFF1F1] via-[#FAFAFA] to-[#F2F4F8] p-4"
        >
          <span className="pointer-events-none absolute -right-3 -top-6 text-[120px] font-extrabold italic leading-none text-black/[0.04]">{i + 1}</span>
          <span className="flex size-11 items-center justify-center rounded-[12px] bg-white text-[#E32121] shadow-[0_2px_8px_rgba(41,44,49,0.08)]">
            <Icon className="size-[22px]" strokeWidth={1.8} />
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase leading-[14px] tracking-[1.2px]" style={{ color: RED }}>
              Step {i + 1}
            </p>
            <p className="mt-1 text-[16px] font-bold leading-[22px]" style={{ color: INK }}>
              {title}
            </p>
            <p className="mt-0.5 text-[12px] leading-[16px]" style={{ color: SUB }}>
              {body}
            </p>
          </div>
        </article>
      ))}
      <span className="w-px shrink-0" aria-hidden />
    </div>
  );
}

/* ───────────────────────── FAQ row ───────────────────────── */

function FaqItem({ value, title, children, className }: { value: string; title: string; children: ReactNode; className?: string }) {
  return (
    <AccordionPrimitive.Item value={value}>
      <AccordionPrimitive.Header>
        <AccordionPrimitive.Trigger
          className={cn(
            "flex w-full items-center justify-between pl-[15px] pr-[13.4px] pt-[16px] pb-[16px] text-left text-[16px] font-bold tracking-[0.25px] leading-[24px] [&[data-state=open]>svg]:rotate-180",
            className,
          )}
          style={{ color: INK }}
        >
          {title}
          <ChevronDown className="-my-[3px] size-[30px] shrink-0 text-black transition-transform duration-200" strokeWidth={1.1} />
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content className="overflow-hidden text-[13px] leading-[19px] data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down" style={{ color: SUB }}>
        <div className="px-[15px] pb-4">{children}</div>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  );
}
