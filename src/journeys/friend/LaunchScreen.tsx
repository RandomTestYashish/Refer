import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Gift, LinkIcon, Loader2, SearchX } from "lucide-react";
import { AirtelMark, ContactAvatar, Screen, SimNote } from "@/components/app/primitives";
import { ErrorState } from "@/components/app/ErrorState";
import { Button } from "@/components/ui/button";
import { REFERRER } from "@/domain/data";
import { activeLink, useFocusReferral, useProto } from "@/store/useProto";
import { inr } from "@/lib/utils";
import { useStatusTone } from "@/components/device/statusTone";

/**
 * B03A (app installed → direct deep link) and the post-install launch of B03B
 * (deferred deep link: the referral context is restored automatically).
 */
export function LaunchScreen({ params }: { params?: Record<string, string> }) {
  const via = params?.via === "store" ? "store" : "deeplink";
  const r = useFocusReferral();
  const rules = useProto((s) => s.rules);
  const navigate = useProto((s) => s.navigate);
  const resetTo = useProto((s) => s.resetTo);
  const setBRun = useProto((s) => s.setBRun);
  const [phase, setPhase] = useState<"splash" | "restoring" | "restored" | "failed">("splash");
  const [step, setStep] = useState(0);
  const [attempt, setAttempt] = useState(0);
  useStatusTone("light", phase === "splash" || phase === "restoring");

  useEffect(() => {
    setPhase("splash");
    setStep(0);
    const t: ReturnType<typeof setTimeout>[] = [];
    t.push(setTimeout(() => setPhase("restoring"), 1100));
    t.push(setTimeout(() => setStep(1), 1600));
    t.push(
      setTimeout(() => {
        // Deferred deep links can lose context; a direct deep link carries the code in the URL.
        if (via === "store" && useProto.getState().scenario.contextRestore === "failed") {
          setPhase("failed");
          return;
        }
        setStep(2);
      }, 2300),
    );
    t.push(
      setTimeout(() => {
        if (via === "store" && useProto.getState().scenario.contextRestore === "failed") return;
        setStep(3);
        setBRun({ contextRestored: true });
        setTimeout(() => setPhase("restored"), 450);
      }, 2900),
    );
    return () => t.forEach(clearTimeout);
  }, [attempt, via, setBRun]);

  if (phase === "failed")
    return (
      <Screen>
        <ErrorState
          icon={<SearchX />}
          tone="warning"
          title="We couldn't find your invite"
          body="Airtel opened, but your invitation details didn't come through after installing. Tap the invite link in your SMS again — it now opens straight in the app."
          primary={{ label: "Try again", onClick: () => setAttempt((a) => a + 1) }}
          secondary={{ label: "Open invite link from SMS", onClick: () => resetTo("b_sms") }}
        >
          <SimNote>Set “Context restore” to Success in the panel to recover via Try again</SimNote>
        </ErrorState>
      </Screen>
    );

  const steps = [
    "Opening Airtel",
    via === "store" ? "Retrieving your invitation (deferred link)" : "Reading your invitation link",
    "Verifying invite",
    `Invite from ${REFERRER.first} restored`,
  ];

  return (
    <div className="relative h-full overflow-hidden">
      <AnimatePresence mode="wait">
        {phase !== "restored" ? (
          <motion.div
            key="splash"
            initial={via === "deeplink" ? { scale: 0.2, borderRadius: 80, opacity: 0.6 } : { opacity: 0 }}
            animate={{ scale: 1, borderRadius: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="flex h-full flex-col items-center justify-center bg-airtel-red text-white"
          >
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
              <AirtelMark white className="size-[84px]" />
            </motion.div>
            <p className="mt-4 text-[30px] font-extrabold tracking-[-0.04em]">airtel</p>
            <AnimatePresence>
              {phase === "restoring" && (
                <motion.ul initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-12 w-[250px] space-y-2.5">
                  {steps.map((s, i) => (
                    <li key={s} className="flex items-center gap-2.5 text-[13.5px]">
                      {step > i || (i === 3 && step === 3) ? (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex size-5 items-center justify-center rounded-full bg-white text-airtel-red">
                          <Check className="size-3" strokeWidth={4} />
                        </motion.span>
                      ) : step === i ? (
                        <Loader2 className="size-5 animate-spin text-white/80" />
                      ) : (
                        <span className="size-5 rounded-full border-2 border-white/30" />
                      )}
                      <span className={step >= i ? "text-white" : "text-white/50"}>{s}</span>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div key="restored" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-full flex-col bg-white pt-[44px]">
            <div className="flex flex-1 flex-col items-center justify-center px-7 text-center">
              <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 220, damping: 16 }} className="relative">
                <ContactAvatar name={REFERRER.name} hue={350} size={88} />
                <span className="absolute -bottom-1 -right-1 flex size-9 items-center justify-center rounded-full border-4 border-white bg-airtel-red text-white">
                  <Gift className="size-4" />
                </span>
              </motion.div>
              <motion.h1 initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="mt-6 text-display">
                {REFERRER.first} invited you to Airtel
              </motion.h1>
              <motion.p initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.18 }} className="mt-2 text-[15px] leading-[22px] text-airtel-sub">
                Complete your first eligible recharge and you'll both get {inr(rules.friendReward)}.
              </motion.p>
              {r && (
                <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.26 }} className="mt-5 flex items-center gap-2 rounded-full bg-airtel-surface px-3.5 py-2 text-[12.5px] font-semibold text-airtel-sub">
                  <LinkIcon className="size-3.5" /> Invite code {activeLink(r).code} applied automatically
                </motion.div>
              )}
            </div>
            <div className="px-5 pb-[34px]">
              <Button size="lg" block onClick={() => navigate("b_register")}>
                Continue
              </Button>
              <SimNote className="mt-3">{via === "store" ? "Deferred deep link — no code entry needed" : "Direct deep link into the installed app"}</SimNote>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
