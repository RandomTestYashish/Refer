import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Check, Copy, Gift, MessageCircle, MessageSquareText, Share2 } from "lucide-react";
import { ContactAvatar } from "@/components/app/primitives";
import { IconAction } from "@/components/app/gen4";
import { CONTACTS, PERSONAL_LINK } from "@/domain/data";
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
    toast.error("Couldn't copy the link.", { description: "Long-press the link to copy it manually, or share it another way." });
    return false;
  }
  try {
    await navigator.clipboard?.writeText(`https://${link}`);
  } catch {
    /* clipboard may be blocked in embedded previews — treat as simulated success */
  }
  toast.success("Link copied.", { description: "Paste it in any chat to invite friends." });
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
    <div className={cn("flex h-12 items-center gap-2 rounded-[12px] border border-[#E6E9EF] bg-[linear-gradient(180deg,#FFFFFF,#F5F5F5)] pl-3.5 pr-1.5", className)}>
      <span className="min-w-0 flex-1 select-all truncate text-[14px] font-semibold text-airtel-ink">{link}</span>
      <motion.button
        whileTap={{ scale: 0.94 }}
        onClick={async () => setCopied(await copyInviteLink(link))}
        className={cn(
          "flex h-9 min-w-[84px] items-center justify-center gap-1.5 rounded-[10px] px-3 text-[13px] font-medium transition-colors",
          copied ? "bg-[#0F7033] text-white" : "bg-black text-white",
        )}
        aria-label={copied ? "Link copied." : "Copy link"}
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

/** Row of share targets, drawn as Home "Icon-action" circles. */
export function ShareRow({ onShare }: { onShare: (channel: "whatsapp" | "sms" | "more") => void }) {
  return (
    <div className="flex justify-around">
      <IconAction label="WhatsApp" icon={<MessageCircle />} tint="#1DA851" onClick={() => onShare("whatsapp")} />
      <IconAction label="SMS" icon={<MessageSquareText />} tint="#075EE8" onClick={() => onShare("sms")} />
      <IconAction label="More" icon={<Share2 />} onClick={() => onShare("more")} />
    </div>
  );
}
