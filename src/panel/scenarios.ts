import { CONTACTS } from "@/domain/data";
import type { Journey, ReferralReason } from "@/domain/types";
import { useProto } from "@/store/useProto";
import { ensureFocus, go, prepare } from "./jump";

const S = () => useProto.getState();

export interface ErrorScenario {
  id: string;
  journey: Journey;
  label: string;
  hint?: string;
  run: () => void;
}

function markNotEligible(reason: ReferralReason, upTo: "link_opened" | "accepted") {
  const id = ensureFocus();
  S().rebuild(id, upTo);
  useProto.setState((s) => ({
    referrals: s.referrals.map((r) =>
      r.id === id
        ? {
            ...r,
            status: "not_eligible",
            reason,
            rewardA: "not_eligible",
            rewardB: reason === "attributed_other" ? r.rewardB : "not_eligible",
            events: [...r.events, { kind: "not_eligible", at: Date.now(), note: reason === "attributed_other" ? "Friend opened another inviter's link first" : "Existing active user" }],
          }
        : r,
    ),
  }));
  return id;
}

function rewardCase(outcome: "pending" | "delayed" | "failed" | "reversed" | "expired") {
  const id = ensureFocus();
  S().rebuild(id, "reward_processing");
  S().applyRewardOutcome(id, outcome, true);
  go("A", "a_pending", { id });
}

const selectSome = () => {
  const s = S();
  s.setContactsGranted(true);
  const free = CONTACTS.filter((c) => !s.referrals.some((r) => r.contactId === c.id)).slice(0, 2);
  s.setSelected((free.length ? free : CONTACTS.slice(1, 3)).map((c) => c.id));
};

