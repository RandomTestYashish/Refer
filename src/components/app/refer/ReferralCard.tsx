import { motion } from "framer-motion";
import { Link2, Lock } from "lucide-react";
import { CARD } from "@/components/app/gen4";
import { ContactAvatar } from "@/components/app/primitives";
import { isLinkShare, ReferralAction, referralTitle } from "@/components/app/ReferralActions";
import { StatusBadge } from "@/components/app/status";
import { CONTACTS } from "@/domain/data";
import type { Referral } from "@/domain/types";
import { cn, formatDate, inr } from "@/lib/utils";
import { activeLink } from "@/store/useProto";

export function rewardLine(r: Referral, amt: number) {
  switch (r.rewardA) {
    case "credited":
      return { text: `${inr(amt)} credited`, cls: "text-airtel-success", locked: false };
    case "validating":
      return { text: `${inr(amt)} validating`, cls: "text-[#A56A12]", locked: true };
    case "delayed":
      return { text: `${inr(amt)} delayed`, cls: "text-[#A56A12]", locked: true };
    case "failed":
      return { text: "Reward unsuccessful", cls: "text-airtel-error", locked: false };
    case "reversed":
      return { text: "Reward reversed", cls: "text-airtel-error", locked: false };
    case "expired":
      return { text: "Reward expired", cls: "text-airtel-sub", locked: false };
    case "not_eligible":
      return { text: "Not eligible", cls: "text-airtel-sub", locked: false };
    default:
      return { text: `${inr(amt)} pending`, cls: "text-airtel-sub", locked: true };
  }
}

/** Short expiry that stays on one line beside the action button. */
function expiresIn(ms: number) {
  const h = Math.floor(ms / 3_600_000);
  if (h >= 48) return `${Math.floor(h / 24)} days`;
  return h > 0 ? `${h}h` : `${Math.max(1, Math.floor(ms / 60_000))}m`;
}

/** One referral on the Gen4 card: friend and status, then reward, link state and next action. */
export function ReferralCard({ r, reward, onOpen }: { r: Referral; reward: number; onOpen: () => void }) {
  const contact = CONTACTS.find((x) => x.id === r.contactId);
  const link = activeLink(r);
  const rw = rewardLine(r, reward);
  const share = isLinkShare(r);
  const waiting = ["invited", "link_opened"].includes(r.status);
  const linkNote = !waiting && r.status !== "expired" ? null : link.state === "active" ? `Expires in ${expiresIn(link.expiresAt - Date.now())}` : "Link Expired";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => e.key === "Enter" && onOpen()}
      className={`cursor-pointer rounded-[16px] p-4 active:scale-[0.99] ${CARD}`}
    >
      <div className="flex items-start gap-3">
        {share ? (
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#E6E9EF] text-[#292C31]">
            <Link2 className="size-5" />
          </span>
        ) : (
          <ContactAvatar name={r.name} hue={contact?.hue ?? 200} size={40} />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-[14px] font-bold leading-5 text-[#292C31]">{referralTitle(r)}</p>
            <StatusBadge status={r.status} className="shrink-0" />
          </div>
          <p className="mt-0.5 text-[12px] leading-[18px] text-[#696B6F]">
            {share ? "Shared" : "Invited"} {formatDate(r.createdAt)}
            {r.delivery === "pending" && <span className="font-semibold text-[#A56A12]"> · Sending…</span>}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 border-t border-[#E6E9EF] pt-3">
        <span className={cn("flex shrink-0 items-center gap-1 text-[12px] font-bold leading-[18px]", rw.cls)}>
          {rw.locked && <Lock className="size-3" />}
          {rw.text}
        </span>
        {linkNote && <span className="min-w-0 truncate text-[12px] leading-[18px] text-[#696B6F]">· {linkNote}</span>}
        <span className="ml-auto shrink-0">
          <ReferralAction r={r} />
        </span>
      </div>
    </motion.div>
  );
}
