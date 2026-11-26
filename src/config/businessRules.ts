/**
 * Business rules for Refer a App.
 *
 * Every value is editable at runtime from the developer panel ("Business rules").
 * Values marked `confirmed: false` (or listed in PENDING_CONFIRMATION) are working
 * placeholders so the prototype can run — they are NOT approved policy and must be
 * confirmed by the business team before launch.
 */

export type TierId = "bronze" | "silver" | "gold" | "platinum";

export interface Milestone {
  id: TierId;
  label: string;
  /** Successful referrals in the current month needed to earn this tier. */
  target: number;
  /** Milestone reward in ₹, or null when not yet announced. */
  reward: number | null;
  confirmed: { target: boolean; reward: boolean };
}

export interface BusinessRules {
  referrerReward: number; // ₹ to the referrer per successful referral
  friendReward: number; // ₹ to the referred friend
  friendDataBenefit: string; // extra data benefit for the friend (e.g. "2 GB") — exact pack pending confirmation
  minTransaction: number; // ₹ minimum qualifying recharge
  yearlyEarningCap: number; // "Earn up to ₹X a year"
  linkValidityHours: number; // invitation link lifetime
  attribution: "first_valid_link_opened";
  firstTxnDeadlineDays: number; // time the friend has to make the first qualifying recharge
  rewardValidationDays: number; // separate window before a reward is final (NOT the same as the deadline)
  existingNoTxnEligible: boolean; // segment 2 eligibility — final business rule pending
  /** Social-proof line shown above the main CTA — the claim must be verified before launch. */
  socialProof: string;
  milestones: Milestone[];
}

export const DEFAULT_RULES: BusinessRules = {
  referrerReward: 25,
  friendReward: 25,
  friendDataBenefit: "2 GB",
  minTransaction: 100,
  yearlyEarningCap: 5000,
  linkValidityHours: 24,
  attribution: "first_valid_link_opened",
  firstTxnDeadlineDays: 10,
  rewardValidationDays: 30,
  existingNoTxnEligible: true,
  socialProof: "Millions use the Airtel Thanks app every day",
  milestones: [
    // Confirmed: first successful referral → ₹25 and Bronze.
    { id: "bronze", label: "Bronze", target: 1, reward: 25, confirmed: { target: true, reward: true } },
    // Silver and Gold are intermediate tiers — thresholds and rewards are NOT confirmed.
    { id: "silver", label: "Silver", target: 5, reward: null, confirmed: { target: false, reward: false } },
    { id: "gold", label: "Gold", target: 15, reward: null, confirmed: { target: false, reward: false } },
    // Confirmed: Platinum = ₹200 and is the highest tier in a month. Threshold NOT confirmed.
    { id: "platinum", label: "Platinum", target: 30, reward: 200, confirmed: { target: false, reward: true } },
  ],
};

export const TIER_IDS: TierId[] = ["bronze", "silver", "gold", "platinum"];

export const RULE_LABELS: Record<string, string> = {
  referrerReward: "Referrer reward (₹)",
  friendReward: "Friend reward (₹)",
  minTransaction: "Minimum transaction (₹)",
  yearlyEarningCap: "Yearly earning cap (₹)",
  linkValidityHours: "Link validity (hours)",
  firstTxnDeadlineDays: "First transaction deadline (days)",
  rewardValidationDays: "Reward validation period (days)",
};

/** Open business questions — surfaced in the developer panel and README. */
export const PENDING_CONFIRMATION: string[] = [
  "Silver and Gold thresholds and rewards",
  "Platinum threshold (₹200 reward and monthly cap are confirmed)",
  "Exact friend data benefit (shown as configurable “2 GB”)",
  "Reward release timing / validation window",
  "Final eligibility wording and legal terms",
  "Whether existing users with no qualifying transaction are eligible",
  "Social-proof claim (“Millions use the Airtel Thanks app every day”) needs a verified figure",
];

/** True when persisted rules still use the old milestone shape. */
export function validMilestones(m: unknown): m is Milestone[] {
  return (
    Array.isArray(m) &&
    m.length === TIER_IDS.length &&
    m.every((x, i) => x && typeof x === "object" && (x as Milestone).id === TIER_IDS[i] && typeof (x as Milestone).target === "number" && "confirmed" in (x as object))
  );
}