export const ERROR_SCENARIOS: ErrorScenario[] = [
  /* ---------------- User A ---------------- */
  { id: "a1", journey: "A", label: "Contact permission denied", run: () => { S().setScenario({ contacts: "deny" }); S().setContactsGranted(false); go("A", "a_permission", { state: "denied" }); } },
  { id: "a2", journey: "A", label: "Contacts unavailable", run: () => { S().setScenario({ contacts: "unavailable" }); S().setContactsGranted(true); go("A", "a_contacts"); } },
  { id: "a3", journey: "A", label: "No contacts found", hint: "Also try searching for a name that doesn't exist with Contacts = Granted.", run: () => { S().setScenario({ contacts: "empty" }); S().setContactsGranted(true); go("A", "a_contacts"); } },
  { id: "a4", journey: "A", label: "No contact selected", hint: "Tap the bottom CTA without selecting anyone.", run: () => { S().setScenario({ contacts: "grant" }); S().setContactsGranted(true); S().setSelected([]); go("A", "a_contacts"); } },
  {
    id: "a5", journey: "A", label: "Duplicate contact", hint: "Tap the contact marked “Invited”.",
    run: () => { const id = ensureFocus(); S().rebuild(id, "invited"); S().setScenario({ contacts: "grant" }); S().setContactsGranted(true); S().setSelected([]); go("A", "a_contacts"); },
  },
  { id: "a6", journey: "A", label: "SMS sharing failed", hint: "Tap Send / SMS.", run: () => { S().setScenario({ share: "sms_fail", network: "success" }); selectSome(); go("A", "a_preview", { mode: "contacts" }); } },
  { id: "a7", journey: "A", label: "WhatsApp unavailable", hint: "Tap the WhatsApp share option.", run: () => { S().setScenario({ share: "whatsapp_missing" }); selectSome(); go("A", "a_preview", { mode: "contacts" }); } },
  { id: "a8", journey: "A", label: "Copy link failed", hint: "Tap Copy link.", run: () => { S().setScenario({ share: "copy_fail" }); selectSome(); go("A", "a_preview", { mode: "contacts" }); } },
  { id: "a9", journey: "A", label: "Network error while sending", run: () => { S().setScenario({ network: "failure", share: "ok" }); selectSome(); go("A", "a_sending", { ids: S().selectedContactIds.join(","), channel: "sms", n: String(Date.now()) }); } },
  { id: "a10", journey: "A", label: "Invitation sending pending", run: () => { S().setScenario({ network: "slow", share: "ok" }); selectSome(); go("A", "a_sending", { ids: S().selectedContactIds.join(","), channel: "sms", n: String(Date.now()) }); } },
  { id: "a11", journey: "A", label: "Link expired", run: () => { const id = ensureFocus(); S().rebuild(id, "invited"); S().expireLink(id); go("A", "a_pending", { id }); } },
  { id: "a12", journey: "A", label: "Resend invitation", hint: "Tap Resend — a new link is created and history is kept.", run: () => { const id = ensureFocus(); S().rebuild(id, "invited"); S().expireLink(id); go("A", "a_detail", { id }); } },
  { id: "a13", journey: "A", label: "Attributed to another inviter", run: () => go("A", "a_pending", { id: markNotEligible("attributed_other", "link_opened") }) },
  { id: "a14", journey: "A", label: "Friend is ineligible", run: () => go("A", "a_pending", { id: markNotEligible("existing_active", "accepted") }) },
  { id: "a15", journey: "A", label: "Reward validation pending", run: () => rewardCase("pending") },
  { id: "a16", journey: "A", label: "Reward processing delayed", run: () => rewardCase("delayed") },
  { id: "a17", journey: "A", label: "Reward failed", run: () => rewardCase("failed") },
  { id: "a18", journey: "A", label: "Reward reversed", run: () => rewardCase("reversed") },
  { id: "a19", journey: "A", label: "Reward expired", run: () => rewardCase("expired") },
  {
    id: "a20", journey: "A", label: "Empty referral dashboard", hint: "This clears all referral records (settings are kept).",
    run: () => { useProto.setState({ referrals: [], focusReferralId: undefined, notices: [] }); S().resetJourney("B"); go("A", "a_dashboard"); },
  },

  /* ---------------- User B ---------------- */
  { id: "b1", journey: "B", label: "Invalid referral link", hint: "Tap the link in the SMS.", run: () => { S().setScenario({ linkState: "invalid" }); prepare("b_sms"); S().setBRun({ linkTapped: true }); go("B", "b_sms"); } },
  { id: "b2", journey: "B", label: "Expired referral link", hint: "Tap the link in the SMS.", run: () => { S().setScenario({ linkState: "valid" }); const id = ensureFocus(); S().rebuild(id, "invited"); S().expireLink(id); S().setBRun({ linkTapped: true }); go("B", "b_sms"); } },
  { id: "b3", journey: "B", label: "Installation cancelled", hint: "Tap Install.", run: () => { S().setScenario({ appInstalled: false, install: "cancelled" }); prepare("b_appstore"); go("B", "b_appstore"); } },
  { id: "b4", journey: "B", label: "Installation failed", hint: "Tap Install.", run: () => { S().setScenario({ appInstalled: false, install: "failed" }); prepare("b_appstore"); go("B", "b_appstore"); } },
  { id: "b5", journey: "B", label: "Referral context not restored", run: () => { S().setScenario({ appInstalled: false, contextRestore: "failed" }); prepare("b_launch"); go("B", "b_launch", { via: "store" }); } },
  { id: "b6", journey: "B", label: "Registration incomplete", hint: "Get OTP → Verify.", run: () => { S().setScenario({ userType: "new", registration: "incomplete" }); prepare("b_register"); go("B", "b_register"); } },
  { id: "b7", journey: "B", label: "Existing active user — ineligible", run: () => { S().setScenario({ userType: "existing_active", attribution: "this_inviter" }); prepare("b_eligibility"); go("B", "b_eligibility"); } },
  { id: "b8", journey: "B", label: "Existing user, no qualifying txn", hint: "Toggle “Existing users (no txn) eligible” to see both outcomes.", run: () => { S().setScenario({ userType: "existing_no_txn", attribution: "this_inviter" }); prepare("b_eligibility"); go("B", "b_eligibility"); } },
  { id: "b9", journey: "B", label: "Recharge below ₹100", hint: "Select the ₹79 plan.", run: () => { S().setScenario({ deadline: "within" }); prepare("b_plans"); go("B", "b_plans"); } },
  { id: "b10", journey: "B", label: "Payment failed", hint: "Tap Pay.", run: () => { S().setScenario({ payment: "failure" }); go("B", "b_payment", prepare("b_payment")); } },
  { id: "b11", journey: "B", label: "Payment cancelled", hint: "Tap Pay.", run: () => { S().setScenario({ payment: "cancelled" }); go("B", "b_payment", prepare("b_payment")); } },
  { id: "b12", journey: "B", label: "Network interruption during payment", hint: "Tap Pay.", run: () => { S().setScenario({ payment: "network" }); go("B", "b_payment", prepare("b_payment")); } },
  { id: "b13", journey: "B", label: "Recharge success, reward pending", hint: "Tap Pay → See reward status.", run: () => { S().setScenario({ payment: "success", reward: "pending", deadline: "within" }); go("B", "b_payment", prepare("b_payment")); } },
  { id: "b14", journey: "B", label: "Transaction reversed", hint: "Tap Pay → See reward status.", run: () => { S().setScenario({ payment: "success", reward: "reversed", deadline: "within" }); go("B", "b_payment", prepare("b_payment")); } },
  { id: "b15", journey: "B", label: "Referral deadline expired", run: () => { S().setScenario({ deadline: "expired" }); prepare("b_home"); S().setBRun({ sheetSeen: false }); go("B", "b_home"); } },
  { id: "b16", journey: "B", label: "Reward not eligible", hint: "Tap Pay → See reward status.", run: () => { S().setScenario({ payment: "success", reward: "failed", deadline: "within" }); go("B", "b_payment", prepare("b_payment")); } },
];
