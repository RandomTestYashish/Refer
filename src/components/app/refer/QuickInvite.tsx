import { forwardRef, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Plus, UserPlus } from "lucide-react";
import { ContactAvatar } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { CONTACTS } from "@/domain/data";
import type { BusinessRules } from "@/config/businessRules";
import { useProto } from "@/store/useProto";
import { track } from "@/lib/analytics";
import { cn, inr } from "@/lib/utils";

/**
 * "Who will you invite?" — tap friends to pick them right on the landing page.
 * Each pick pops a check and a +₹25 that floats up; the CTA counts what you'd earn.
 * Picks carry into the contacts screen.
 */
export const QuickInvite = forwardRef<HTMLDivElement, { rules: BusinessRules; onInvite: (source: string) => void; onMore: () => void }>(
  ({ rules, onInvite, onMore }, ctaRef) => {
    const reduce = useReducedMotion();
    const referrals = useProto((s) => s.referrals);
    const setSelected = useProto((s) => s.setSelected);
    const [picked, setPicked] = useState<string[]>([]);
    const [pops, setPops] = useState<{ id: string; k: number }[]>([]);

    // Suggest friends you haven't invited yet.
    const people = useMemo(() => {
      const invited = new Set(referrals.map((r) => r.contactId));
      return CONTACTS.filter((c) => !invited.has(c.id)).slice(0, 4);
    }, [referrals]);

    const toggle = (id: string) => {
      setPicked((p) => {
        const on = !p.includes(id);
        track("quick_invite_toggled", { id, on });
        if (on && !reduce) {
          const k = Date.now();
          setPops((x) => [...x, { id, k }]);
          setTimeout(() => setPops((x) => x.filter((y) => y.k !== k)), 900);
        }
        return on ? [...p, id] : p.filter((x) => x !== id);
      });
    };

    const n = picked.length;
    const go = () => {
      setSelected(picked);
      onInvite(n ? "quick_pick" : "sheet_cta");
    };

    return (
      <section aria-labelledby="invite-title" className="rounded-[20px] border border-[#E6E9EF] bg-[linear-gradient(180deg,#FFFFFF,#F7F7F7)] p-4 shadow-[0_4px_14px_rgba(41,44,49,0.05)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="invite-title" className="text-[18px] font-extrabold leading-6 text-[#292C31]">
              Who will you invite?
            </h2>
            <p className="mt-0.5 text-[13px] text-[#5C5F66]">
              You get {inr(rules.referrerReward)}. They get {inr(rules.friendReward)} + {rules.friendDataGB} GB.
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-5 gap-1">
          {people.map((c) => {
            const on = picked.includes(c.id);
            return (
              <button key={c.id} onClick={() => toggle(c.id)} className="relative flex flex-col items-center gap-1.5 focus:outline-none" aria-pressed={on} aria-label={`${on ? "Remove" : "Add"} ${c.name}`}>
                <motion.span
                  className={cn("relative rounded-full ring-2 ring-offset-2 transition-[box-shadow]", on ? "ring-[#E32121]" : "ring-transparent")}
                  animate={on && !reduce ? { scale: [1, 0.86, 1.08, 1] } : { scale: 1 }}
                  transition={{ duration: 0.4 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ContactAvatar name={c.name} hue={c.hue} size={52} />
                  <AnimatePresence>
                    {on && (
                      <motion.span
                        className="absolute -bottom-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-[#E32121] ring-2 ring-white"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 18 }}
                      >
                        <Check className="size-3 text-white" strokeWidth={4} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {/* +₹25 floats up on pick */}
                  <AnimatePresence>
                    {pops
                      .filter((p) => p.id === c.id)
                      .map((p) => (
                        <motion.span
                          key={p.k}
                          className="pointer-events-none absolute left-1/2 top-0 -ml-5 w-10 text-center text-[12px] font-extrabold text-[#0F7033]"
                          initial={{ y: 0, opacity: 0 }}
                          animate={{ y: -26, opacity: [0, 1, 0] }}
                          transition={{ duration: 0.85, ease: "easeOut" }}
                        >
                          +{inr(rules.referrerReward)}
                        </motion.span>
                      ))}
                  </AnimatePresence>
                </motion.span>
                <span className={cn("w-full truncate text-center text-[12px]", on ? "font-bold text-[#292C31]" : "font-medium text-[#5C5F66]")}>{c.name.split(" ")[0]}</span>
              </button>
            );
          })}
          <button onClick={onMore} className="flex flex-col items-center gap-1.5" aria-label="Choose from all contacts">
            <span className="flex size-[52px] items-center justify-center rounded-full border-[1.5px] border-dashed border-[#B5B8BE] bg-white text-[#292C31]">
              <Plus className="size-5" />
            </span>
            <span className="text-[12px] font-medium text-[#5C5F66]">More</span>
          </button>
        </div>

        <div ref={ctaRef} className="mt-4">
          <Button size="lg" block onClick={go}>
            <UserPlus />
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span key={n} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} transition={{ duration: 0.18 }}>
                {n === 0 ? "Invite Friends" : `Invite ${n} ${n === 1 ? "Friend" : "Friends"} · Earn ${inr(n * rules.referrerReward)}`}
              </motion.span>
            </AnimatePresence>
          </Button>
        </div>
      </section>
    );
  },
);
QuickInvite.displayName = "QuickInvite";
