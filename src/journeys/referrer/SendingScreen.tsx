import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { AlertCircle, Check, Clock3, Copy, MessageSquareText, MessageSquareX, RotateCw, WifiOff } from "lucide-react";
import { AnimatedCheck, ContactAvatar, Screen, SimNote } from "@/components/app/primitives";
import { ErrorState } from "@/components/app/ErrorState";
import { Button } from "@/components/ui/button";
import { CONTACTS, PERSONAL_LINK } from "@/domain/data";
import { useProto, type SendRecord } from "@/store/useProto";
import { firstName, inviteMessage, nameList } from "@/lib/invite";
import { canUseNativeSms, copyText, openSmsComposer } from "@/lib/share";
import { cn, inr } from "@/lib/utils";

type Phase = "sending" | "handoff" | "success" | "confirmed" | "partial" | "failure" | "pending";
type Row = "waiting" | "sent" | "failed";

/**
 * A07 — Sending journey.
 * Simulated sends are always labelled as such. A native SMS handoff can't tell us whether the
 * message actually went out, so the user confirms it instead of us claiming success.
 */
export function SendingScreen({ params }: { params?: Record<string, string> }) {
  const ids = (params?.ids ?? "").split(",").filter(Boolean);
  const channel = (params?.channel ?? "sms") as "sms" | "whatsapp" | "link";
  const people = ids.map((id) => CONTACTS.find((c) => c.id === id) ?? { id, name: "Friend via link", phone: "", hue: 200 });
  const viaLink = ids[0] === "c_link";
  const nonce = params?.n ?? "";
  const prior = useProto.getState().sendResults[nonce];
  const rules = useProto((s) => s.rules);

  const [phase, setPhase] = useState<Phase>(prior ? (prior.phase as Phase) : "sending");
  const [rows, setRows] = useState<Record<string, Row>>(() =>
    Object.fromEntries(ids.map((id) => [id, prior ? (prior.failed?.includes(id) ? "failed" : "sent") : "waiting"])),
  );
  const [attempt, setAttempt] = useState(0);
  const [failKind, setFailKind] = useState<"network" | "sms">("network");
  const [simulated, setSimulated] = useState(prior?.simulated ?? true);
  const created = useRef<string[]>(prior?.created ?? []);
  const targets = useRef<string[]>(ids); // who this attempt sends to (retries only resend failures)

  const record = (rec: Omit<SendRecord, "created">) => nonce && useProto.getState().recordSend(nonce, { ...rec, created: created.current });

  /** Creates referral records for the people the message actually reached. */
  const commit = (cids: string[], pending = false) => {
    const st = useProto.getState();
    const fresh: string[] = [];
    cids.forEach((cid) => {
      const prev = st.referrals.find((r) => r.contactId === cid);
      if (prev && prev.status === "expired" && cid !== "c_link") {
        st.resend(prev.id); // expired invite: new link, history kept
        created.current.push(prev.id);
      } else fresh.push(cid);
    });
    created.current.push(...st.createInvites(fresh, channel, pending));
  };

  useEffect(() => {
    if (prior && attempt === 0) return; // already sent — never resend on remount
    const { scenario } = useProto.getState();
    const list = targets.current;
    setPhase("sending");
    setRows((r) => ({ ...r, ...Object.fromEntries(list.map((id) => [id, "waiting" as Row])) }));

    // Native handoff on real phones: open the SMS composer, then ask the user what happened.
    if (channel === "sms" && !viaLink && canUseNativeSms() && scenario.share === "ok" && scenario.network === "success") {
      const t = setTimeout(() => {
        openSmsComposer(
          people.filter((p) => list.includes(p.id)).map((p) => p.phone),
          inviteMessage(list.length === 1 ? firstName(people.find((p) => p.id === list[0])!.name) : undefined),
        );
        setSimulated(false);
        setPhase("handoff");
      }, 400);
      return () => clearTimeout(t);
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    const per = Math.min(480, 1400 / Math.max(1, list.length));
    const failAll = scenario.network === "failure" || (scenario.share === "sms_fail" && channel === "sms");
    // "Partly fails": the last friend fails on the first attempt; a retry recovers.
    const failOne = !failAll && scenario.share === "partial" && !viaLink && attempt === 0 ? list[list.length - 1] : undefined;

    list.forEach((id, i) =>
      timers.push(setTimeout(() => setRows((r) => ({ ...r, [id]: failAll || id === failOne ? "failed" : "sent" })), 450 + per * (i + 1))),
    );
    timers.push(
      setTimeout(() => {
        const st = useProto.getState();
        if (failAll) {
          setFailKind(scenario.network === "failure" ? "network" : "sms");
          setPhase("failure");
          return;
        }
        const ok = list.filter((id) => id !== failOne);
        const slow = scenario.network === "slow";
        commit(ok, slow);
        const stillFailed = failOne ? [failOne] : [];
        if (!stillFailed.length) st.setSelected([]);
        else st.setSelected(stillFailed); // keep only who still needs an invite
        const next: Phase = slow ? "pending" : stillFailed.length ? "partial" : "success";
        setSimulated(true);
        record({ phase: next === "pending" ? "pending" : next === "partial" ? "partial" : "success", failed: stillFailed, simulated: true });
        setPhase(next);
      }, 600 + per * list.length + 400),
    );
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  const failedIds = ids.filter((id) => rows[id] === "failed");
  const sentIds = ids.filter((id) => rows[id] === "sent");
  const names = (list: string[]) => nameList(list.map((id) => firstName(people.find((p) => p.id === id)!.name)));

  const retryFailed = () => {
    targets.current = failedIds.length ? failedIds : ids;
    setAttempt((a) => a + 1);
  };
  const copyFallback = async () => {
    const ok = await copyText(`https://${PERSONAL_LINK}`);
    toast.success(ok ? "Link copied" : "Link ready to paste", {
      description: ok ? "Paste it in any chat to invite friends." : "Prototype: clipboard is blocked here, so nothing was copied.",
    });
  };
  const exit = (to: "a_dashboard" | "a_landing") => useProto.getState().resetTo(to);

  const RowList = ({ only }: { only?: string[] }) => (
    <ul className="w-full space-y-2" aria-live="polite">
      {people
        .filter((p) => !only || only.includes(p.id))
        .map((p, i) => {
          const st = rows[p.id];
          return (
            <motion.li
              key={p.id}
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 rounded-[14px] bg-airtel-surface px-3 py-2.5"
              data-testid={`send-row-${p.id}`}
              data-state={st}
            >
              <ContactAvatar name={p.name} hue={p.hue} size={34} />
              <span className="flex-1 text-left text-[14px] font-semibold">{p.name}</span>
              <span className="sr-only">{st === "sent" ? "sent" : st === "failed" ? "not sent" : "sending"}</span>
              <AnimatePresence mode="wait">
                {st === "sent" ? (
                  <motion.span key="ok" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex size-6 items-center justify-center rounded-full bg-airtel-success text-white">
                    <Check className="size-3.5" strokeWidth={3.5} />
                  </motion.span>
                ) : st === "failed" ? (
                  <motion.span key="x" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1 text-[12px] font-semibold text-airtel-error">
                    <AlertCircle className="size-5" /> Not sent
                  </motion.span>
                ) : (
                  <motion.span key="spin" className="size-5 rounded-full border-2 border-airtel-ink/15 border-t-airtel-ink" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
                )}
              </AnimatePresence>
            </motion.li>
          );
        })}
    </ul>
  );

  const rewardNote = (
    <p className="mt-3 rounded-[14px] bg-airtel-surface px-4 py-3 text-left text-[13px] leading-[19px] text-airtel-sub">
      <span className="font-semibold text-airtel-ink">Reward not earned yet.</span> You'll get {inr(rules.referrerReward)} per friend once they join Airtel and complete
      a first {rules.qualifyingAction} of {inr(rules.minTransaction)}+.
    </p>
  );

  return (
    <Screen className="relative">
      <AnimatePresence mode="wait">
        {phase === "sending" && (
          <motion.div key="sending" exit={{ opacity: 0 }} className="flex h-full flex-col px-6 pb-[34px]" data-testid="send-phase" data-phase="sending">
            <div className="flex flex-1 flex-col items-center justify-center">
              <h2 className="text-title">{viaLink ? "Preparing your invite…" : `Sending ${people.length === 1 ? "invite" : `${targets.current.length} invites`}…`}</h2>
              <p className="mt-1 text-[14px] text-airtel-sub">via {channel === "sms" ? "SMS" : channel === "whatsapp" ? "WhatsApp" : "your share link"}</p>
              {!viaLink && (
                <div className="mt-7 w-full">
                  <RowList only={targets.current} />
                </div>
              )}
            </div>
            <Button size="lg" block loading>
              Sending
            </Button>
            <SimNote className="mt-2">Simulated send — no real messages</SimNote>
          </motion.div>
        )}

        {phase === "handoff" && (
          <motion.div key="handoff" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full" data-testid="send-phase" data-phase="handoff">
            <ErrorState
              icon={<MessageSquareText />}
              tone="info"
              title="Did your message go out?"
              body="We opened your Messages app with the invite ready. We can't see what happens there, so let us know if you sent it."
              primary={{
                label: "Yes, I sent it",
                onClick: () => {
                  commit(targets.current);
                  setRows((r) => ({ ...r, ...Object.fromEntries(targets.current.map((id) => [id, "sent" as Row])) }));
                  useProto.getState().setSelected([]);
                  record({ phase: "confirmed", failed: [], simulated: false });
                  setPhase("confirmed");
                },
              }}
              secondary={{ label: "Open Messages again", onClick: () => setAttempt((a) => a + 1) }}
              tertiary={{ label: "I didn't send it", onClick: () => useProto.getState().back() }}
            />
          </motion.div>
        )}

        {(phase === "success" || phase === "confirmed") && (
          <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-full flex-col" data-testid="send-phase" data-phase={phase}>
            <div className="flex flex-1 flex-col items-center justify-center px-7 text-center">
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="flex size-[84px] items-center justify-center rounded-full bg-airtel-success-soft text-airtel-success"
              >
                <AnimatedCheck className="size-11" />
              </motion.div>
              <h2 className="mt-6 text-title">
                {viaLink ? "Invite ready to share" : phase === "confirmed" ? "Thanks for confirming" : people.length === 1 ? "Invite sent" : `${people.length} invites sent`}
              </h2>
              {simulated && (
                <span className="mt-2 rounded-full bg-airtel-surface px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-airtel-sub">Simulated</span>
              )}
              <p className="mt-3 text-[15px] leading-[22px] text-airtel-sub">
                {viaLink
                  ? "Your invite link has been created. We'll track anyone who joins with it."
                  : `We'll let you know when ${names(ids)} ${ids.length === 1 ? "joins" : "join"} Airtel.`}
              </p>
              {rewardNote}
            </div>
            <div className="space-y-2 px-5 pb-[34px]">
              <Button size="lg" block onClick={() => exit("a_dashboard")}>
                Track in My referrals
              </Button>
              <Button size="lg" block variant="outline" onClick={() => exit("a_landing")}>
                Invite more friends
              </Button>
            </div>
          </motion.div>
        )}

        {phase === "partial" && (
          <motion.div key="partial" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-full flex-col" data-testid="send-phase" data-phase="partial">
            <div className="flex flex-1 flex-col px-6 pt-10">
              <span className="flex size-[64px] items-center justify-center rounded-full bg-airtel-warning-soft text-[#B7791F]">
                <AlertCircle className="size-8" />
              </span>
              <h2 className="mt-5 text-title">
                {sentIds.length} of {ids.length} invites sent
              </h2>
              <p className="mt-2 text-[15px] leading-[22px] text-airtel-sub">
                We couldn't reach {names(failedIds)}. Try again, or copy your link and send it yourself.
              </p>
              <SimNote className="mt-2 justify-start">Simulated partial failure</SimNote>
              <div className="mt-6">
                <RowList />
              </div>
            </div>
            <div className="space-y-2 px-5 pb-[34px]">
              <Button size="lg" block onClick={retryFailed}>
                <RotateCw /> Retry {failedIds.length === 1 ? names(failedIds) : `${failedIds.length} invites`}
              </Button>
              <Button size="lg" block variant="outline" onClick={copyFallback}>
                <Copy /> Copy invite link
              </Button>
              <Button block variant="ghost" className={cn("border-0")} onClick={() => exit("a_dashboard")}>
                Skip for now
              </Button>
            </div>
          </motion.div>
        )}

        {phase === "pending" && (
          <motion.div key="pending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full" data-testid="send-phase" data-phase="pending">
            <ErrorState
              icon={<Clock3 />}
              tone="warning"
              title="Invite queued"
              body={`Your connection is slow, so your invite to ${names(ids)} will go out as soon as you're back online.`}
              primary={{
                label: "Check again",
                onClick: () => {
                  useProto.getState().markDelivered(created.current);
                  record({ phase: "success", failed: [], simulated: true });
                  setPhase("success");
                },
              }}
              secondary={{ label: "Go to My referrals", onClick: () => exit("a_dashboard") }}
            >
              <SimNote>Simulated slow network</SimNote>
            </ErrorState>
          </motion.div>
        )}

        {phase === "failure" && (
          <motion.div key="failure" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full" data-testid="send-phase" data-phase="failure">
            <ErrorState
              icon={failKind === "network" ? <WifiOff /> : <MessageSquareX />}
              title={failKind === "network" ? "Couldn't send your invite" : "SMS didn't go through"}
              body={
                failKind === "network"
                  ? "You seem to be offline. Nothing was sent — check your connection and try again."
                  : "Your messaging app didn't confirm the SMS. Nothing was sent. Try again, or copy your link."
              }
              primary={{ label: "Try again", onClick: retryFailed }}
              secondary={{ label: "Copy invite link", onClick: copyFallback }}
              tertiary={{ label: "Back to invite", onClick: () => useProto.getState().back() }}
            >
              <SimNote>Simulated failure — change it in the scenario panel</SimNote>
            </ErrorState>
          </motion.div>
        )}
      </AnimatePresence>
    </Screen>
  );
}
