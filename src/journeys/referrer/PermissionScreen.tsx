import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookUser, EyeOff, Link2, Lock, Settings, ShieldCheck, UserX } from "lucide-react";
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

  const allow = () => {
    setDialog(false);
    if (scenario.contacts === "deny") {
      setDenied(true);
      return;
    }
    setGranted(true);
    replace("a_contacts");
  };

  if (denied)
    return (
      <Screen>
        <AppBar title="Invite friends" />
        <ErrorState
          icon={<UserX />}
          tone="warning"
          title="Contacts access denied"
          body={
            <>
              To see your contacts here, turn on access in Settings. Or share your invite link manually.
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
                replace("a_contacts");
              }, 900);
            },
          }}
          secondary={{ label: "Share Link Manually", onClick: () => navigate("a_preview", { mode: "manual" }) }}
          tertiary={{ label: "Not Now", onClick: () => useProto.getState().back() }}
        >
          <SimNote>“Open Settings” simulates the user enabling access</SimNote>
        </ErrorState>
      </Screen>
    );

  return (
    <Screen>
      <AppBar title="Invite friends" />
      <ScreenBody className="px-6">
        <div className="flex flex-col items-center pt-6 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative mb-6 flex size-[120px] items-center justify-center rounded-[36px] bg-airtel-red-soft"
          >
            <BookUser className="size-14 text-airtel-red" strokeWidth={1.6} />
            <motion.span
              className="absolute -right-2 -top-2 flex size-10 items-center justify-center rounded-full bg-white shadow-card"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2.2, repeat: Infinity }}
            >
              <ShieldCheck className="size-5 text-airtel-success" />
            </motion.span>
          </motion.div>
          <h2 className="text-title">Find friends faster</h2>
          <p className="mt-2 text-[14px] leading-[21px] text-airtel-sub">
            To pick who to invite, allow access to your contacts. You choose exactly who receives an invitation.
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
          Allow Contacts
        </Button>
        <Button size="lg" block variant="outline" onClick={() => navigate("a_preview", { mode: "manual" })}>
          <Link2 /> Continue Without Contacts
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
