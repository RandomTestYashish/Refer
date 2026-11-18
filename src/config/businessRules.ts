/**
 * PROVISIONAL business rules.
 * None of these are final policy — every value is a working assumption and is
 * editable at runtime from the developer panel ("Business rules").
 */
export interface Milestone {
  id: "first" | "bronze" | "silver" | "gold";
  label: string;
  target: number;
}

export interface BusinessRules {
  referrerReward: number; // ₹ to User A
  friendReward: number; // ₹ to User B
  minTransaction: number; // ₹ minimum qualifying recharge
  linkValidityHours: number; // invitation link lifetime
  attribution: "first_valid_link_opened";
  firstTxnDeadlineDays: number; // time User B has to make the first qualifying recharge
  rewardValidationDays: number; // separate window before a reward is final (NOT the same as the deadline)
  existingNoTxnEligible: boolean; // segment 2 eligibility — final business rule pending
  milestones: Milestone[];
}

export const DEFAULT_RULES: BusinessRules = {
  referrerReward: 25,
  friendReward: 25,
  minTransaction: 100,
  linkValidityHours: 24,
  attribution: "first_valid_link_opened",
  firstTxnDeadlineDays: 10,
  rewardValidationDays: 30,
  existingNoTxnEligible: true,
  milestones: [
    { id: "first", label: "First referral", target: 1 },
    { id: "bronze", label: "Bronze", target: 5 },
    { id: "silver", label: "Silver", target: 15 },
    { id: "gold", label: "Gold", target: 30 },
  ],
};

export const RULE_LABELS: Record<string, string> = {
  referrerReward: "Referrer reward (₹)",
  friendReward: "Friend reward (₹)",
  minTransaction: "Minimum transaction (₹)",
  linkValidityHours: "Link validity (hours)",
  firstTxnDeadlineDays: "First transaction deadline (days)",
  rewardValidationDays: "Reward validation period (days)",
};
