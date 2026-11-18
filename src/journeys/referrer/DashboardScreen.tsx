import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, BellRing, ChevronRight, Gift, Lock, Send, Users } from "lucide-react";
import { toast } from "sonner";
import { Callout } from "@/components/ui/callout";
import { AvatarStack, ReferralLinkField } from "@/components/app/InviteKit";
import { canRemind } from "@/components/app/ReferralActions";
import { AppBar, ContactAvatar, Screen, ScreenBody, ScreenFooter } from "@/components/app/primitives";
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
      return { text: "Reward failed", cls: "text-airtel-error", locked: false };
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
    toast.success(remindable.length === 1 ? `Reminder sent to ${remindable[0].name.split(" ")[0]}` : `Reminders sent to ${remindable.length} friends`);
  };

  return (
    <Screen className="bg-airtel-surface">
      <AppBar title="My Referrals" className="bg-airtel-surface" />
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
              <Send /> Invite from contacts
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

            {/* Summary (Oportun / Rakuten pattern) */}
            <div className="mx-4 rounded-[20px] bg-white p-4 shadow-card">
              <div className="grid grid-cols-2 divide-x divide-airtel-line">
                <div>
                  <p className="text-[12px] text-airtel-sub">Total earned</p>
                  <motion.p key={stats.earned} initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-[28px] font-extrabold leading-tight tracking-[-0.03em] tabular">
                    {inr(stats.earned)}
                  </motion.p>
                </div>
                <div className="pl-4">
                  <p className="text-[12px] text-airtel-sub">Pending rewards</p>
                  <p className="text-[28px] font-extrabold leading-tight tracking-[-0.03em] text-[#A56A12] tabular">{inr(lockedTotal)}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-4 divide-x divide-airtel-line rounded-[14px] bg-airtel-surface py-2.5 text-center">
                {[
                  ["Invited", stats.total],
                  ["Accepted", stats.accepted],
                  ["Pending", stats.pending],
                  ["Successful", stats.successful],
                ].map(([l, v]) => (
                  <div key={l as string}>
                    <p className="text-[18px] font-bold tabular">{v}</p>
                    <p className="text-[10.5px] font-medium text-airtel-sub">{l}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action cards (HelloFresh pattern) */}
            <div className="mx-4 mt-3 grid gap-3">
              {remindable.length > 0 && (
                <div className="flex gap-3 rounded-[20px] bg-airtel-warning-soft p-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white">
                    <BellRing className="size-5 text-[#B7791F]" />
                  </span>
                  <div className="flex-1">
                    <span className="inline-block rounded-full bg-airtel-ink px-2 py-0.5 text-[11px] font-bold text-white">{inr(remindable.length * rules.referrerReward)} pending</span>
                    <p className="mt-1.5 text-[15px] font-bold">Remind your friends</p>
                    <p className="text-[12.5px] leading-[17px] text-[#7A5310]">
                      {remindable.length === 1 ? `${remindable[0].name.split(" ")[0]} hasn't` : `${remindable.length} friends haven't`} completed their first recharge yet.
                    </p>
                    <button onClick={remindAll} className="mt-2 text-[13px] font-bold underline underline-offset-2">
                      Send {remindable.length === 1 ? "a reminder" : "reminders"}
                    </button>
                  </div>
                </div>
              )}
              <div className="flex gap-3 rounded-[20px] bg-airtel-red-soft/70 p-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white">
                  <Gift className="size-5 text-airtel-red" />
                </span>
                <div className="flex-1">
                  <span className="inline-block rounded-full bg-airtel-red px-2 py-0.5 text-[11px] font-bold text-white">{inr(rules.referrerReward)} per friend</span>
                  <p className="mt-1.5 text-[15px] font-bold">Invite a friend</p>
                  <p className="text-[12.5px] leading-[17px] text-airtel-sub">Get your friend on Airtel and unlock rewards together.</p>
                  <button onClick={invite} className="mt-2 text-[13px] font-bold text-airtel-red underline underline-offset-2">
                    Send an invite
                  </button>
                </div>
              </div>
            </div>

            {/* Milestone */}
            <button onClick={() => navigate("a_milestones")} className="mx-4 mt-3 block w-[calc(100%-32px)] rounded-[20px] bg-white p-4 pt-3 text-left shadow-card">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[13px] font-bold">Milestone progress</span>
                <ChevronRight className="size-4 text-airtel-sub" />
              </div>
              <MilestoneTrack milestones={rules.milestones} count={stats.milestoneCount} />
            </button>

            {/* List */}
            <div className="mt-5 px-4">
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
                        className="cursor-pointer rounded-[18px] bg-white p-3.5 shadow-card active:scale-[0.99]"
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
                        <div className="mt-3 flex items-center gap-2 border-t border-airtel-line pt-3">
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
                {list.length === 0 && <p className="py-10 text-center text-[13px] text-airtel-sub">Nothing here yet.</p>}
              </div>
            </div>
          </>
        )}
      </ScreenBody>
      {referrals.length > 0 && (
        <ScreenFooter>
          <Button size="lg" block onClick={invite}>
            <Send /> Invite more friends
          </Button>
        </ScreenFooter>
      )}
    </Screen>
  );
}
