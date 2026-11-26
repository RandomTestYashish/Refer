import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Check, Copy, Link2, Mail, MessageCircle, MessageSquareText, MoreHorizontal, Pencil, Send, Share2, UserPlus, Users, X } from "lucide-react";
import { AppBar, ContactAvatar, Screen, ScreenBody, ScreenFooter, SimNote } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CONTACTS, PERSONAL_LINK } from "@/domain/data";
import { useProto } from "@/store/useProto";
import { firstName, inviteMessage } from "@/lib/invite";
import { copyText } from "@/lib/share";
import { cn, inr } from "@/lib/utils";

type Channel = "sms" | "whatsapp" | "link";

/** A06 — Invitation preview for one friend, several friends, or a shareable link. */
export function PreviewScreen({ params }: { params?: Record<string, string> }) {
  const manual = params?.mode === "manual";
  const selected = useProto((s) => s.selectedContactIds);
  const toggle = useProto((s) => s.toggleContact);
  const setSelected = useProto((s) => s.setSelected);
  const scenario = useProto((s) => s.scenario);
  const rules = useProto((s) => s.rules);
  const navigate = useProto((s) => s.navigate);
  const back = useProto((s) => s.back);
  const [waMissing, setWaMissing] = useState(false);
  const [copyFail, setCopyFail] = useState(false);
  const [more, setMore] = useState(false);
  const [confirmBulk, setConfirmBulk] = useState<Channel | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [focusId, setFocusId] = useState<string | undefined>(undefined);
  const link = `https://${PERSONAL_LINK}`;
  const recipients = CONTACTS.filter((c) => selected.includes(c.id));
  const multi = !manual && recipients.length > 1;
  const previewFor = manual ? undefined : (recipients.find((c) => c.id === focusId) ?? recipients[0]);
  const ids = manual ? "c_link" : selected.join(",");

  const go = (channel: Channel) => navigate("a_sending", { ids, channel, n: String(Date.now()) });
  const send = (channel: Channel) => {
    if (!manual && recipients.length === 0) return;
    if (channel === "whatsapp" && scenario.share === "whatsapp_missing") return setWaMissing(true);
    if (multi) return setConfirmBulk(channel);
    go(channel);
  };

  const copy = async () => {
    if (scenario.share === "copy_fail") return setCopyFail(true);
    const ok = await copyText(link);
    toast.success(ok ? "Link copied" : "Link ready to paste", {
      description: ok ? "Paste it in any chat to invite friends." : "Prototype: clipboard is blocked in this preview, so nothing was copied.",
    });
  };

  const cancel = () => {
    setConfirmCancel(false);
    setSelected([]);
    useProto.getState().resetTo("a_landing");
  };

  const overlays = (
    <>
      {/* Bulk confirmation */}
      <Dialog open={!!confirmBulk} onOpenChange={(o) => !o && setConfirmBulk(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send {recipients.length} invites?</DialogTitle>
            <DialogDescription>
              {recipients.map((c) => firstName(c.name)).join(", ")} will each get a personal invite by {confirmBulk === "whatsapp" ? "WhatsApp" : confirmBulk === "sms" ? "SMS" : "link"}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button block onClick={() => { const c = confirmBulk!; setConfirmBulk(null); go(c); }}>
              Send {recipients.length} invites
            </Button>
            <Button block variant="ghost" onClick={() => setConfirmBulk(null)}>
              Not yet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel */}
      <Dialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discard this invite?</DialogTitle>
            <DialogDescription>Nothing has been sent. Your selected friends will be cleared.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button block onClick={cancel}>
              Discard invite
            </Button>
            <Button block variant="ghost" onClick={() => setConfirmCancel(false)}>
              Keep editing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* WhatsApp unavailable */}
      <Dialog open={waMissing} onOpenChange={setWaMissing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>WhatsApp isn't available</DialogTitle>
            <DialogDescription>We couldn't find WhatsApp on this phone. Send your invite by SMS instead, or copy the link.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button block onClick={() => { setWaMissing(false); multi ? setConfirmBulk("sms") : go("sms"); }}>
              Send by SMS
            </Button>
            <Button block variant="outline" onClick={() => { setWaMissing(false); void copy(); }}>
              Copy link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Copy failed */}
      <Dialog open={copyFail} onOpenChange={setCopyFail}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Couldn't copy the link</DialogTitle>
            <DialogDescription>Your phone blocked clipboard access. Press and hold the link below to copy it yourself.</DialogDescription>
          </DialogHeader>
          <div className="select-all break-all rounded-[12px] border border-dashed border-gen4-bg-200 bg-gen4-bg-50 px-3 py-3 text-center text-[14px] font-semibold">{link}</div>
          <DialogFooter>
            <Button
              block
              onClick={() => {
                if (useProto.getState().scenario.share === "copy_fail") toast.error("Copy failed again", { description: "Set Share outcome to OK in the panel to recover." });
                else {
                  setCopyFail(false);
                  void copy();
                }
              }}
            >
              Try again
            </Button>
            <Button block variant="outline" onClick={() => { setCopyFail(false); setMore(true); }}>
              <Share2 /> Share another way
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Other apps */}
      <Sheet open={more} onOpenChange={setMore}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Share invite</SheetTitle>
            <SheetDescription>Pick an app to send your invite</SheetDescription>
          </SheetHeader>
          <div className="grid grid-cols-4 gap-y-5 px-5 pb-10 pt-5">
            {[
              { l: "WhatsApp", i: MessageCircle, ch: "whatsapp" as const },
              { l: "Messages", i: MessageSquareText, ch: "sms" as const },
              { l: "Gmail", i: Mail, ch: "link" as const },
              { l: "Telegram", i: Send, ch: "link" as const },
            ].map(({ l, i: Icon, ch }) => (
              <button key={l} className="flex flex-col items-center gap-1.5" onClick={() => { setMore(false); send(ch); }}>
                <span className="flex size-14 items-center justify-center rounded-[16px] bg-airtel-surface text-airtel-ink">
                  <Icon className="size-6" />
                </span>
                <span className="text-[12px] font-medium">{l}</span>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );

  // Step 3 of Pull · Aim · Invite: one friend — confirm and send.
  if (!manual && recipients.length === 1) {
    const c = recipients[0];
    const first = firstName(c.name);
    return (
      <Screen>
        <AppBar
          title="Refer a Friend"
          transparent
          right={
            <button onClick={() => setConfirmCancel(true)} className="rounded-md px-1.5 py-1 text-[15px] font-medium text-[#1D1D1F] active:bg-black/5">
              Cancel
            </button>
          }
        />
        <ScreenBody className="px-6 pb-6">
          <div className="flex flex-col items-center pt-6 text-center">
            <div className="relative">
              {[-160, -130, -50, -20, 20, 160].map((deg, i) => (
                <span key={deg} aria-hidden className="absolute left-1/2 top-1/2" style={{ transform: `rotate(${deg}deg)` }}>
                  <motion.span
                    className="-mt-[1.5px] block h-[3px] w-3 rounded-full bg-[#34C759]"
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 70, opacity: 1 }}
                    transition={{ delay: 0.2 + i * 0.03, duration: 0.4, ease: "easeOut" }}
                  />
                </span>
              ))}
              <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 320, damping: 22 }}>
                <ContactAvatar name={c.name} hue={c.hue} size={112} className="shadow-[0_12px_30px_rgba(29,29,31,0.12)] ring-4 ring-white" />
              </motion.div>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 420, damping: 18 }}
                className="absolute bottom-0 right-0 flex size-9 items-center justify-center rounded-full bg-[#34C759] text-white ring-[3px] ring-white"
              >
                <Check className="size-5" strokeWidth={3} />
              </motion.span>
            </div>
            <h1 className="mt-6 text-[30px] font-bold leading-[36px] tracking-[-0.03em] text-[#1D1D1F]">Invite {first}?</h1>
            <p className="mt-1 text-[14px] text-[#3C3C43]/70 tabular">{c.phone}</p>
          </div>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.12 }}
            className="mt-6 flex gap-3 rounded-[20px] border border-white p-4 text-left shadow-[0_6px_20px_rgba(29,29,31,0.06)]"
            style={{ background: "linear-gradient(140deg, #FFFFFF 0%, #FFF3F7 55%, #F3F0FF 100%)" }}
            data-testid="invite-message"
          >
            <svg viewBox="0 0 40 40" className="mt-0.5 size-8 shrink-0" aria-hidden>
              <path d="M7 29c3-10.5 13.5-17.5 21-14.2 5.4 2.4 3.6 10.2-3.3 12.2-4.3 1.2-7.8-.8-7-3.8.8-2.8 4.7-3.6 7.6-2.1" fill="none" stroke="#E4002B" strokeWidth="5" strokeLinecap="round" />
            </svg>
            <p className="min-w-0 text-[15px] leading-[21px] text-[#1D1D1F]">
              {inviteMessage(first, "\u0000")
                .split("\n")
                .map((line, i) =>
                  line === "\u0000" ? (
                    <span key={i} className="block break-all font-medium text-[#007AFF]">
                      {link}
                    </span>
                  ) : (
                    <span key={i} className="block min-h-[10px]">
                      {line}
                    </span>
                  ),
                )}
            </p>
          </motion.div>
          <p className="mt-3 px-1 text-center text-[12.5px] leading-[18px] text-[#3C3C43]/70">
            {first} gets a personal link valid for {rules.linkValidityHours} hours. You earn {inr(rules.referrerReward)} after their first {rules.qualifyingAction} of{" "}
            {inr(rules.minTransaction)}+.
          </p>
          <div className="mt-4 flex justify-center gap-5 text-[14px] font-medium text-[#007AFF]">
            <button onClick={back} className="rounded-md px-1">Choose someone else</button>
            <button onClick={() => setMore(true)} className="rounded-md px-1">More ways to send</button>
          </div>
        </ScreenBody>
        <div className="shrink-0 space-y-2.5 px-5 pb-[30px] pt-2">
          <Button size="lg" block onClick={() => send("sms")} className="rounded-full">
            <Send /> Send Invite (SMS)
          </Button>
          <Button size="lg" block variant="outline" onClick={copy} className="rounded-full">
            <Link2 /> Copy Link
          </Button>
          <SimNote>Messages are simulated unless your phone's SMS app opens</SimNote>
        </div>
        {overlays}
      </Screen>
    );
  }

  const title = manual ? "Share your link" : multi ? `Invite ${recipients.length} friends` : "Review invite";

  return (
    <Screen className="bg-airtel-surface">
      <AppBar
        title={title}
        className="bg-airtel-surface"
        right={
          <button onClick={() => setConfirmCancel(true)} className="rounded-md px-1.5 py-1 text-[14px] font-semibold text-airtel-ink active:bg-black/5">
            Cancel
          </button>
        }
      />
      <ScreenBody className="px-5 pb-6 pt-4">
        {!manual && recipients.length === 0 ? (
          <div className="flex flex-col items-center pt-20 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-white">
              <Users className="size-7 text-airtel-sub" />
            </span>
            <p className="mt-4 text-[17px] font-semibold">No friends selected</p>
            <p className="mt-1 text-[14px] text-airtel-sub">Choose at least one friend to send your invite to.</p>
            <Button className="mt-5" onClick={back}>
              <UserPlus /> Choose friends
            </Button>
          </div>
        ) : (
          <>
            {/* Recipients */}
            {!manual && (
              <section aria-label="Recipients" className="mb-5">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[13px] font-semibold text-airtel-sub">{multi ? `Sending to ${recipients.length} friends` : "Sending to"}</p>
                  <button onClick={back} className="flex items-center gap-1 rounded-md text-[13px] font-semibold text-airtel-ink underline underline-offset-2">
                    <Pencil className="size-3.5" /> {multi ? "Edit list" : "Change"}
                  </button>
                </div>
                {multi ? (
                  <ul className="flex flex-wrap gap-2">
                    <AnimatePresence initial={false}>
                      {recipients.map((c) => {
                        const on = c.id === previewFor?.id;
                        return (
                          <motion.li key={c.id} layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                            <span
                              className={cn(
                                "flex items-center rounded-full border bg-white text-[13px] font-semibold transition-colors",
                                on ? "border-airtel-ink" : "border-airtel-line",
                              )}
                            >
                              <button onClick={() => setFocusId(c.id)} aria-pressed={on} aria-label={`Preview message for ${c.name}`} className="flex items-center gap-1.5 py-1 pl-1 pr-1.5">
                                <ContactAvatar name={c.name} hue={c.hue} size={24} />
                                {firstName(c.name)}
                              </button>
                              <button onClick={() => toggle(c.id)} aria-label={`Remove ${c.name}`} className="mr-1 flex size-6 items-center justify-center rounded-full text-airtel-sub active:bg-black/5">
                                <X className="size-3.5" />
                              </button>
                            </span>
                          </motion.li>
                        );
                      })}
                    </AnimatePresence>
                  </ul>
                ) : (
                  previewFor && (
                    <div className="flex items-center gap-3 rounded-[16px] bg-white p-3">
                      <ContactAvatar name={previewFor.name} hue={previewFor.hue} size={44} />
                      <span className="min-w-0">
                        <span className="block text-[16px] font-semibold">{previewFor.name}</span>
                        <span className="block text-[13px] text-airtel-sub tabular">{previewFor.phone}</span>
                      </span>
                    </div>
                  )
                )}
              </section>
            )}

            {/* Message preview */}
            <section aria-label="Message preview">
              <p className="mb-2 text-[13px] font-semibold text-airtel-sub">
                {multi ? `Preview for ${firstName(previewFor!.name)} · each friend gets their own name` : "Message preview"}
              </p>
              <motion.div
                key={previewFor?.id ?? "link"}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[20px] rounded-bl-[6px] bg-white p-4 text-[15px] leading-[22px] text-airtel-ink shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                data-testid="invite-message"
              >
                {inviteMessage(previewFor ? firstName(previewFor.name) : undefined, "\u0000")
                  .split("\n")
                  .map((line, i) =>
                    line === "\u0000" ? (
                      <span key={i} className="block break-all font-semibold text-gen4-action">
                        {link}
                      </span>
                    ) : (
                      <span key={i} className="block min-h-[11px]">
                        {line}
                      </span>
                    ),
                  )}
              </motion.div>
              <dl className="mt-4 space-y-2 rounded-[16px] bg-white p-4 text-[13px] leading-[19px]">
                {[
                  ["Invite link", `${manual ? "Personal link" : "A unique link per friend"}, valid for ${rules.linkValidityHours} hours`],
                  ["Your reward", `${inr(rules.referrerReward)} once they join and complete a first ${rules.qualifyingAction} of ${inr(rules.minTransaction)}+ within ${rules.firstTxnDeadlineDays} days`],
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-3">
                    <dt className="w-[86px] shrink-0 text-airtel-sub">{k}</dt>
                    <dd className="text-airtel-ink">{v}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {/* Other ways to send */}
            <p className="mb-2 mt-6 text-[13px] font-semibold text-airtel-sub">Other ways to send</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "WhatsApp", icon: MessageCircle, on: () => send("whatsapp") },
                { label: "Copy link", icon: Copy, on: copy },
                { label: "More apps", icon: MoreHorizontal, on: () => setMore(true) },
              ].map(({ label, icon: Icon, on }) => (
                <button key={label} onClick={on} className="flex flex-col items-center gap-1.5 rounded-[16px] bg-white py-3 text-[12.5px] font-semibold active:scale-[0.97]">
                  <Icon className="size-5" />
                  {label}
                </button>
              ))}
            </div>
          </>
        )}
      </ScreenBody>

      {(manual || recipients.length > 0) && (
        <ScreenFooter>
          <Button size="lg" block onClick={() => send("sms")}>
            <Send />
            {manual ? "Send by SMS" : multi ? `Send ${recipients.length} invites by SMS` : `Send invite to ${firstName(recipients[0].name)}`}
          </Button>
          <SimNote className="mt-2">Messages are simulated unless your phone's SMS app opens</SimNote>
        </ScreenFooter>
      )}

      {overlays}
    </Screen>
  );
}
