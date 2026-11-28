import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Clock3, Copy, Download, MessageSquareText, MessageSquareX, Pencil, Send, Share2, WifiOff } from "lucide-react";
import { AnimatedCheck, AppBar, ContactAvatar, Screen, ScreenBody, ScreenFooter, SimNote } from "@/components/app/primitives";
import { ErrorState } from "@/components/app/ErrorState";
import { Confetti } from "@/components/app/Confetti";
import { copyInviteLink } from "@/components/app/InviteKit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { InviteEnvelope, type EnvelopeStage } from "@/components/refer/InviteEnvelope";
import { CreativePreview, THEMES, inviteText, renderCreativePng, type CreativeData, type CreativeTheme } from "@/components/refer/ShareCreative";
import iconWhatsapp from "@/assets/refer/icon-whatsapp.png";
import { CONTACTS, PERSONAL_LINK, REFERRER } from "@/domain/data";
import { useProto } from "@/store/useProto";
import { downloadBlob, nativeShare, openSms, openWhatsApp } from "@/lib/share";
import { haptic, useOnline } from "@/lib/device";
import { cn } from "@/lib/utils";
import { performSend } from "./sendInvites";

/** A06 — personalised invitation (contacts) or shareable creative (WhatsApp / SMS / any app). */
export function PreviewScreen({ params }: { params?: Record<string, string> }) {
  if (params?.mode === "manual") return <ShareScreen channel={(params.channel as Channel) ?? "any"} />;
  return <EnvelopeInvite />;
}

/* ═════════════════════════ Envelope invitation ═════════════════════════ */

type Phase = "compose" | "sealing" | "flying" | "sent" | "pending" | "failure";

