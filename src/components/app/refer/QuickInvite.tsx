import { forwardRef, useEffect, useState, type ReactNode } from "react";
import { Check, Copy, UserPlus } from "lucide-react";
import { copyInviteLink } from "@/components/app/InviteKit";
import { MessagesIcon, ShareIcon, WhatsAppIcon } from "@/components/app/refer/ShareIcons";
import { Button } from "@/components/ui/button";
import { PERSONAL_LINK } from "@/domain/data";

type Channel = "whatsapp" | "sms" | "more";

/** Gen4 Quick Action Button: 48px circle, 24px icon, Regular 12/18 label, 72px column. */
function QuickAction({ label, icon, color, onClick }: { label: string; icon: ReactNode; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-[72px] flex-col items-center gap-1 active:opacity-70">
      <span className="flex size-12 items-center justify-center rounded-full bg-[#E6E9EF] [&_svg]:size-6" style={{ color }}>
        {icon}
      </span>
      <span className="w-full truncate text-center text-[12px] leading-[18px] text-[#292C31]">{label}</span>
    </button>
  );
}

/** Primary invite CTA, followed by a Gen4 four-action QAB card for sharing the personal link. */
export const QuickInvite = forwardRef<HTMLDivElement, { onInvite: (source: string) => void; onShare: (channel: Channel) => void }>(
  ({ onInvite, onShare }, ctaRef) => {
    const [copied, setCopied] = useState(false);
    useEffect(() => {
      if (!copied) return;
      const t = setTimeout(() => setCopied(false), 2200);
      return () => clearTimeout(t);
    }, [copied]);

    return (
      <div className="space-y-3">
        <div ref={ctaRef}>
          <Button block className="hover:border-black hover:bg-black" onClick={() => onInvite("sheet_cta")}>
            <UserPlus /> Invite Friends
          </Button>
        </div>
        <section aria-labelledby="share-title" className="rounded-[16px] border border-[#E6E9EF] bg-[linear-gradient(180deg,#FFFFFF,#F5F5F5)] p-4">
          <h2 id="share-title" className="text-[12px] font-bold uppercase leading-[14px] text-[#696B6F]">
            Share your link
          </h2>
          <p className="mt-1 truncate text-[12px] leading-[18px] text-[#696B6F]">{PERSONAL_LINK}</p>
          <div className="mt-3 flex justify-between">
            <QuickAction
              label={copied ? "Copied" : "Copy link"}
              color={copied ? "#0F7033" : "#292C31"}
              icon={copied ? <Check strokeWidth={2.5} /> : <Copy />}
              onClick={async () => setCopied(await copyInviteLink(PERSONAL_LINK))}
            />
            <QuickAction label="WhatsApp" color="#25D366" icon={<WhatsAppIcon />} onClick={() => onShare("whatsapp")} />
            <QuickAction label="SMS" color="#1A73E8" icon={<MessagesIcon />} onClick={() => onShare("sms")} />
            <QuickAction label="More" color="#292C31" icon={<ShareIcon />} onClick={() => onShare("more")} />
          </div>
        </section>
      </div>
    );
  },
);
QuickInvite.displayName = "QuickInvite";
