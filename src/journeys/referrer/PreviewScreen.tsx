import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import { Copy, Mail, MessageCircle, MessageSquareText, RotateCcw, Send, Share2 } from "lucide-react";
import { AppBar, AirtelMark, ContactAvatar, Screen, ScreenFooter, SimNote } from "@/components/app/primitives";
import { IconAction } from "@/components/app/gen4";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { home } from "@/assets/home";
import { CONTACTS, REFERRER } from "@/domain/data";
import { useProto } from "@/store/useProto";
import { inr } from "@/lib/utils";

export const INVITE_MESSAGE = "Your friend is inviting you to Airtel. Join now and get cashback + bonus data on your first recharge or bill payment.";

/**
 * A06 — Invitation ready.
 * Replaces the old static "Preview invitation" with an envelope moment (inspired by Airbnb's
 * referral flow): the invite card is shown, slides into an envelope, the flap closes, an Airtel
 * seal stamps on, then the share sheet opens.
 */

type Phase = 0 | 1 | 2 | 3 | 4; // 0 creating · 1 card · 2 into envelope · 3 sealed · 4 ready (sheet)

const ENV_W = 260;
const ENV_H = 168;

function InviteCard({ rules }: { rules: { referrerReward: number; friendReward: number; friendDataGB: number } }) {
  return (
    <div className="w-[236px] overflow-hidden rounded-[20px] bg-white shadow-[0_18px_40px_rgba(120,20,30,0.22)]">
      <div className="relative h-[178px] overflow-hidden bg-[linear-gradient(160deg,#FF5A5F_0%,#E32121_55%,#B3001F_100%)] px-4 pt-4 text-white">
        <span className="absolute -right-10 -top-10 size-36 rounded-full border-[16px] border-white/10" />
        <div className="relative flex items-center gap-1.5">
          <AirtelMark white className="size-6" />
          <span className="text-[14px] font-extrabold tracking-[-0.03em]">airtel</span>
        </div>
        <p className="relative mt-2.5 text-[17px] font-bold leading-[21px]">
          {REFERRER.first} invited you
          <br />
          to Airtel
        </p>
        <img src={home("tile-refer.png")} alt="" className="absolute -bottom-2 right-[-6px] h-[84px] w-[140px] object-contain drop-shadow-[0_8px_10px_rgba(0,0,0,0.25)]" />
      </div>
      <div className="px-4 pb-4 pt-3">
        <p className="text-[11px] font-bold uppercase tracking-[1.5px] text-[#696B6F]">You get</p>
        <p className="text-[24px] font-bold leading-7 text-[#292C31]">
          {inr(rules.friendReward)} <span className="text-[16px] font-semibold text-[#3E4146]">+ {rules.friendDataGB} GB</span>
        </p>
        <p className="mt-0.5 text-[11px] leading-[14px] text-[#696B6F]">On your first recharge or bill payment</p>
      </div>
    </div>
  );
}

