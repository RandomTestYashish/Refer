import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookUser, EyeOff, Link2, Lock, Settings, UserX } from "lucide-react";
import { AppBar, Screen, ScreenBody, ScreenFooter, SimNote } from "@/components/app/primitives";
import { ErrorState } from "@/components/app/ErrorState";
import { Button } from "@/components/ui/button";
import { useProto } from "@/store/useProto";

export function PermissionScreen({ params }: { params?: Record<string, string> }) {
  const scenario = useProto((s) => s.scenario);
  const setGranted = useProto((s) => s.setContactsGranted);
  const replace = useProto((s) => s.replace);
  const navigate = useProto((s) => s.navigate);
  const [dialog, setDialog] = useState(false);
  const [denied, setDenied] = useState(params?.state === "denied");
  const [opening, setOpening] = useState(false);

  const fromLanding = params?.from === "landing";
  /** After access: back to the landing to aim at a friend, or on to the full contact list. */
  const proceed = () => (fromLanding ? useProto.getState().back() : replace("a_contacts"));
  const allow = () => {
    setDialog(false);
    if (scenario.contacts === "deny") {
      setDenied(true);
      return;
    }
    setGranted(true);
    proceed();
  };

  if (denied)
    return (
      <Screen>
        <AppBar title="Refer a Friend" />
        <ErrorState
          icon={<UserX />}
          tone="warning"
          title="Contacts access denied"
          body={
            <>
              Airtel can't see your contacts, so we can't show them here. You can turn access on in Settings, or share your invite link
              manually instead.
            </>
          }
          primary={{
            label: "Open Settings",
            loading: opening,
            onClick: () => {
              setOpening(true);
              setTimeout(() => {
                setOpening(false);
                setGranted(true);
                proceed();
              }, 900);
            },
          }}
          secondary={{ label: "Share link manually", onClick: () => navigate("a_preview", { mode: "manual" }) }}
          tertiary={{ label: "Not now", onClick: () => useProto.getState().back() }}
        >
          <SimNote>“Open Settings” simulates the user enabling access</SimNote>
        </ErrorState>
      </Screen>
    );

  return (
    <Screen>
      <AppBar title="Refer a Friend" />
      <ScreenBody className="px-6">
        <div className="flex flex-col items-center pt-6 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-6 flex size-[96px] items-center justify-center rounded-[30px] bg-airtel-surface"
          >
            <BookUser className="size-11 text-airtel-ink" strokeWidth={1.6} />
          </motion.div>
          <h2 className="text-title">Choose who to invite</h2>
          <p className="mt-2 text-[14px] leading-[21px] text-airtel-sub">
            Allow access to your contacts to pick friends to invite. Nothing is sent until you review and confirm.
          </p>
        </div>
        <ul className="mt-7 space-y-4">
          {[
            { icon: Lock, t: "Private by design", d: "Contacts stay on your phone and are only used to send invites you choose." },
            { icon: EyeOff, t: "No automatic messages", d: "We never message anyone without your confirmation." },
            { icon: Settings, t: "Change any time", d: "Turn access off from your phone's settings whenever you like." },
          ].map(({ icon: Icon, t, d }) => (
            <li key={t} className="flex gap-3.5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-airtel-surface">
                <Icon className="size-[18px]" />
              </span>
              <span>
                <span className="block text-[14px] font-semibold">{t}</span>
                <span className="block text-[13px] leading-[18px] text-airtel-sub">{d}</span>
              </span>
            </li>
          ))}
        </ul>
      </ScreenBody>
      <ScreenFooter className="space-y-2">
        <Button size="lg" block onClick={() => setDialog(true)}>
          Allow contacts
        </Button>
        <Button size="lg" block variant="outline" onClick={() => navigate("a_preview", { mode: "manual" })}>
          <Link2 /> Continue without contacts
        </Button>
      </ScreenFooter>

      {/* Simulated OS permission prompt */}
      <AnimatePresence>
        {dialog && (
          <motion.div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              role="alertdialog"
              aria-label="Allow Airtel to access your contacts?"
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-[270px] overflow-hidden rounded-[14px] bg-[#F2F2F2]/95 text-center backdrop-blur-xl"
            >
              <div className="px-4 pb-4 pt-5">
                <p className="text-[16px] font-semibold leading-[21px]">“Airtel” Would Like to Access Your Contacts</p>
                <p className="mt-1.5 text-[13px] leading-[17px] text-[#3C3C43]">So you can choose friends to invite to Airtel Refer & Earn.</p>
              </div>
              <div className="grid grid-cols-2 border-t border-black/15 text-[16px]">
                <button className="border-r border-black/15 py-3 text-[#0A7AFF] active:bg-black/5" onClick={() => { setDialog(false); setDenied(true); }}>
                  Don't Allow
                </button>
                <button className="py-3 font-semibold text-[#0A7AFF] active:bg-black/5" onClick={allow}>
                  Allow
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Screen>
  );
}