function EnvelopeInvite() {
  const selected = useProto((s) => s.selectedContactIds);
  const navigate = useProto((s) => s.navigate);
  const online = useOnline();
  const [recipients] = useState(() => selected.map((id) => CONTACTS.find((c) => c.id === id)).filter((c): c is (typeof CONTACTS)[number] => !!c)); // frozen: selection clears after sending
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState<Phase>("compose");
  const [fail, setFail] = useState<"network" | "sms" | "offline">("network");
  const [attempt, setAttempt] = useState(0);

  const friend = recipients[active];
  const first = (n?: string) => n?.split(" ")[0] ?? "there";
  const names = recipients.map((r) => first(r.name));
  const nameList = names.length <= 2 ? names.join(" and ") : `${names.slice(0, 2).join(", ")} and ${names.length - 2} more`;

  if (recipients.length === 0)
    return (
      <Screen>
        <AppBar title="Your invitation" />
        <ErrorState
          icon={<Send />}
          tone="neutral"
          title="No friends selected"
          body="Pick at least one friend to send a personal invitation, or share your link on any app."
          primary={{ label: "Choose friends", onClick: () => navigate("a_contacts") }}
          secondary={{ label: "Share link instead", onClick: () => navigate("a_preview", { mode: "manual", channel: "any" }) }}
        />
      </Screen>
    );

  const send = () => {
    haptic(12);
    setPhase("sealing");
    // Seal first; only after the flap closes do we actually attempt the send.
    setTimeout(() => {
      const out = performSend(recipients.map((r) => r.id), "sms");
      if (out.phase === "failure") {
        setFail(out.kind);
        setPhase("failure");
        return;
      }
      setPhase(out.phase === "pending" ? "pending" : "flying");
    }, 900);
  };

  if (phase === "sent")
    return (
      <Screen className="relative overflow-hidden">
        <Confetti originY="30%" />
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center" data-testid="invite-sent">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 14 }}
            className="flex size-[96px] items-center justify-center rounded-full bg-airtel-success text-white shadow-[0_14px_30px_rgba(22,131,74,0.3)]"
          >
            <AnimatedCheck className="size-12" />
          </motion.div>
          <motion.h2 initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }} className="mt-6 text-display">
            Your invite is sent!
          </motion.h2>
          <motion.p initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35 }} className="mt-2 text-[15px] leading-[22px] text-airtel-sub">
            We've sent your invitation to {nameList}. You'll both be rewarded once they complete their first qualifying recharge.
          </motion.p>
          <div className="mt-5 flex -space-x-2">
            {recipients.slice(0, 5).map((p) => (
              <ContactAvatar key={p.id} name={p.name} hue={p.hue} size={40} className="ring-[3px] ring-white" />
            ))}
          </div>
          <SimNote className="mt-5">SMS is simulated — no real message was sent</SimNote>
        </div>
        <div className="space-y-2 px-5 pb-[34px]">
          <Button size="lg" block onClick={() => useProto.getState().resetTo("a_dashboard")}>
            Track in My referrals
          </Button>
          <Button size="lg" block variant="outline" onClick={() => useProto.getState().resetTo("a_landing")}>
            Invite more friends
          </Button>
        </div>
      </Screen>
    );

  if (phase === "pending")
    return (
      <Screen>
        <ErrorState
          icon={<Clock3 />}
          tone="warning"
          title="Invite waiting to send"
          body={`Your connection is slow, so your invite to ${nameList} is queued. It goes out automatically once you're back online.`}
          primary={{ label: "Go to My referrals", onClick: () => useProto.getState().resetTo("a_dashboard") }}
          secondary={{ label: "Back to Refer Airtel App", onClick: () => useProto.getState().resetTo("a_landing") }}
        />
      </Screen>
    );

  if (phase === "failure")
    return (
      <Screen>
        <AppBar title="Your invitation" />
        <ErrorState
          icon={fail === "sms" ? <MessageSquareX /> : <WifiOff />}
          title={fail === "sms" ? "Your SMS didn't go through" : fail === "offline" ? "You're offline" : "Couldn't send your invite"}
          body={
            fail === "sms"
              ? "Your messaging app didn't confirm the SMS. Nothing was sent. Try again, or share your link another way."
              : "Nothing was sent. Check your connection and try again."
          }
          primary={{
            label: "Try again",
            onClick: () => {
              setPhase("compose");
              setReady(true);
              setAttempt((a) => a + 1);
            },
          }}
          secondary={{ label: "Share another way", onClick: () => navigate("a_preview", { mode: "manual", channel: "any" }) }}
        />
      </Screen>
    );

  return (
    <Screen className="bg-white">
      <AppBar title="Your invitation" transparent />
      <ScreenBody className="px-5 pb-4">
        {recipients.length > 1 && (
          <div className="mb-1">
            <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-airtel-sub">Preview for each friend</p>
            <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5" role="tablist" aria-label="Recipients">
              {recipients.map((c, i) => (
                <button
                  key={c.id}
                  role="tab"
                  aria-selected={i === active}
                  disabled={phase !== "compose"}
                  onClick={() => setActive(i)}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-full border py-1 pl-1 pr-3 text-[13px] font-semibold transition",
                    i === active ? "border-refer-ink bg-white text-refer-ink" : "border-[#ECECEE] bg-white text-refer-muted",
                  )}
                >
                  <ContactAvatar name={c.name} hue={c.hue} size={24} />
                  {first(c.name)}
                </button>
              ))}
            </div>
          </div>
        )}
        {recipients.length === 1 && (
          <p className="mb-1 flex items-center gap-2 text-[14px] text-airtel-sub">
            <ContactAvatar name={friend.name} hue={friend.hue} size={28} />
            To <span className="font-semibold text-airtel-ink">{friend.name}</span>
            <span className="tabular">· {friend.phone}</span>
          </p>
        )}

        <div className="mt-2">
          <InviteEnvelope
            key={attempt}
            friendName={first(friend.name)}
            referrerName={REFERRER.first}
            stage={phase === "compose" ? "compose" : (phase as EnvelopeStage)}
            onIntroDone={() => setReady(true)}
            onFlown={() => setPhase("sent")}
          />
        </div>
        <p className="mt-5 text-center text-[12.5px] leading-[18px] text-airtel-sub">
          Sent by SMS from Airtel with your personal link. {names.length > 1 ? "Each friend gets their own message." : ""}
        </p>
      </ScreenBody>
      <ScreenFooter className="bg-white">
        <Button size="lg" block onClick={send} disabled={!ready || phase !== "compose" || !online} loading={phase === "sealing" || phase === "flying"} data-testid="confirm-send">
          <Send /> {recipients.length === 1 ? `Send invite to ${first(friend.name)}` : `Send ${recipients.length} invites`}
        </Button>
        <button
          onClick={() => navigate("a_preview", { mode: "manual", channel: "whatsapp", name: friend.name })}
          disabled={phase !== "compose"}
          className="mt-2 flex w-full items-center justify-center gap-1.5 py-1.5 text-[13.5px] font-semibold text-airtel-ink"
        >
          <img src={iconWhatsapp} alt="" className="size-4" /> Share on WhatsApp instead
        </button>
        {!online && <p className="text-center text-[12px] text-airtel-error">You're offline. Connect to send your invite.</p>}
      </ScreenFooter>
    </Screen>
  );
}

/* ═════════════════════════ Share creative (WhatsApp / SMS / any) ═════════════════════════ */