export function PreviewScreen({ params }: { params?: Record<string, string> }) {
  const manual = params?.mode === "manual";
  const selected = useProto((s) => s.selectedContactIds);
  const scenario = useProto((s) => s.scenario);
  const rules = useProto((s) => s.rules);
  const navigate = useProto((s) => s.navigate);
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>(reduce ? 4 : 0);
  const [run, setRun] = useState(0);
  const [sheet, setSheet] = useState(false);
  const [waMissing, setWaMissing] = useState(false);
  const [copyFail, setCopyFail] = useState(false);
  const [more, setMore] = useState(false);
  const previewCode = useMemo(() => `${REFERRER.first.toUpperCase()}-7K2Q`, []);
  const link = `airtel.in/r/${previewCode}`;
  const recipients = CONTACTS.filter((c) => selected.includes(c.id));
  const ids = manual ? "c_link" : selected.join(",");

  // Choreography (ms): creating → card → into envelope → flap + seal → ready + sheet.
  useEffect(() => {
    if (reduce) {
      setPhase(4);
      const t = setTimeout(() => setSheet(true), 300);
      return () => clearTimeout(t);
    }
    setPhase(0);
    setSheet(false);
    const t = [
      setTimeout(() => setPhase(1), 900),
      setTimeout(() => setPhase(2), 2500),
      setTimeout(() => setPhase(3), 3400),
      setTimeout(() => setPhase(4), 4200),
      setTimeout(() => setSheet(true), 4900),
    ];
    return () => t.forEach(clearTimeout);
  }, [run, reduce]);

  const send = (channel: "sms" | "whatsapp" | "link") => {
    if (!manual && recipients.length === 0) {
      toast.error("No friends selected.", { description: "Go back and pick at least one contact." });
      return;
    }
    if (channel === "whatsapp" && scenario.share === "whatsapp_missing") {
      setSheet(false);
      setWaMissing(true);
      return;
    }
    setSheet(false);
    navigate("a_sending", { ids, channel, n: String(Date.now()) });
  };

  const copy = async () => {
    if (scenario.share === "copy_fail") {
      setSheet(false);
      setCopyFail(true);
      return;
    }
    try {
      await navigator.clipboard?.writeText(`https://${link}`);
    } catch {
      /* clipboard can be blocked in iframes — still a successful simulated copy */
    }
    toast.success("Link copied.", { description: "Paste it in any chat to invite friends." });
  };

  const inEnvelope = phase >= 2;
  const sealed = phase >= 3;

  return (
    <Screen className="bg-white">
      <AppBar transparent />
      <div className="relative flex min-h-0 flex-1 flex-col">
        {/* Title */}
        <div className="h-[72px] px-6 text-center">
          <AnimatePresence mode="wait">
            {phase === 0 ? null : phase < 4 ? (
              <motion.p key="t1" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="text-[24px] font-bold leading-[30px] text-[#222222]">
                {manual ? "Your invite" : `Invite for ${recipients.length} ${recipients.length === 1 ? "friend" : "friends"}`}
              </motion.p>
            ) : (
              <motion.p key="t2" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-[24px] font-bold leading-[30px] text-[#222222]">
                Your invite is ready
                <br />
                to share
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Stage */}
        <div className="relative mx-auto mt-2 h-[430px] w-[343px]">
          {/* Creating… */}
          <AnimatePresence>
            {phase === 0 && (
              <motion.div exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="size-2.5 rounded-full bg-[#292C31]"
                    animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {phase >= 1 && (
            <div className="absolute bottom-[34px] left-1/2 -translate-x-1/2" style={{ width: ENV_W, height: ENV_H }}>
              {/* Envelope back + open flap (behind the card) */}
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: inEnvelope ? 1 : 0, y: inEnvelope ? 0 : 30 }} transition={{ duration: 0.35 }} className="absolute inset-0">
                <div className="absolute inset-0 rounded-[10px] bg-[#F4DCD8]" />
                {!sealed && (
                  <svg viewBox={`0 0 ${ENV_W} 96`} className="absolute bottom-full left-0 h-[96px] w-full" aria-hidden>
                    <path d={`M0 96 L${ENV_W / 2} 6 L${ENV_W} 96 Z`} fill="#F1D3CE" />
                  </svg>
                )}
              </motion.div>

              {/* The invite card — clipped at the envelope's bottom edge */}
              <div className="absolute bottom-0 left-1/2 flex h-[600px] w-[300px] -translate-x-1/2 justify-center overflow-hidden">
                <motion.div
                  className="absolute"
                  initial={{ y: 640, opacity: 0 }}
                  animate={
                    phase === 1
                      ? { y: 250, scale: 1, opacity: 1 }
                      : sealed
                        ? { y: 440, scale: 0.86, opacity: 0 }
                        : { y: 440, scale: 0.86, opacity: 1 }
                  }
                  transition={phase === 1 ? { type: "spring", stiffness: 120, damping: 16 } : sealed ? { duration: 0.25, delay: 0.2 } : { duration: 0.75, ease: [0.65, 0, 0.35, 1] }}
                  style={{ top: 0 }}
                >
                  <InviteCard rules={rules} />
                </motion.div>
              </div>

              {/* Front pocket (over the card) */}
              <motion.svg
                viewBox={`0 0 ${ENV_W} ${ENV_H}`}
                className="absolute inset-0 size-full drop-shadow-[0_18px_26px_rgba(120,40,40,0.16)]"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: inEnvelope ? 1 : 0, y: inEnvelope ? 0 : 30 }}
                transition={{ duration: 0.35 }}
                aria-hidden
              >
                <path d={`M0 30 L${ENV_W / 2} 104 L${ENV_W} 30 V${ENV_H - 10} Q${ENV_W} ${ENV_H} ${ENV_W - 10} ${ENV_H} H10 Q0 ${ENV_H} 0 ${ENV_H - 10} Z`} fill="#FCEDEA" />
                <path d={`M0 ${ENV_H - 10} L${ENV_W / 2} 92 L${ENV_W} ${ENV_H - 10}`} fill="none" stroke="#F1D3CE" strokeWidth="1.5" />
              </motion.svg>

              {/* Closing flap (over everything) */}
              <AnimatePresence>
                {sealed && (
                  <motion.svg
                    viewBox={`0 0 ${ENV_W} 110`}
                    className="absolute left-0 top-0 h-[110px] w-full"
                    style={{ transformOrigin: "50% 0%" }}
                    initial={{ scaleY: -0.9 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.45, ease: [0.34, 1.3, 0.64, 1] }}
                    aria-hidden
                  >
                    <path d={`M0 0 H${ENV_W} L${ENV_W / 2 + 12} 100 Q${ENV_W / 2} 110 ${ENV_W / 2 - 12} 100 Z`} fill="#F8E3DF" />
                  </motion.svg>
                )}
              </AnimatePresence>

              {/* Airtel seal */}
              <AnimatePresence>
                {sealed && (
                  <motion.div
                    className="absolute inset-x-0 top-[74px] flex justify-center"
                    initial={{ scale: 2.2, opacity: 0, rotate: -20 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{ delay: 0.35, type: "spring", stiffness: 420, damping: 18 }}
                  >
                    <span className="flex size-[52px] items-center justify-center rounded-full bg-[linear-gradient(180deg,#FC5252,#E32121)] shadow-[0_6px_14px_rgba(227,33,33,0.4)] ring-4 ring-white/70">
                      <AirtelMark white className="size-7" />
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Recipients (contacts mode) */}
          {!manual && phase >= 4 && recipients.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-x-0 bottom-0 flex justify-center -space-x-2">
              {recipients.slice(0, 5).map((c) => (
                <ContactAvatar key={c.id} name={c.name} hue={c.hue} size={30} className="ring-2 ring-white" />
              ))}
            </motion.div>
          )}
        </div>
      </div>

      <ScreenFooter className="border-0 bg-white">
        <div className="flex gap-3">
          <Button size="lg" variant="outline" className="w-14 shrink-0 px-0" onClick={() => setRun((r) => r + 1)} aria-label="Replay animation" disabled={phase < 4}>
            <RotateCcw />
          </Button>
          <Button size="lg" className="flex-1" onClick={() => setSheet(true)} disabled={phase < 4}>
            <Share2 /> Share Invite
          </Button>
        </div>
        <SimNote className="mt-2">No real messages are sent</SimNote>
      </ScreenFooter>

      {/* Share sheet */}
      <Sheet open={sheet} onOpenChange={setSheet}>
        <SheetContent>
          <SheetHeader className="pt-5">
            <SheetTitle className="sr-only">Share invitation</SheetTitle>
            <SheetDescription className="sr-only">Choose how to send your invite</SheetDescription>
            <div className="flex items-center gap-3 rounded-[14px] bg-[#F0F4F9] p-2.5">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-[10px] bg-[linear-gradient(160deg,#FF5A5F,#E32121)]">
                <AirtelMark white className="size-6" />
              </span>
              <div className="min-w-0 text-left">
                <p className="truncate text-[13px] font-bold text-[#292C31]">
                  Here's {inr(rules.friendReward)} cashback + {rules.friendDataGB} GB on Airtel
                </p>
                <p className="truncate text-[12px] text-[#696B6F]">{link}</p>
              </div>
            </div>
          </SheetHeader>
          {!manual && recipients.length > 0 && (
            <p className="px-5 pt-3 text-[12px] text-[#696B6F]">
              Sending to <b className="text-[#292C31]">{recipients.map((r) => r.name.split(" ")[0]).join(", ")}</b>
            </p>
          )}
          <div className="flex justify-between px-5 pb-[34px] pt-5">
            <IconAction label="WhatsApp" icon={<MessageCircle />} tint="#1DA851" onClick={() => send("whatsapp")} />
            <IconAction label="SMS" icon={<MessageSquareText />} tint="#075EE8" onClick={() => send("sms")} />
            <IconAction label="Copy Link" icon={<Copy />} onClick={() => void copy()} />
            <IconAction
              label="More"
              icon={<Share2 />}
              onClick={() => {
                setSheet(false);
                setMore(true);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>

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
            <Button
              block
              onClick={() => {
                setWaMissing(false);
                navigate("a_sending", { ids, channel: "sms", n: String(Date.now()) });
              }}
            >
              Send Via SMS
            </Button>
            <Button
              block
              variant="outline"
              onClick={() => {
                setWaMissing(false);
                void copy();
              }}
            >
              Copy Link
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
                  toast.success("Link copied.");
                }
              }}
            >
              Try Again
            </Button>
            <Button
              block
              variant="outline"
              onClick={() => {
                setCopyFail(false);
                setMore(true);
              }}
            >
              <Share2 /> Share Another Way
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
              <button
                key={l}
                className="flex flex-col items-center gap-1.5"
                onClick={() => {
                  setMore(false);
                  send(ch);
                }}
              >
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
