import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { STATUS_META, TIMELINE } from "@/domain/status";
import type { Referral } from "@/domain/types";
import { cn, formatDateTime } from "@/lib/utils";

/** Invited → Link Opened → Accepted → Pending Recharge → Transaction Completed → Reward Processing → Reward Credited */
export function ReferralTimeline({ r }: { r: Referral }) {
  const lastAt = (k: string) => [...r.events].reverse().find((e) => e.kind === k);
  // Only events after the latest resend count toward the current timeline.
  const resendAt = [...r.events].reverse().find((e) => e.kind === "resent")?.at ?? 0;
  const done = TIMELINE.map((s) => {
    const e = lastAt(s);
    return e && e.at >= resendAt ? e : s === "invited" && resendAt ? { kind: "invited", at: resendAt, note: "Resent with a new link" } : e;
  });
  const lastDone = done.reduce((acc, e, i) => (e ? i : acc), -1);
  const terminal = ["expired", "not_eligible", "failed"].includes(r.status) ? lastAt(r.status) : undefined;
  const isFinal = r.status === "reward_credited";

  return (
    <ol className="relative">
      {TIMELINE.map((s, i) => {
        const e = done[i];
        const isDone = !!e && i <= lastDone;
        const isCurrent = !terminal && !isFinal && i === lastDone + 1;
        const showTerminalAfter = terminal && i === lastDone;
        const meta = STATUS_META[s];
        return (
          <li key={s}>
            <div className="relative flex gap-3.5 pb-5">
              {i < TIMELINE.length - 1 && (
                <span className="absolute left-[11px] top-6 h-[calc(100%-24px)] w-[2px] overflow-hidden rounded bg-[#EDEDED]">
                  <motion.span
                    className="absolute inset-x-0 top-0 bg-airtel-success"
                    initial={{ height: 0 }}
                    animate={{ height: i < lastDone ? "100%" : 0 }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                  />
                </span>
              )}
              <motion.span
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.06 }}
                className={cn(
                  "relative z-[1] flex size-6 shrink-0 items-center justify-center rounded-full border-2",
                  isDone && "border-airtel-success bg-airtel-success text-white",
                  isCurrent && "border-airtel-warning bg-white",
                  !isDone && !isCurrent && "border-[#DCDCDC] bg-white",
                )}
              >
                {isDone && <Check className="size-3.5" strokeWidth={3.5} />}
                {isCurrent && (
                  <motion.span className="size-2 rounded-full bg-airtel-warning" animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1.4, repeat: Infinity }} />
                )}
              </motion.span>
              <div className="-mt-0.5 flex-1">
                <p className={cn("text-[14px] font-semibold", !isDone && !isCurrent && "text-[#A8A8A8]")}>{meta.label}</p>
                {isDone && e && (
                  <p className="text-[12px] text-airtel-sub">
                    {formatDateTime(e.at)}
                    {e.note ? ` · ${e.note}` : ""}
                  </p>
                )}
                {isCurrent && <p className="text-[12px] font-medium text-[#A56A12]">In progress</p>}
              </div>
            </div>
            {showTerminalAfter && terminal && (
              <div className="relative -mt-2 mb-4 ml-0 flex gap-3.5 rounded-[12px] bg-airtel-error-soft/60 p-2.5">
                <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-full text-white", r.status === "expired" ? "bg-[#9A9A9A]" : "bg-airtel-error")}>
                  <X className="size-3.5" strokeWidth={3.5} />
                </span>
                <div className="-mt-0.5">
                  <p className="text-[14px] font-semibold">{STATUS_META[r.status].label}</p>
                  <p className="text-[12px] text-airtel-sub">
                    {formatDateTime(terminal.at)}
                    {terminal.note ? ` · ${terminal.note}` : ""}
                  </p>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
