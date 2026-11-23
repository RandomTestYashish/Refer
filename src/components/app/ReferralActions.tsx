import { toast } from "sonner";
import { BellRing, Check, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Referral } from "@/domain/types";
import { activeLink, useProto } from "@/store/useProto";

/** A link shared to an app has no known recipient, so it can't be reminded or resent to a person. */
export const isLinkShare = (r: Referral) => r.contactId === "c_link";
export const referralTitle = (r: Referral) =>
  isLinkShare(r) ? `Link shared ${r.channel === "whatsapp" ? "on WhatsApp" : r.channel === "sms" ? "by SMS" : "on another app"}` : r.name;
export const referralFirstName = (r: Referral) => (isLinkShare(r) ? "Your friend" : r.name.split(" ")[0]);

export const canResend = (r: Referral) => r.status === "expired" && r.reason === "link_expired" && !isLinkShare(r);
export const canRemind = (r: Referral) =>
  !isLinkShare(r) && ["invited", "link_opened", "accepted", "pending_recharge"].includes(r.status) && activeLink(r).state === "active";
/** One reminder per friend per day, so people aren't spammed. */
export const remindedToday = (r: Referral) => r.events.some((e) => e.kind === "reminder" && Date.now() - e.at < 86_400_000);

/** Resend (new link, history kept) or Remind (same link) — whichever applies. */
export function ReferralAction({ r, size = "sm", block }: { r: Referral; size?: "sm" | "default" | "lg"; block?: boolean }) {
  const resend = useProto((s) => s.resend);
  const remind = useProto((s) => s.remind);
  if (canResend(r))
    return (
      <Button
        size={size}
        block={block}
        variant="soft"
        onClick={(e) => {
          e.stopPropagation();
          resend(r.id);
          toast.success(`New invite sent to ${r.name.split(" ")[0]}.`, { description: "A fresh link was generated. Earlier history is kept." });
        }}
      >
        <RotateCw /> Resend
      </Button>
    );
  if (canRemind(r) && remindedToday(r))
    return (
      <Button size={size} block={block} variant="outline" disabled>
        <Check /> Reminded
      </Button>
    );
  if (canRemind(r))
    return (
      <Button
        size={size}
        block={block}
        variant="outline"
        onClick={(e) => {
          e.stopPropagation();
          remind(r.id);
          toast.success(`Reminder sent to ${r.name.split(" ")[0]}.`);
        }}
      >
        <BellRing /> Remind
      </Button>
    );
  return null;
}
