import { forwardRef } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BusinessRules } from "@/config/businessRules";
import { home } from "@/assets/home";

/** "Who will you invite?" — the primary invite card. Opens the contact picker. */
export const QuickInvite = forwardRef<HTMLDivElement, { rules: BusinessRules; onInvite: (source: string) => void; onMore?: () => void }>(
  ({ rules, onInvite }, ctaRef) => (
    <section aria-labelledby="invite-title" className="overflow-hidden rounded-[20px] border border-[#F6DCCB] bg-white shadow-[0_4px_14px_rgba(194,65,12,0.06)]">
      {/* illustration: paper plane invite flying to friends */}
      <div className="relative h-[132px] bg-[linear-gradient(180deg,#FFF3EA,#FFFFFF)]">
        <img src={home("invite-ill.jpg")} alt="" className="absolute inset-0 size-full object-contain mix-blend-multiply [filter:brightness(1.06)_contrast(1.04)]" draggable={false} />
      </div>
      <div className="px-4 pb-4">
        <h2 id="invite-title" className="text-[18px] font-extrabold leading-6 text-[#292C31]">
          Who will you invite?
        </h2>
        <p className="mt-0.5 text-[13px] text-[#5C5F66]">Invite friends who are new to Airtel. Up to {rules.referralCapMonth} rewarded referrals a month.</p>
        <div ref={ctaRef} className="mt-4">
          <Button size="lg" block className="border-0 bg-[linear-gradient(180deg,#FF7A2F,#E2471B)] hover:bg-[#E2471B]" onClick={() => onInvite("sheet_cta")}>
            <UserPlus /> Invite Friends
          </Button>
        </div>
      </div>
    </section>
  ),
);
QuickInvite.displayName = "QuickInvite";
