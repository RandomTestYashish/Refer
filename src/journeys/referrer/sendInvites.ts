import type { Referral } from "@/domain/types";
import { useProto } from "@/store/useProto";

export type SendOutcome =
  | { phase: "success" | "pending"; created: string[] }
  | { phase: "failure"; kind: "network" | "sms" | "offline" };

/**
 * Creates referral records for the given contacts — the single place an invite counts as "sent".
 * In this prototype the SMS itself is simulated; developer scenarios can force network/SMS failures,
 * and a real offline browser always fails without creating anything.
 */
export function performSend(ids: string[], channel: Referral["channel"], nonce?: string): SendOutcome {
  const st = useProto.getState();
  const { scenario } = st;
  if (typeof navigator !== "undefined" && navigator.onLine === false) return { phase: "failure", kind: "offline" };
  if (scenario.network === "failure") return { phase: "failure", kind: "network" };
  if (scenario.share === "sms_fail" && channel === "sms") return { phase: "failure", kind: "sms" };

  // Expired contacts are resent: new link, history kept.
  const fresh: string[] = [];
  const created: string[] = [];
  ids.forEach((cid) => {
    const prev = st.referrals.find((r) => r.contactId === cid);
    if (prev && prev.status === "expired" && cid !== "c_link") {
      st.resend(prev.id);
      created.push(prev.id);
    } else fresh.push(cid);
  });
  created.push(...st.createInvites(fresh, channel, scenario.network === "slow"));
  st.setSelected([]);
  const phase = scenario.network === "slow" ? "pending" : "success";
  if (nonce) st.recordSend(nonce, phase, created);
  return { phase, created };
}
