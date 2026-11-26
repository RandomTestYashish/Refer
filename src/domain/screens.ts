import type { Journey, Scenario, ScreenId } from "./types";

export const SCREEN_META: Record<ScreenId, { code: string; name: string; journey: Journey }> = {
  a_home: { code: "A01", name: "Airtel Homepage", journey: "A" },
  a_landing: { code: "A02", name: "Refer a App — Pull to invite", journey: "A" },
  a_milestones: { code: "A03", name: "Milestones", journey: "A" },
  a_permission: { code: "A04", name: "Contact Permission", journey: "A" },
  a_contacts: { code: "A05", name: "Contact Selection", journey: "A" },
  a_preview: { code: "A06", name: "Invitation Preview", journey: "A" },
  a_sending: { code: "A07", name: "Sending Invitation", journey: "A" },
  a_dashboard: { code: "A08", name: "My Referrals", journey: "A" },
  a_detail: { code: "A09", name: "Referral Detail", journey: "A" },
  a_pending: { code: "A10", name: "Pending Reward", journey: "A" },
  a_unlocked: { code: "A11", name: "Reward Unlocked", journey: "A" },
  b_sms: { code: "B01", name: "Incoming SMS", journey: "B" },
  b_appstore: { code: "B03B", name: "App Store — Install", journey: "B" },
  b_launch: { code: "B03A", name: "Opening Airtel", journey: "B" },
  b_register: { code: "B03·R", name: "Sign In / Register", journey: "B" },
  b_eligibility: { code: "B04", name: "Eligibility Check", journey: "B" },
  b_home: { code: "B05", name: "Welcome — Airtel Home", journey: "B" },
  b_plans: { code: "B07", name: "Recharge Plans", journey: "B" },
  b_payment: { code: "B08", name: "Payment", journey: "B" },
  b_success: { code: "B09", name: "Recharge Success", journey: "B" },
  b_complete: { code: "B10", name: "Referral Completed", journey: "B" },
  b_error: { code: "B·ERR", name: "Error State", journey: "B" },
};

/** Ordered happy path used by the panel's Previous / Next and progress indicator. */
export function journeyPath(j: Journey, s: Scenario): ScreenId[] {
  if (j === "A")
    return [
      "a_home",
      "a_landing",
      "a_milestones",
      "a_permission",
      "a_contacts",
      "a_preview",
      "a_sending",
      "a_dashboard",
      "a_detail",
      "a_pending",
      "a_unlocked",
    ];
  return [
    "b_sms",
    ...(s.appInstalled ? [] : (["b_appstore"] as ScreenId[])),
    "b_launch",
    "b_register",
    "b_eligibility",
    "b_home",
    "b_plans",
    "b_payment",
    "b_success",
    "b_complete",
  ];
}

export const HOME_SCREEN: Record<Journey, ScreenId> = { A: "a_home", B: "b_sms" };
