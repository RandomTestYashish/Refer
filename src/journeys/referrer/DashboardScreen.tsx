import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, BellRing, Lock, Send, Users } from "lucide-react";
import { toast } from "sonner";
import { Callout } from "@/components/ui/callout";
import { AvatarStack, ReferralLinkField } from "@/components/app/InviteKit";
import { canRemind } from "@/components/app/ReferralActions";
import { AppBar, ContactAvatar, Screen, ScreenBody, ScreenFooter } from "@/components/app/primitives";
import { BAND, CARD, HeroCard, LinkButton, SectionTitle } from "@/components/app/gen4";
import { MilestoneTrack } from "@/components/app/Milestones";
import { StatusBadge } from "@/components/app/status";
import { ReferralAction } from "@/components/app/ReferralActions";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CONTACTS } from "@/domain/data";
import { activeLink, referralStats, useProto } from "@/store/useProto";
import { cn, formatDate, inr, timeLeft } from "@/lib/utils";
import type { Referral } from "@/domain/types";

const FILTERS = {
  all: (_: Referral) => true,
  pending: (r: Referral) => ["invited", "link_opened", "accepted", "pending_recharge", "transaction_completed", "reward_processing"].includes(r.status),
  successful: (r: Referral) => r.status === "reward_credited",
  closed: (r: Referral) => ["expired", "not_eligible", "failed"].includes(r.status),
};

export function rewardLine(r: Referral, amt: number) {
  switch (r.rewardA) {
    case "credited":
      return { text: `${inr(amt)} credited`, cls: "text-airtel-success", locked: false };
    case "validating":
      return { text: `${inr(amt)} validating`, cls: "text-[#A56A12]", locked: true };
    case "delayed":
      return { text: `${inr(amt)} delayed`, cls: "text-[#A56A12]", locked: true };
    case "failed":
      return { text: "Reward unsuccessful", cls: "text-airtel-error", locked: false };
    case "reversed":
      return { text: "Reward reversed", cls: "text-airtel-error", locked: false };
    case "expired":
      return { text: "Reward expired", cls: "text-airtel-sub", locked: false };
    case "not_eligible":
      return { text: "Not eligible", cls: "text-airtel-sub", locked: false };
    default:
      return { text: `${inr(amt)} pending`, cls: "text-airtel-sub", locked: true };
  }
}

