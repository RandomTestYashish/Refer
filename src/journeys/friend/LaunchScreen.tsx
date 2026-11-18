import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SearchX } from "lucide-react";
import { AirtelMark, Screen, SimNote } from "@/components/app/primitives";
import { ErrorState } from "@/components/app/ErrorState";
import { useProto } from "@/store/useProto";
import { useStatusTone } from "@/components/device/statusTone";

/**
 * B03A (app installed → direct deep link) and the post-install launch of B03B
 * (deferred deep link: the referral context is restored automatically).
 */
export function LaunchScreen({ params }: { params?: Record<string, string> }) {
  const via = params?.via === "store" ? "store" : "deeplink";
  const resetTo = useProto((s) => s.resetTo);
  const replace = useProto((s) => s.replace);
  const setBRun = useProto((s) => s.setBRun);
  const [phase, setPhase] = useState<"splash" | "restoring" | "restored" | "failed">("splash");
  const [attempt, setAttempt] = useState(0);
  useStatusTone("light", phase === "splash" || phase === "restoring");

  useEffect(() => {
    setPhase("splash");
    const t: ReturnType<typeof setTimeout>[] = [];
    t.push(setTimeout(() => setPhase("restoring"), 700));
    t.push(
      setTimeout(() => {
        // Deferred deep links can lose context; a direct deep link carries the code in the URL.
        if (via === "store" && useProto.getState().scenario.contextRestore === "failed") {
          setPhase("failed");
          return;
        }
        setBRun({ contextRestored: true });
        replace("b_register");
      }, 1800),
    );
    return () => t.forEach(clearTimeout);
  }, [attempt, via, setBRun, replace]);

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
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