type Channel = "whatsapp" | "sms" | "any";

function ShareScreen({ channel }: { channel: Channel }) {
  const rules = useProto((s) => s.rules);
  const scenario = useProto((s) => s.scenario);
  const navigate = useProto((s) => s.navigate);
  const top = useProto((s) => s.nav[s.journey][s.nav[s.journey].length - 1]);
  const [theme, setTheme] = useState<CreativeTheme>("red");
  const [friendName, setFriendName] = useState(top.params?.name ?? "");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<null | "whatsapp" | "sms" | "link">(null);
  const [waMissing, setWaMissing] = useState(false);
  const [smsFail, setSmsFail] = useState(false);
  const [width, setWidth] = useState(260);

  useEffect(() => setWidth(Math.min(270, (document.querySelector("[data-share-body]") as HTMLElement)?.clientWidth * 0.72 || 260)), []);

  const data: CreativeData = useMemo(
    () => ({
      theme,
      friendName,
      referrerName: REFERRER.first,
      note,
      friendReward: rules.friendReward,
      dataBenefit: rules.friendDataBenefit,
      minTransaction: rules.minTransaction,
      link: PERSONAL_LINK,
    }),
    [theme, friendName, note, rules],
  );
  const text = inviteText(data);
  const fileName = "referral-invite.png";

  const makeFile = async () => new File([await renderCreativePng(data)], fileName, { type: "image/png" });

  const shareWhatsApp = async () => {
    haptic(8);
    if (scenario.share === "whatsapp_missing") return setWaMissing(true);
    setBusy(true);
    try {
      const file = await makeFile();
      const res = await nativeShare({ title: "Join me on Airtel", text, file });
      if (res === "shared") return setConfirm("whatsapp");
      if (res === "cancelled") return;
      if (openWhatsApp(text) === "unsupported") {
        toast.error("Couldn't open WhatsApp", { description: "Allow pop-ups, or copy the message instead." });
        return;
      }
      setConfirm("whatsapp");
    } finally {
      setBusy(false);
    }
  };

  const shareSms = () => {
    haptic(8);
    if (scenario.share === "sms_fail") return setSmsFail(true);
    if (openSms(text) === "unsupported") {
      setSmsFail(true);
      return;
    }
    setConfirm("sms");
  };

  const shareAny = async () => {
    haptic(8);
    setBusy(true);
    try {
      const res = await nativeShare({ title: "Join me on Airtel", text, file: await makeFile() });
      if (res === "shared") return setConfirm("link");
      if (res === "unsupported") {
        await copyText();
        toast("Sharing isn't available here", { description: "We copied your message instead — paste it in any app." });
      }
    } finally {
      setBusy(false);
    }
  };

  const copyText = async () => {
    try {
      await navigator.clipboard?.writeText(text);
    } catch {
      /* blocked in some embeds — still show the text */
    }
    toast.success("Message copied", { description: "Paste it in any chat." });
  };

  const saveImage = async () => {
    setBusy(true);
    try {
      downloadBlob(await renderCreativePng(data), fileName);
      toast.success("Image saved", { description: "Attach it when you share your link." });
    } catch {
      toast.error("Couldn't create the image", { description: "Try again, or share the message on its own." });
    } finally {
      setBusy(false);
    }
  };

  const track = () => {
    const ch = confirm === "sms" ? "sms" : confirm === "whatsapp" ? "whatsapp" : "link";
    const [id] = useProto.getState().createInvites(["c_link"], ch);
    if (friendName.trim())
      useProto.setState((s) => ({ referrals: s.referrals.map((r) => (r.id === id ? { ...r, name: friendName.trim() } : r)) }));
    setConfirm(null);
    toast.success("Invite added to My referrals");
    useProto.getState().resetTo("a_dashboard");
  };

  const title = channel === "whatsapp" ? "Share on WhatsApp" : channel === "sms" ? "Share by SMS" : "Share your invite";

  return (
    <Screen className="bg-airtel-surface">
      <AppBar title={title} className="bg-airtel-surface" />
      <ScreenBody className="px-5 pb-6">
        <div data-share-body className="flex justify-center pt-1">
          <AnimatePresence mode="popLayout">
            <motion.div key={theme} initial={{ opacity: 0.4, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.25 }} className="rounded-[18px] shadow-lift">
              <CreativePreview d={data} width={width} />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-5 rounded-[18px] bg-white p-4">
          <p className="flex items-center gap-1.5 text-[13px] font-bold text-airtel-ink">
            <Pencil className="size-3.5" /> Personalise
          </p>
          <div className="mt-3 flex gap-2.5" role="radiogroup" aria-label="Style">
            {(Object.keys(THEMES) as CreativeTheme[]).map((k) => (
              <button
                key={k}
                role="radio"
                aria-checked={theme === k}
                onClick={() => setTheme(k)}
                className={cn("flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-[12.5px] font-semibold", theme === k ? "border-airtel-ink" : "border-gen4-bg-100")}
              >
                <span className="size-6 rounded-full border border-black/10" style={{ background: THEMES[k].swatch }} />
                {THEMES[k].label}
              </button>
            ))}
          </div>
          <label className="mt-3 block text-[12px] font-semibold text-airtel-sub">
            Friend's name (optional)
            <Input value={friendName} onChange={(e) => setFriendName(e.target.value.slice(0, 30))} placeholder="e.g. Priya" className="mt-1" />
          </label>
          <label className="mt-3 block text-[12px] font-semibold text-airtel-sub">
            Personal note (optional)
            <Input value={note} onChange={(e) => setNote(e.target.value.slice(0, 60))} placeholder="e.g. This app makes recharges easy" className="mt-1" />
          </label>
        </div>

        <div className="mt-4 rounded-[18px] bg-white p-4">
          <p className="text-[13px] font-bold text-airtel-ink">Message</p>
          <p className="mt-1.5 rounded-[14px] rounded-tl-[4px] bg-[#E7FFDB] px-3 py-2.5 text-[13px] leading-[19px] text-[#1B2B1B]" data-testid="share-text">
            {text}
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <SmallAction icon={<Copy className="size-4" />} label="Copy link" onClick={() => void copyInviteLink()} />
            <SmallAction icon={<Download className="size-4" />} label="Save image" onClick={() => void saveImage()} />
            <SmallAction icon={<Share2 className="size-4" />} label="More apps" onClick={() => void shareAny()} />
          </div>
        </div>
      </ScreenBody>
      <ScreenFooter>
        {channel === "sms" ? (
          <Button size="lg" block onClick={shareSms} data-testid="share-primary">
            <MessageSquareText /> Open Messages
          </Button>
        ) : channel === "whatsapp" ? (
          <Button size="lg" block onClick={() => void shareWhatsApp()} loading={busy} className="bg-[#1DAA61] hover:bg-[#188F52]" data-testid="share-primary">
            <img src={iconWhatsapp} alt="" className="size-5 brightness-0 invert" /> Share on WhatsApp
          </Button>
        ) : (
          <Button size="lg" block onClick={() => void shareAny()} loading={busy} data-testid="share-primary">
            <Share2 /> Share invite
          </Button>
        )}
        <p className="mt-2 text-center text-[11.5px] text-airtel-sub">Opens {channel === "sms" ? "Messages" : channel === "whatsapp" ? "WhatsApp" : "your share sheet"} with your message. You choose who to send it to.</p>
      </ScreenFooter>

      {/* Honest hand-off: we can't see what happens in another app */}
      <Sheet open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Did you send your invite?</SheetTitle>
            <SheetDescription>
              We can't see messages sent in {confirm === "sms" ? "Messages" : confirm === "whatsapp" ? "WhatsApp" : "other apps"}. Let us know so we can track this invite for you.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-2 px-5 pb-8 pt-4">
            <Button block size="lg" onClick={track} data-testid="confirm-shared">
              Yes, I sent it
            </Button>
            <Button block size="lg" variant="outline" onClick={() => setConfirm(null)}>
              Not yet
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={waMissing} onOpenChange={setWaMissing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>WhatsApp isn't available</DialogTitle>
            <DialogDescription>We couldn't find WhatsApp on this phone. Share by SMS instead, or copy your message.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button block onClick={() => { setWaMissing(false); navigate("a_preview", { mode: "manual", channel: "sms", name: friendName }); }}>
              Share by SMS
            </Button>
            <Button block variant="outline" onClick={() => { setWaMissing(false); void copyText(); }}>
              Copy message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={smsFail} onOpenChange={setSmsFail}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Couldn't open Messages</DialogTitle>
            <DialogDescription>This device can't open the SMS app. Copy your message and paste it into any chat instead.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button block onClick={() => { setSmsFail(false); void copyText(); }}>
              Copy message
            </Button>
            <Button block variant="outline" onClick={() => { setSmsFail(false); void shareAny(); }}>
              Share another way
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Screen>
  );
}

function SmallAction({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 rounded-[12px] bg-airtel-surface py-2.5 text-[11.5px] font-semibold text-airtel-ink active:scale-95">
      {icon}
      {label}
    </button>
  );
}
