import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { toast } from "sonner";
import { CloudOff, Link2, Search, SearchX, Users, X } from "lucide-react";
import { AppBar, ContactAvatar, Screen, ScreenBody, ScreenFooter } from "@/components/app/primitives";
import { ErrorState } from "@/components/app/ErrorState";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CONTACTS } from "@/domain/data";
import { activeLink, useProto } from "@/store/useProto";
import { cn, timeLeft } from "@/lib/utils";
import type { Referral } from "@/domain/types";

export function ContactsScreen() {
  const scenario = useProto((s) => s.scenario);
  const referrals = useProto((s) => s.referrals);
  const selected = useProto((s) => s.selectedContactIds);
  const toggle = useProto((s) => s.toggleContact);
  const navigate = useProto((s) => s.navigate);
  const remind = useProto((s) => s.remind);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [dup, setDup] = useState<Referral | null>(null);
  const shake = useAnimationControls();

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 650);
    return () => clearTimeout(t);
  }, []);

  const latestFor = (cid: string) => referrals.find((r) => r.contactId === cid);
  const list = useMemo(() => {
    if (scenario.contacts === "empty") return [];
    const t = q.trim().toLowerCase();
    return CONTACTS.filter((c) => !t || c.name.toLowerCase().includes(t) || c.phone.replace(/\s/g, "").includes(t.replace(/\s/g, "")));
  }, [q, scenario.contacts]);

  const onPick = (cid: string) => {
    const r = latestFor(cid);
    if (r && !selected.includes(cid) && ["invited", "link_opened"].includes(r.status) && activeLink(r).state === "active") {
      setDup(r);
      return;
    }
    toggle(cid);
  };

  const onContinue = () => {
    if (selected.length === 0) {
      shake.start({ x: [0, -8, 8, -6, 6, 0], transition: { duration: 0.4 } });
      toast.error("Select at least one friend", { description: "Tap a contact to add them to your invite." });
      return;
    }
    navigate("a_preview", { mode: "contacts" });
  };

  const header = <AppBar title="Select friends" subtitle={scenario.contacts === "unavailable" || scenario.contacts === "empty" ? undefined : `${CONTACTS.length} contacts`} />;

  if (scenario.contacts === "unavailable")
    return (
      <Screen>
        {header}
        <ErrorState
          icon={<CloudOff />}
          title="Contacts unavailable"
          body="We couldn't load your contacts right now. This can happen if your phone is still syncing. Try again, or share your link manually."
          primary={{
            label: "Try again",
            loading: retrying,
            onClick: () => {
              setRetrying(true);
              setTimeout(() => {
                setRetrying(false);
                if (useProto.getState().scenario.contacts === "unavailable")
                  toast.error("Still unavailable", { description: "Switch “Contacts” to Granted in the panel to recover." });
              }, 900);
            },
          }}
          secondary={{ label: "Share link manually", onClick: () => navigate("a_preview", { mode: "manual" }) }}
        />
      </Screen>
    );

  if (scenario.contacts === "empty")
    return (
      <Screen>
        {header}
        <ErrorState
          icon={<Users />}
          tone="neutral"
          title="No contacts found"
          body="Your phone's address book is empty. You can still invite friends by sharing your personal link on any app."
          primary={{ label: "Share link instead", onClick: () => navigate("a_preview", { mode: "manual" }) }}
          secondary={{ label: "Back", onClick: () => useProto.getState().back() }}
        />
      </Screen>
    );

  return (
    <Screen>
      {header}
      <div className="shrink-0 px-5 pb-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-airtel-sub" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or number" className="pl-10 pr-9" aria-label="Search contacts" />
          {q && (
            <button aria-label="Clear search" onClick={() => setQ("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-airtel-sub">
              <X className="size-4" />
            </button>
          )}
        </div>
        <AnimatePresence initial={false}>
          {selected.length > 0 && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="no-scrollbar flex gap-2 overflow-x-auto pt-3">
                <AnimatePresence>
                  {selected.map((id) => {
                    const c = CONTACTS.find((x) => x.id === id)!;
                    return (
                      <motion.button
                        layout
                        key={id}
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.6, opacity: 0 }}
                        onClick={() => toggle(id)}
                        className="flex shrink-0 items-center gap-1.5 rounded-full bg-airtel-red-soft py-1 pl-1 pr-2.5 text-[12.5px] font-semibold text-airtel-red"
                      >
                        <ContactAvatar name={c.name} hue={c.hue} size={24} />
                        {c.name.split(" ")[0]}
                        <X className="size-3.5" />
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ScreenBody className="pb-4">
        {loading ? (
          <div className="space-y-4 px-5 pt-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="size-11 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center px-8 pt-14 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-airtel-surface">
              <SearchX className="size-7 text-airtel-sub" />
            </span>
            <p className="mt-4 text-[16px] font-semibold">No contacts found</p>
            <p className="mt-1 text-[13px] text-airtel-sub">Nothing matches “{q}”. Check the spelling, or invite by sharing your link.</p>
            <div className="mt-5 flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setQ("")}>
                Clear search
              </Button>
              <Button variant="soft" size="sm" onClick={() => navigate("a_preview", { mode: "manual" })}>
                <Link2 /> Share link
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="px-5 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wider text-airtel-sub">{q ? "Results" : "All contacts"}</p>
            <ul>
              {list.map((c) => {
                const r = latestFor(c.id);
                const isSel = selected.includes(c.id);
                const joined = r && !["invited", "link_opened", "expired"].includes(r.status);
                const active = r && ["invited", "link_opened"].includes(r.status);
                return (
                  <li key={c.id}>
                    <button
                      disabled={!!joined}
                      onClick={() => onPick(c.id)}
                      className={cn(
                        "flex w-full items-center gap-3 px-5 py-2.5 text-left transition-colors active:bg-airtel-surface disabled:opacity-50",
                        isSel && "bg-airtel-red-soft/40",
                      )}
                    >
                      <ContactAvatar name={c.name} hue={c.hue} size={44} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5 text-[15px] font-semibold">
                          {c.name}
                          {active && <Badge variant="info">Invited · {timeLeft(activeLink(r).expiresAt - Date.now())}</Badge>}
                          {r?.status === "expired" && <Badge variant="neutral">Link expired</Badge>}
                          {joined && <Badge variant="success">Joined</Badge>}
                        </span>
                        <span className="block text-[13px] text-airtel-sub tabular">{c.phone}</span>
                      </span>
                      <Checkbox checked={isSel} tabIndex={-1} className="pointer-events-none" aria-label={`Select ${c.name}`} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </ScreenBody>

      <ScreenFooter>
        <motion.div animate={shake}>
          <Button size="lg" block onClick={onContinue} className={cn(selected.length === 0 && "bg-[#E5E5E5] text-[#9A9A9A] !shadow-none hover:bg-[#E5E5E5]")}>
            {selected.length === 0 ? "Select friends to invite" : `Continue with ${selected.length} ${selected.length === 1 ? "friend" : "friends"}`}
          </Button>
        </motion.div>
      </ScreenFooter>

      <Dialog open={!!dup} onOpenChange={(o) => !o && setDup(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dup?.name.split(" ")[0]} is already invited</DialogTitle>
            <DialogDescription>
              Their invitation is still active ({dup && timeLeft(activeLink(dup).expiresAt - Date.now())}). Sending another invite won't create a new
              referral — send a friendly reminder instead.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              block
              onClick={() => {
                if (dup) {
                  remind(dup.id);
                  toast.success(`Reminder sent to ${dup.name.split(" ")[0]}`);
                }
                setDup(null);
              }}
            >
              Send a reminder
            </Button>
            <Button block variant="ghost" onClick={() => setDup(null)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Screen>
  );
}
