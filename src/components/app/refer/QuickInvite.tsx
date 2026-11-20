import { forwardRef } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BusinessRules } from "@/config/businessRules";

/** "Who will you invite?" — the primary invite card. Opens the contact picker. */
export const QuickInvite = forwardRef<HTMLDivElement, { rules: BusinessRules; onInvite: (source: string) => void; onMore?: () => void }>(
  ({ rules, onInvite }, ctaRef) => (
    <section aria-labelledby="invite-title" className="rounded-[20px] border border-[#E6E9EF] bg-[linear-gradient(180deg,#FFFFFF,#F7F7F7)] p-4 shadow-[0_4px_14px_rgba(41,44,49,0.05)]">
      <h2 id="invite-title" className="text-[18px] font-extrabold leading-6 text-[#292C31]">
        Who will you invite?
      </h2>
      <p className="mt-0.5 text-[13px] text-[#5C5F66]">
        Invite friends who are new to Airtel. Up to {rules.referralCapMonth} rewarded referrals a month.
      </p>
      <div ref={ctaRef} className="mt-4">
        <Button size="lg" block onClick={() => onInvite("sheet_cta")}>
          <UserPlus /> Invite Friends
        </Button>
      </div>
    </section>
  ),
);
QuickInvite.displayName = "QuickInvite";
