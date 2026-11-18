import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import QRCode from "qrcode";
import { Check, Copy, Gift, MessageCircle, MessageSquareText, QrCode, Share2 } from "lucide-react";
import { ContactAvatar } from "@/components/app/primitives";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { CONTACTS, PERSONAL_CODE, PERSONAL_LINK } from "@/domain/data";
import { useProto } from "@/store/useProto";
import { cn } from "@/lib/utils";

/** Overlapping friend avatars with a gift badge (hero motif). */
export function AvatarStack({ size = 64 }: { size?: number }) {
  const people = [CONTACTS[1], CONTACTS[0], CONTACTS[3]];
  return (
    <div className="relative inline-flex items-center" style={{ height: size }}>
      {people.map((c, i) => (
        <motion.div
          key={c.id}
          initial={{ x: -12 * (i + 1), opacity: 0, scale: 0.8 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          transition={{ delay: 0.08 * i, type: "spring", stiffness: 260, damping: 20 }}
          className="rounded-full ring-4 ring-white"
          style={{ marginLeft: i === 0 ? 0 : -size * 0.28, zIndex: 3 - i }}
        >
          <ContactAvatar name={c.name} hue={c.hue} size={size} />
        </motion.div>
      ))}
      <motion.span
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.35, type: "spring", stiffness: 300, damping: 14 }}
        className="absolute -right-2 -top-1 z-10 flex size-8 items-center justify-center rounded-full bg-airtel-red text-white shadow-red ring-[3px] ring-white"
      >
        <Gift className="size-4" />
      </motion.span>
    </div>
  );
}

/** Copy the personal link, honouring the "Copy fails" developer scenario. Returns success. */
export async function copyInviteLink(link = PERSONAL_LINK): Promise<boolean> {
  if (useProto.getState().scenario.share === "copy_fail") {
    toast.error("Couldn't copy the link", { description: "Long-press the link to copy it manually, or share it another way." });
    return false;
  }
  try {
    await navigator.clipboard?.writeText(`https://${link}`);
  } catch {
    /* clipboard may be blocked in embedded previews — treat as simulated success */
  }
  toast.success("Link copied", { description: "Paste it in any chat to invite friends." });
  return true;
}

/** Link field with inline Copy → Copied state. */
export function ReferralLinkField({ link = PERSONAL_LINK, className }: { link?: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2200);
    return () => clearTimeout(t);
  }, [copied]);
  return (
    <div className={cn("flex h-12 items-center gap-2 rounded-[14px] border border-dashed border-airtel-red/35 bg-airtel-red-soft/40 pl-3.5 pr-1.5", className)}>
      <span className="min-w-0 flex-1 select-all truncate text-[14px] font-semibold text-airtel-ink">{link}</span>
      <motion.button
        whileTap={{ scale: 0.94 }}
        onClick={async () => setCopied(await copyInviteLink(link))}
        className={cn(
          "flex h-9 min-w-[84px] items-center justify-center gap-1.5 rounded-[10px] px-3 text-[13px] font-bold transition-colors",
          copied ? "bg-airtel-success text-white" : "bg-airtel-ink text-white",
        )}
        aria-label={copied ? "Link copied" : "Copy link"}
      >
        <AnimatePresence mode="wait" initial={false}>
          {copied ? (
            <motion.span key="ok" initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -6, opacity: 0 }} className="flex items-center gap-1">
              <Check className="size-4" strokeWidth={3} /> Copied
            </motion.span>
          ) : (
            <motion.span key="cp" initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -6, opacity: 0 }} className="flex items-center gap-1">
              <Copy className="size-4" /> Copy
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}

/** Row of round share targets. */
export function ShareRow({ onShare, onQr }: { onShare: (channel: "whatsapp" | "sms" | "more") => void; onQr: () => void }) {
  const items = [
    { label: "WhatsApp", icon: MessageCircle, bg: "#25D366", on: () => onShare("whatsapp") },
    { label: "SMS", icon: MessageSquareText, bg: "#0A7AFF", on: () => onShare("sms") },
    { label: "QR code", icon: QrCode, bg: "#171717", on: onQr },
    { label: "More", icon: Share2, bg: "#8E8E93", on: () => onShare("more") },
  ];
  return (
    <div className="grid grid-cols-4">
      {items.map(({ label, icon: Icon, bg, on }) => (
        <button key={label} onClick={on} className="flex flex-col items-center gap-1.5 active:scale-95">
          <span className="flex size-[52px] items-center justify-center rounded-full text-white shadow-sm" style={{ background: bg }}>
            <Icon className="size-[22px]" />
          </span>
          <span className="text-[11.5px] font-semibold text-airtel-ink">{label}</span>
        </button>
      ))}
    </div>
  );
}

/** In-person invite: QR code of the personal link. */
export function QrInviteSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [svg, setSvg] = useState("");
  const rules = useProto((s) => s.rules);
  useEffect(() => {
    QRCode.toString(`https://${PERSONAL_LINK}`, { type: "svg", margin: 0, color: { dark: "#171717", light: "#ffffff" }, errorCorrectionLevel: "M" })
      .then(setSvg)
      .catch(() => setSvg(""));
  }, []);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader className="items-center pt-5 text-center">
          <SheetTitle className="text-center">Scan to join Airtel</SheetTitle>
          <SheetDescription className="text-center">Your friend scans this with their camera. You both get ₹{rules.friendReward} after their first eligible recharge.</SheetDescription>
        </SheetHeader>
        <div className="mx-auto mt-5 rounded-[22px] border border-airtel-line bg-white p-5 shadow-card">
          {svg ? <div className="size-[188px] [&_svg]:h-full [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} /> : <div className="size-[188px] animate-pulse rounded-[10px] bg-airtel-surface" />}
        </div>
        <p className="mt-3 text-center text-[13px] font-semibold tracking-[0.12em] text-airtel-sub">{PERSONAL_CODE}</p>
        <div className="px-5 pb-[34px] pt-5">
          <Button size="lg" block variant="outline" onClick={() => void copyInviteLink()}>
            <Copy /> Copy link instead
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
