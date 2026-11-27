import { AnimatePresence, motion } from "framer-motion";
import { create } from "zustand";
import { useProto } from "@/store/useProto";
import { haptic } from "@/lib/device";

/** The system contacts permission dialog, shown over whichever screen asked for it. */
const usePrompt = create<{ open: boolean; set: (open: boolean) => void }>((set) => ({ open: false, set: (open) => set({ open }) }));

/** Start an invite: go straight to contacts when access is granted, otherwise ask with the native dialog. */
export function useStartInvite() {
  const granted = useProto((s) => s.contactsGranted);
  const navigate = useProto((s) => s.navigate);
  const open = usePrompt((s) => s.set);
  return () => {
    haptic(8);
    if (granted) navigate("a_contacts");
    else open(true);
  };
}

export function ContactsPrompt() {
  const open = usePrompt((s) => s.open);
  const setOpen = usePrompt((s) => s.set);
  const close = (allow: boolean) => {
    setOpen(false);
    const st = useProto.getState();
    if (allow && st.scenario.contacts !== "deny") {
      st.setContactsGranted(true);
      st.navigate("a_contacts");
    } else {
      st.navigate("a_permission", { state: "denied" });
    }
  };
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="absolute inset-0 z-[80] flex items-center justify-center bg-black/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} data-testid="contacts-prompt">
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="contacts-prompt-title"
            aria-describedby="contacts-prompt-body"
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-[270px] overflow-hidden rounded-[14px] bg-[#F2F2F2]/95 text-center backdrop-blur-xl"
          >
            <div className="px-4 pb-4 pt-5">
              <p id="contacts-prompt-title" className="text-[16px] font-semibold leading-[21px] text-black">
                “Airtel” Would Like to Access Your Contacts
              </p>
              <p id="contacts-prompt-body" className="mt-1.5 text-[13px] leading-[17px] text-[#3C3C43]">
                So you can choose which friends to invite. Only the friends you pick receive an invitation.
              </p>
            </div>
            <div className="grid grid-cols-2 border-t border-black/15 text-[16px]">
              <button className="border-r border-black/15 py-3 text-[#0A7AFF] active:bg-black/5" onClick={() => close(false)}>
                Don't Allow
              </button>
              <button className="py-3 font-semibold text-[#0A7AFF] active:bg-black/5" onClick={() => close(true)} autoFocus>
                Allow
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