export function DashboardScreen() {
  const referrals = useProto((s) => s.referrals);
  const rules = useProto((s) => s.rules);
  const past = useProto((s) => s.pastSuccesses);
  const notices = useProto((s) => s.notices);
  const markRead = useProto((s) => s.markNoticesRead);
  const navigate = useProto((s) => s.navigate);
  const granted = useProto((s) => s.contactsGranted);
  const [tab, setTab] = useState<keyof typeof FILTERS>("all");
  const stats = referralStats(referrals, past, rules.referrerReward);
  const list = useMemo(() => referrals.filter(FILTERS[tab]), [referrals, tab]);
  const unread = notices.filter((n) => !n.read);

  const invite = () => navigate(granted ? "a_contacts" : "a_permission");
  const remindable = referrals.filter((r) => canRemind(r) && r.rewardA === "locked");
  const lockedTotal = referrals.filter((r) => ["locked", "validating", "delayed"].includes(r.rewardA) && !["expired", "not_eligible", "failed"].includes(r.status)).length * rules.referrerReward;
  const remind = useProto((s) => s.remind);
  const remindAll = () => {
    remindable.forEach((r) => remind(r.id));
    toast.success(remindable.length === 1 ? `Reminder sent to ${remindable[0].name.split(" ")[0]}.` : `Reminders sent to ${remindable.length} friends.`);
  };

  return (
    <Screen>
      <AppBar title="My Referrals" />
      <ScreenBody className="pb-6">
        {referrals.length === 0 ? (
          <div className="flex h-full flex-col px-5 pb-10 pt-6">
            <AvatarStack size={56} />
            <h2 className="mt-5 text-display">Your invites</h2>
            <p className="mt-2 text-[14px] leading-[21px] text-airtel-sub">
              Invite friends and track how close they are to earning you both {inr(rules.referrerReward)}.
            </p>
            <div className="mt-6 rounded-[18px] border-2 border-dashed border-[#DCDCDC] px-5 py-7 text-center">
              <Users className="mx-auto size-7 text-[#B5B5B5]" />
              <p className="mt-2 text-[15px] font-semibold">No referrals yet</p>
              <p className="mt-1 text-[12.5px] text-airtel-sub">Invites appear here as soon as you send them.</p>
            </div>
            <div className="mt-6">
              <ReferralLinkField />
            </div>
            <Button size="lg" block className="mt-3" onClick={invite}>
              <Send /> Invite From Contacts
            </Button>
          </div>
        ) : (
          <>
            {/* Live notice */}
            <AnimatePresence>
              {unread.length > 0 && (
                <motion.div initial={{ y: -12, opacity: 0, height: 0 }} animate={{ y: 0, opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mx-4 mb-3 overflow-hidden">
                  <Callout tone="dark" title={unread[0].text} icon={<Bell strokeWidth={1.6} />} onDismiss={markRead}>
                    {unread.length > 1 ? `+${unread.length - 1} more referral update${unread.length > 2 ? "s" : ""}` : "Referral update"}
                  </Callout>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Summary — hero card on the blue-grey band */}
            <div className={`${BAND} -mt-3 px-4 py-5`}>
              <HeroCard className="pt-5">
                <div className="grid grid-cols-2 divide-x divide-[#E6E9EF] text-center">
                  <div>
                    <p className="text-[12px] text-[#696B6F]">Total earned</p>
                    <motion.p key={stats.earned} initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-[24px] font-bold leading-8 text-[#292C31] tabular">
                      {inr(stats.earned)}
                    </motion.p>
                  </div>
                  <div>
                    <p className="text-[12px] text-[#696B6F]">Pending</p>
                    <p className="text-[24px] font-bold leading-8 text-[#DA9802] tabular">{inr(lockedTotal)}</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-4 rounded-[12px] bg-white py-2.5 text-center ring-1 ring-[#E6E9EF]">
                  {[
                    ["Invited", stats.total],
                    ["Accepted", stats.accepted],
                    ["Pending", stats.pending],
                    ["Successful", stats.successful],
                  ].map(([l, v]) => (
                    <div key={l as string}>
                      <p className="text-[16px] font-bold text-[#292C31] tabular">{v}</p>
                      <p className="text-[10.5px] text-[#696B6F]">{l}</p>
                    </div>
                  ))}
                </div>
              </HeroCard>
              {remindable.length > 0 && (
                <div className="mt-4 flex items-center gap-3 rounded-[16px] bg-white p-3.5 ring-1 ring-[#E6E9EF]">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#FFF0B8]">
                    <BellRing className="size-5 text-[#8F4C00]" />
                  </span>
                  <p className="min-w-0 flex-1 text-[12.5px] leading-[17px] text-[#3E4146]">
                    <b className="text-[#292C31]">{inr(remindable.length * rules.referrerReward)} waiting.</b>{" "}
                    {remindable.length === 1 ? `${remindable[0].name.split(" ")[0]} hasn't` : `${remindable.length} friends haven't`} recharged yet.
                  </p>
                  <button onClick={remindAll} className="h-8 shrink-0 rounded-[10px] bg-black px-3 text-[12.5px] font-medium text-white active:bg-[#3E4146]">
                    Remind
                  </button>
                </div>
              )}
            </div>

            {/* Milestone */}
            <div className="mx-4 mt-8">
              <SectionTitle action={<LinkButton onClick={() => navigate("a_milestones")}>View All</LinkButton>}>milestones</SectionTitle>
            </div>
            <button onClick={() => navigate("a_milestones")} className={`mx-4 mt-4 block w-[calc(100%-32px)] rounded-[16px] p-4 pt-5 text-left ${CARD}`}>
              <MilestoneTrack milestones={rules.milestones} count={stats.milestoneCount} />
            </button>

            {/* List */}
            <div className="mt-8 px-4">
              <SectionTitle className="mb-4">your invites</SectionTitle>
              <Tabs value={tab} onValueChange={(v) => setTab(v as keyof typeof FILTERS)}>
                <TabsList className="w-full">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="successful">Successful</TabsTrigger>
                  <TabsTrigger value="closed">Closed</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="mt-3 space-y-2.5">
                <AnimatePresence initial={false}>
                  {list.map((r) => {
                    const c = CONTACTS.find((x) => x.id === r.contactId);
                    const link = activeLink(r);
                    const rw = rewardLine(r, rules.referrerReward);
                    return (
                      <motion.div
                        layout
                        key={r.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        role="button"
                        tabIndex={0}
                        onClick={() => navigate("a_detail", { id: r.id })}
                        onKeyDown={(e) => e.key === "Enter" && navigate("a_detail", { id: r.id })}
                        className={`cursor-pointer rounded-[16px] p-3.5 active:scale-[0.99] ${CARD}`}
                      >
                        <div className="flex items-start gap-3">
                          <ContactAvatar name={r.name} hue={c?.hue ?? 200} size={42} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="truncate text-[15px] font-semibold">{r.name}</p>
                              <StatusBadge status={r.status} />
                            </div>
                            <p className="mt-0.5 text-[12px] text-airtel-sub">
                              Invited {formatDate(r.createdAt)}
                              {r.delivery === "pending" && <span className="font-semibold text-[#A56A12]"> · Sending…</span>}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-2 border-t border-[#E6E9EF] pt-3">
                          <span className={cn("flex items-center gap-1 text-[12px] font-semibold", rw.cls)}>
                            {rw.locked && <Lock className="size-3" />}
                            {rw.text}
                          </span>
                          <span className="text-[12px] text-airtel-sub">
                            ·{" "}
                            {link.state === "active"
                              ? `Link ${timeLeft(link.expiresAt - Date.now())}`
                              : link.state === "expired"
                                ? "Link expired"
                                : "Link replaced"}
                          </span>
                          <span className="ml-auto">
                            <ReferralAction r={r} />
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                {list.length === 0 && <p className="py-10 text-center text-[13px] text-airtel-sub">Nothing here yet</p>}
              </div>
            </div>
          </>
        )}
      </ScreenBody>
      {referrals.length > 0 && (
        <ScreenFooter>
          <Button size="lg" block onClick={invite}>
            <Send /> Invite More Friends
          </Button>
        </ScreenFooter>
      )}
    </Screen>
  );
}
