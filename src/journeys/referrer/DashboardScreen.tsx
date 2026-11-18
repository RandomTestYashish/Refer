import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, ChevronRight, Lock, Send, Users, Wallet } from "lucide-react";
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

  return (
    <Screen className="bg-airtel-surface">
      <AppBar title="My Referrals" className="bg-airtel-surface" />
      <ScreenBody className="pb-6">
        {referrals.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-8 pb-16 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative mb-6 flex size-[112px] items-center justify-center rounded-full bg-white shadow-card"
            >
              <Users className="size-12 text-airtel-red" strokeWidth={1.6} />
            </motion.div>
            <h2 className="text-title">No referrals yet</h2>
            <p className="mt-2 text-[14px] leading-[21px] text-airtel-sub">
              Invite your first friend and track every step here — from invite sent to {inr(rules.referrerReward)} credited.
            </p>
            <Button size="lg" className="mt-7" onClick={invite}>
              <Send /> Invite a friend
            </Button>
          </div>
        ) : (
          <>
            {/* Live notice */}
            <AnimatePresence>
              {unread.length > 0 && (
                <motion.button
                  initial={{ y: -12, opacity: 0, height: 0 }}
                  animate={{ y: 0, opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  onClick={markRead}
                  className="mx-4 mb-3 flex w-[calc(100%-32px)] items-center gap-2.5 overflow-hidden rounded-[14px] bg-airtel-ink px-3.5 py-3 text-left text-white"
                >
                  <Bell className="size-4 shrink-0 text-[#FFB4C0]" />
                  <span className="flex-1 text-[13px] font-medium">{unread[0].text}</span>
                  <span className="text-[11px] text-white/60">Dismiss</span>
                </motion.button>
              )}
            </AnimatePresence>

            {/* Earnings */}
            <div className="mx-4 rounded-[20px] bg-white p-4 shadow-card">
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-full bg-airtel-red-soft">
                  <Wallet className="size-5 text-airtel-red" />
                </span>
                <div className="flex-1">
                  <p className="text-[12px] text-airtel-sub">Rewards earned</p>
                  <motion.p key={stats.earned} initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-[26px] font-extrabold leading-none tracking-[-0.03em] tabular">
                    {inr(stats.earned)}
                  </motion.p>
                </div>
                {stats.pendingRewards > 0 && (
                  <span className="rounded-full bg-airtel-warning-soft px-2.5 py-1 text-[11.5px] font-semibold text-[#A56A12]">{inr(stats.pendingRewards)} processing</span>
                )}
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
                <TabsList className="w-full bg-[#EBEBEB]">
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
