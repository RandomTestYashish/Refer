import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Copy, Link2, Mail, MessageCircle, MessageSquareText, MoreHorizontal, Send, Share2 } from "lucide-react";
import { AppBar, AirtelMark, ContactAvatar, Screen, ScreenBody, ScreenFooter, SimNote } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CONTACTS, REFERRER } from "@/domain/data";
import { useProto } from "@/store/useProto";
import { inr } from "@/lib/utils";

export const INVITE_MESSAGE = "Your friend is inviting you to Airtel. Join now and complete your first eligible recharge to unlock rewards for both of you.";

export function PreviewScreen({ params }: { params?: Record<string, string> }) {
  const manual = params?.mode === "manual";
  const selected = useProto((s) => s.selectedContactIds);
  const scenario = useProto((s) => s.scenario);
  const rules = useProto((s) => s.rules);
  const navigate = useProto((s) => s.navigate);
  const [waMissing, setWaMissing] = useState(false);
  const [copyFail, setCopyFail] = useState(false);
  const [more, setMore] = useState(false);
  const previewCode = useMemo(() => `${REFERRER.first.toUpperCase()}-7K2Q`, []);
  const link = `airtel.in/r/${previewCode}`;
  const recipients = CONTACTS.filter((c) => selected.includes(c.id));
  const ids = manual ? "c_link" : selected.join(",");

  const send = (channel: "sms" | "whatsapp" | "link") => {
    if (!manual && recipients.length === 0) {
      toast.error("No friends selected", { description: "Go back and pick at least one contact." });
      return;
    }
    if (channel === "whatsapp" && scenario.share === "whatsapp_missing") {
      setWaMissing(true);
      return;
    }
    navigate("a_sending", { ids, channel, n: String(Date.now()) });
  };

  const copy = async () => {
    if (scenario.share === "copy_fail") {
      setCopyFail(true);
      return;
    }
    try {
      await navigator.clipboard?.writeText(`https://${link}`);
    } catch {
      /* clipboard can be blocked in iframes — still a successful simulated copy */
    }
    toast.success("Link copied", { description: "Paste it in any chat to invite friends." });
  };

  return (
    <Screen className="bg-airtel-surface">
      <AppBar title="Preview invitation" className="bg-airtel-surface" />
      <ScreenBody className="px-5 pb-6">
        {/* Recipients */}
        {!manual && (
          <div className="mb-4">
            <p className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-airtel-sub">Sending to {recipients.length}</p>
            <div className="flex flex-wrap gap-2">
              {recipients.map((c) => (
                <span key={c.id} className="flex items-center gap-1.5 rounded-full bg-white py-1 pl-1 pr-3 text-[13px] font-semibold shadow-sm">
                  <ContactAvatar name={c.name} hue={c.hue} size={24} />
                  {c.name.split(" ")[0]}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Branded invitation card */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="overflow-hidden rounded-[22px] bg-white shadow-lift"
        >
          <div className="relative bg-gradient-to-br from-[#E4002B] to-[#B8001F] px-5 pb-5 pt-5 text-white">
            <span className="absolute -right-8 -top-8 size-32 rounded-full bg-white/10" />
            <div className="flex items-center gap-2">
              <AirtelMark white className="size-7" />
              <span className="text-[16px] font-extrabold tracking-[-0.03em]">airtel</span>
            </div>
            <p className="relative mt-4 text-[20px] font-bold leading-[25px] tracking-[-0.02em]">
              {REFERRER.first} invited you
              <br />
              to join Airtel
            </p>
            <div className="relative mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[12px] font-semibold">
              You both get {inr(rules.friendReward)}
            </div>
          </div>
          <div className="px-5 py-4">
            <p className="text-[14px] leading-[21px] text-airtel-ink">{INVITE_MESSAGE}</p>
            <div className="mt-3 flex items-center gap-2 rounded-[12px] bg-airtel-surface px-3 py-2.5">
              <Link2 className="size-4 shrink-0 text-airtel-red" />
              <span className="flex-1 truncate text-[13px] font-semibold text-airtel-red">{link}</span>
              <button onClick={copy} className="rounded-md px-1.5 py-0.5 text-[12px] font-bold text-airtel-ink active:bg-black/5">
                Copy
              </button>
            </div>
            <p className="mt-2 text-[11.5px] text-airtel-sub">
              Link valid for {rules.linkValidityHours} hours · Recharge {inr(rules.minTransaction)}+ within {rules.firstTxnDeadlineDays} days
            </p>
          </div>
        </motion.div>

        {/* Share options */}
        <p className="mb-3 mt-6 text-[12px] font-semibold uppercase tracking-wider text-airtel-sub">Share via</p>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "WhatsApp", icon: MessageCircle, bg: "#25D366", on: () => send("whatsapp") },
            { label: "SMS", icon: MessageSquareText, bg: "#0A7AFF", on: () => send("sms") },
            { label: "Copy link", icon: Copy, bg: "#171717", on: copy },
            { label: "More", icon: MoreHorizontal, bg: "#8E8E93", on: () => setMore(true) },
          ].map(({ label, icon: Icon, bg, on }) => (
            <button key={label} onClick={on} className="flex flex-col items-center gap-1.5 rounded-[16px] bg-white py-3 shadow-sm active:scale-95">
              <span className="flex size-11 items-center justify-center rounded-full text-white" style={{ background: bg }}>
                <Icon className="size-5" />
              </span>
              <span className="text-[11.5px] font-semibold">{label}</span>
            </button>
          ))}
        </div>
      </ScreenBody>
      <ScreenFooter>
        <Button size="lg" block onClick={() => send("sms")}>
          <Send /> {manual ? "Send invite via SMS" : `Send to ${recipients.length} ${recipients.length === 1 ? "friend" : "friends"}`}
        </Button>
        <SimNote className="mt-2">No real messages are sent</SimNote>
      </ScreenFooter>

      {/* WhatsApp unavailable */}
      <Dialog open={waMissing} onOpenChange={setWaMissing}>
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto mb-1 flex size-12 items-center justify-center rounded-full bg-airtel-warning-soft">
              <MessageCircle className="size-6 text-[#B7791F]" />
            </div>
            <DialogTitle>WhatsApp isn't available</DialogTitle>
            <DialogDescription>We couldn't find WhatsApp on this phone. Send your invitation by SMS instead, or copy the link.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button block onClick={() => { setWaMissing(false); navigate("a_sending", { ids, channel: "sms", n: String(Date.now()) }); }}>
              Send via SMS
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
            <DialogDescription>Your phone blocked clipboard access. Long-press the link below to copy it manually.</DialogDescription>
          </DialogHeader>
          <div className="select-all rounded-[12px] border border-dashed border-airtel-red/40 bg-airtel-red-soft/40 px-3 py-3 text-center text-[14px] font-semibold text-airtel-red">
            https://{link}
          </div>
          <DialogFooter>
            <Button
              block
              onClick={() => {
                if (useProto.getState().scenario.share === "copy_fail") toast.error("Copy failed again", { description: "Set Share outcome to OK in the panel to recover." });
                else {
                  setCopyFail(false);
                  toast.success("Link copied");
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

      {/* Other share options */}
      <Sheet open={more} onOpenChange={setMore}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Share invitation</SheetTitle>
            <SheetDescription>Pick an app to share your link</SheetDescription>
          </SheetHeader>
          <div className="grid grid-cols-4 gap-y-5 px-5 pb-10 pt-5">
            {[
              { l: "WhatsApp", c: "#25D366", i: MessageCircle, ch: "whatsapp" as const },
              { l: "Messages", c: "#34C759", i: MessageSquareText, ch: "sms" as const },
              { l: "Gmail", c: "#EA4335", i: Mail, ch: "link" as const },
              { l: "Telegram", c: "#2AABEE", i: Send, ch: "link" as const },
            ].map(({ l, c, i: Icon, ch }) => (
              <button key={l} className="flex flex-col items-center gap-1.5" onClick={() => { setMore(false); send(ch); }}>
                <span className="flex size-14 items-center justify-center rounded-[16px] text-white" style={{ background: c }}>
                  <Icon className="size-6" />
                </span>
                <span className="text-[12px] font-medium">{l}</span>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </Screen>
  );
}
