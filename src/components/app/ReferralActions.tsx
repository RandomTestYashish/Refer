import { toast } from "sonner";
import { BellRing, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Referral } from "@/domain/types";
import { activeLink, useProto } from "@/store/useProto";

export const canResend = (r: Referral) => r.status === "expired" && r.reason === "link_expired";
export const canRemind = (r: Referral) =>
  ["invited", "link_opened", "accepted", "pending_recharge"].includes(r.status) && activeLink(r).state === "active";

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
