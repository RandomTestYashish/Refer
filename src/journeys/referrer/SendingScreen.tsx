import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Clock3, MessageSquareX, Send, WifiOff } from "lucide-react";
import { AnimatedCheck, ContactAvatar, Screen } from "@/components/app/primitives";
import { ErrorState } from "@/components/app/ErrorState";
import { Confetti } from "@/components/app/Confetti";
import { Button } from "@/components/ui/button";
import { CONTACTS } from "@/domain/data";
import { useProto } from "@/store/useProto";

type Phase = "sending" | "success" | "failure" | "pending";

export function SendingScreen({ params }: { params?: Record<string, string> }) {
  const ids = (params?.ids ?? "").split(",").filter(Boolean);
  const channel = (params?.channel ?? "sms") as "sms" | "whatsapp" | "link";
  const people = ids.map((id) => CONTACTS.find((c) => c.id === id) ?? { id, name: "Friend via link", phone: "", hue: 200 });
  const nonce = params?.n;
  const prior = useProto.getState().sendResults[nonce ?? ""];
  const [phase, setPhase] = useState<Phase>(prior?.phase ?? "sending");
  const [tick, setTick] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [failKind, setFailKind] = useState<"network" | "sms">("network");
  const createdRef = useRef<string[]>(prior?.created ?? []);
  const store = useProto;

  useEffect(() => {
    if (prior && attempt === 0) return; // already sent — don't resend when this screen remounts
    setPhase("sending");
    setTick(0);
    const timers: ReturnType<typeof setTimeout>[] = [];
    const { scenario } = store.getState();
    const per = Math.min(520, 1400 / Math.max(1, people.length));
    people.forEach((_, i) => timers.push(setTimeout(() => setTick(i + 1), 500 + per * (i + 1))));
    timers.push(
      setTimeout(() => {
        const st = store.getState();
        if (scenario.network === "failure") {
          setFailKind("network");
          setPhase("failure");
          return;
        }
        if (scenario.share === "sms_fail" && channel === "sms") {
          setFailKind("sms");
          setPhase("failure");
          return;
        }
        // Create referral records (expired contacts are resent: new link, history kept).
        const fresh: string[] = [];
        const created: string[] = [];
        ids.forEach((cid) => {
          const prev = st.referrals.find((r) => r.contactId === cid);
          if (prev && prev.status === "expired" && cid !== "c_link") {
            st.resend(prev.id);
            created.push(prev.id);
          } else fresh.push(cid);
        });
        created.push(...st.createInvites(fresh, channel, scenario.network === "slow"));
        createdRef.current = created;
        st.setSelected([]);
        const result = scenario.network === "slow" ? "pending" : "success";
        if (nonce) st.recordSend(nonce, result, created);
        setPhase(result);
      }, 700 + per * people.length + 500),
    );
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  const names = people.map((p) => p.name.split(" ")[0]);
  const nameList = names.length <= 2 ? names.join(" and ") : `${names.slice(0, 2).join(", ")} and ${names.length - 2} more`;

  return (
    <Screen className="relative">
      <AnimatePresence mode="wait">
        {phase === "sending" && (
          <motion.div key="sending" exit={{ opacity: 0 }} className="flex h-full flex-col items-center justify-center px-8">
            <div className="relative flex h-[180px] w-full items-center justify-center">
              {/* pulsing rings */}
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="absolute size-24 rounded-full border-2 border-airtel-red/30"
                  animate={{ scale: [1, 2.1], opacity: [0.6, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.6, ease: "easeOut" }}
                />
              ))}
              <motion.div
                className="relative flex size-24 items-center justify-center rounded-full bg-airtel-red text-white shadow-red"
                animate={{ rotate: [0, -8, 0] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                <Send className="size-10" />
              </motion.div>
            </div>
            <h2 className="mt-6 text-title">Sending invitations…</h2>
            <p className="mt-1 text-[14px] text-airtel-sub">
              via {channel === "sms" ? "SMS" : channel === "whatsapp" ? "WhatsApp" : "your share link"}
            </p>
            <ul className="mt-7 w-full space-y-2.5">
              {people.map((p, i) => (
                <motion.li
                  key={p.id}
                  initial={{ x: -16, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-3 rounded-[14px] bg-airtel-surface px-3 py-2.5"
                >
                  <ContactAvatar name={p.name} hue={p.hue} size={34} />
                  <span className="flex-1 text-[14px] font-semibold">{p.name}</span>
                  <AnimatePresence mode="wait">
                    {tick > i ? (
                      <motion.span key="ok" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex size-6 items-center justify-center rounded-full bg-airtel-success text-white">
                        <Check className="size-3.5" strokeWidth={3.5} />
                      </motion.span>
                    ) : (
                      <motion.span key="spin" className="size-5 rounded-full border-2 border-airtel-red/25 border-t-airtel-red" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
                    )}
                  </AnimatePresence>
                </motion.li>
              ))}
            </ul>
            <Button size="lg" block className="mt-8" loading>
              Sending
            </Button>
          </motion.div>
        )}

        {phase === "success" && (
          <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-full flex-col">
            <Confetti />
            <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 220, damping: 14 }}
                className="flex size-[104px] items-center justify-center rounded-full bg-airtel-success text-white shadow-[0_14px_30px_rgba(22,131,74,0.35)]"
              >
                <AnimatedCheck className="size-14" />
              </motion.div>
              <motion.h2 initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="mt-7 text-display">
                Invitation sent!
              </motion.h2>
              <motion.p initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="mt-2 text-[15px] leading-[22px] text-airtel-sub">
                {people[0]?.id === "c_link" ? "Your invite link is on its way." : `${nameList} will get your invite.`} You'll both be rewarded once they
                complete their first eligible recharge.
              </motion.p>
              <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="mt-6 flex -space-x-2">
                {people.slice(0, 5).map((p) => (
                  <ContactAvatar key={p.id} name={p.name} hue={p.hue} size={40} className="ring-[3px] ring-white" />
                ))}
              </motion.div>
            </div>
            <div className="space-y-2 px-5 pb-[34px]">
              <Button size="lg" block onClick={() => useProto.getState().resetTo("a_dashboard")}>
                Track In My Referrals
              </Button>
              <Button size="lg" block variant="outline" onClick={() => useProto.getState().resetTo("a_landing")}>
                Invite More Friends
              </Button>
            </div>
          </motion.div>
        )}

        {phase === "pending" && (
          <motion.div key="pending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
            <ErrorState
              icon={<Clock3 />}
              tone="warning"
              title="Invitation pending"
              body={`Your connection is slow, so we've queued your invite to ${nameList}. It'll go out automatically as soon as you're back online.`}
              primary={{
                label: "Check Again",
                onClick: () => {
                  useProto.getState().markDelivered(createdRef.current);
                  if (nonce) useProto.getState().recordSend(nonce, "success", createdRef.current);
                  setPhase("success");
                },
              }}
              secondary={{ label: "Go To My Referrals", onClick: () => useProto.getState().resetTo("a_dashboard") }}
            />
          </motion.div>
        )}

        {phase === "failure" && (
          <motion.div key="failure" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
            <ErrorState
              icon={failKind === "network" ? <WifiOff /> : <MessageSquareX />}
              title={failKind === "network" ? "Couldn't send invitations" : "SMS couldn't be sent"}
              body={
                failKind === "network"
                  ? "Looks like you're offline or the network dropped. Nothing was sent — check your connection and try again."
                  : "Your messaging app didn't confirm the SMS. Try again, or share the invite another way."
              }
              primary={{ label: "Retry", onClick: () => setAttempt((a) => a + 1) }}
              secondary={{
                label: failKind === "network" ? "Edit Invitation" : "Share Another Way",
                onClick: () => useProto.getState().back(),
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Screen>
  );
}
