import { forwardRef, useEffect, useState } from "react";
import { Check, Copy, UserPlus } from "lucide-react";
import { copyInviteLink } from "@/components/app/InviteKit";
import { PERSONAL_LINK } from "@/domain/data";
import { MessagesIcon, ShareIcon, WhatsAppIcon } from "@/components/app/refer/ShareIcons";
import { Button } from "@/components/ui/button";

type Channel = "whatsapp" | "sms" | "more";

const CHANNELS: { id: Channel; label: string; color: string; Icon: typeof WhatsAppIcon }[] = [
  { id: "whatsapp", label: "Share on WhatsApp", color: "#25D366", Icon: WhatsAppIcon },
  { id: "sms", label: "Share by SMS", color: "#1A73E8", Icon: MessagesIcon },
  { id: "more", label: "More ways to share", color: "#292C31", Icon: ShareIcon },
];

/** Primary invite action, with the personal link and share targets in one quiet row. */
export const QuickInvite = forwardRef<HTMLDivElement, { onInvite: (source: string) => void; onShare: (channel: Channel) => void }>(
  ({ onInvite, onShare }, ctaRef) => {
    const [copied, setCopied] = useState(false);
    useEffect(() => {
      if (!copied) return;
      const t = setTimeout(() => setCopied(false), 2200);
      return () => clearTimeout(t);
    }, [copied]);

    return (
      <div>
        <div ref={ctaRef}>
          <Button size="lg" block className="hover:border-black hover:bg-black" onClick={() => onInvite("sheet_cta")}>
            <UserPlus /> Invite Friends
          </Button>
        </div>
        <div className="mt-3 flex items-center gap-1.5">
          <div className="flex h-10 min-w-0 flex-1 items-center rounded-full bg-[#F4F5F7] pl-3.5 pr-1">
            <span className="min-w-0 flex-1 select-all truncate text-[13px] font-semibold text-[#292C31]">{PERSONAL_LINK}</span>
            <button
              onClick={async () => setCopied(await copyInviteLink(PERSONAL_LINK))}
              className="flex size-8 shrink-0 items-center justify-center rounded-full text-[#5C5F66] active:bg-black/5"
              aria-label={copied ? "Link copied." : "Copy link"}
            >
              {copied ? <Check className="size-4 text-[#0F7033]" strokeWidth={3} /> : <Copy className="size-4" />}
            </button>
          </div>
          {CHANNELS.map(({ id, label, color, Icon }) => (
            <button
              key={id}
              onClick={() => onShare(id)}
              aria-label={label}
              className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-[#F4F5F7] after:absolute after:-inset-0.5 active:bg-[#E9EAED]"
              style={{ color }}
            >
              <Icon className="size-[21px]" />
            </button>
          ))}
        </div>
      </div>
    );
  },
);
QuickInvite.displayName = "QuickInvite";
