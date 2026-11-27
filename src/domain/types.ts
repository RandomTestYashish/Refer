export type ReferralStatus =
  | "invited"
  | "link_opened"
  | "accepted"
  | "pending_recharge"
  | "transaction_completed"
  | "reward_processing"
  | "reward_credited"
  | "expired"
  | "not_eligible"
  | "failed";

/** Reward state, tracked separately for referrer (A) and friend (B). */
export type RewardState = "locked" | "validating" | "delayed" | "credited" | "failed" | "reversed" | "expired" | "not_eligible";

export type ReferralReason =
  | "link_expired"
  | "attributed_other"
  | "existing_active"
  | "existing_no_txn"
  | "deadline_expired"
  | "reward_failed"
  | "reward_reversed"
  | "reward_expired";

export interface ReferralLink {
  code: string;
  url: string;
  createdAt: number;
  expiresAt: number;
  state: "active" | "expired" | "superseded";
  openedAt?: number;
}

export interface ReferralEvent {
  kind: ReferralStatus | "resent" | "reminder" | "delivery_pending" | "delivered";
  at: number;
  note?: string;
}

export interface Referral {
  id: string;
  contactId: string;
  name: string;
  phone: string;
  channel: "sms" | "whatsapp" | "link";
  createdAt: number;
  status: ReferralStatus;
  reason?: ReferralReason;
  links: ReferralLink[]; // full link history is kept after expiry / resend
  events: ReferralEvent[];
  delivery: "sent" | "pending";
  rewardA: RewardState;
  rewardB: RewardState;
  recharge?: { amount: number; planName: string; txnId: string; at: number; qualifying: boolean };
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  hue: number;
}

export type Journey = "A" | "B";

export type ScreenId =
  | "a_home"
  | "a_intro"
  | "a_landing"
  | "a_milestones"
  | "a_permission"
  | "a_contacts"
  | "a_preview"
  | "a_sending"
  | "a_dashboard"
  | "a_detail"
  | "a_pending"
  | "a_unlocked"
  | "b_sms"
  | "b_appstore"
  | "b_launch"
  | "b_register"
  | "b_eligibility"
  | "b_home"
  | "b_plans"
  | "b_payment"
  | "b_success"
  | "b_complete"
  | "b_error";

export interface ScreenRef {
  id: ScreenId;
  params?: Record<string, string>;
  /** Unique per navigation so re-entering the same screen remounts it. */
  key?: string;
}

/** Developer scenario switches — prototype testing only. */
export interface Scenario {
  appInstalled: boolean;
  userType: "new" | "existing_no_txn" | "existing_active";
  contacts: "grant" | "deny" | "unavailable" | "empty";
  network: "success" | "failure" | "slow";
  share: "ok" | "sms_fail" | "whatsapp_missing" | "copy_fail";
  linkState: "valid" | "invalid";
  install: "success" | "cancelled" | "failed";
  contextRestore: "success" | "failed";
  registration: "complete" | "incomplete";
  attribution: "this_inviter" | "other_inviter";
  deadline: "within" | "expired";
  payment: "success" | "failure" | "cancelled" | "network";
  reward: "credited" | "pending" | "delayed" | "failed" | "reversed" | "expired";
}

export const DEFAULT_SCENARIO: Scenario = {
  appInstalled: false,
  userType: "new",
  contacts: "grant",
  network: "success",
  share: "ok",
  linkState: "valid",
  install: "success",
  contextRestore: "success",
  registration: "complete",
  attribution: "this_inviter",
  deadline: "within",
  payment: "success",
  reward: "credited",
};
