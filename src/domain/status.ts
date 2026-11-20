import type { ReferralReason, ReferralStatus, RewardState } from "./types";

type Tone = "success" | "warning" | "error" | "info" | "neutral" | "soft";

export const STATUS_META: Record<ReferralStatus, { label: string; tone: Tone; step: number }> = {
  invited: { label: "Invited", tone: "neutral", step: 0 },
  link_opened: { label: "Link opened", tone: "info", step: 1 },
  accepted: { label: "Accepted", tone: "info", step: 2 },
  pending_recharge: { label: "Pending recharge", tone: "warning", step: 3 },
  transaction_completed: { label: "Transaction completed", tone: "info", step: 4 },
  reward_processing: { label: "Reward processing", tone: "warning", step: 5 },
  reward_credited: { label: "Reward credited", tone: "success", step: 6 },
  expired: { label: "Expired", tone: "neutral", step: -1 },
  not_eligible: { label: "Not eligible", tone: "error", step: -1 },
  failed: { label: "Unsuccessful", tone: "error", step: -1 },
};

/** The happy-path timeline, in order. */
export const TIMELINE: ReferralStatus[] = [
  "invited",
  "link_opened",
  "accepted",
  "pending_recharge",
  "transaction_completed",
  "reward_processing",
  "reward_credited",
];

export const REWARD_META: Record<RewardState, { label: string; tone: Tone }> = {
  locked: { label: "Locked", tone: "neutral" },
  validating: { label: "Validation pending", tone: "warning" },
  delayed: { label: "Processing delayed", tone: "warning" },
  credited: { label: "Credited", tone: "success" },
  failed: { label: "Unsuccessful", tone: "error" },
  reversed: { label: "Reversed", tone: "error" },
  expired: { label: "Expired", tone: "neutral" },
  not_eligible: { label: "Not eligible", tone: "neutral" },
};

export const REASON_COPY: Record<ReferralReason, { title: string; body: string }> = {
  link_expired: {
    title: "Invitation link expired",
    body: "This link was valid for a limited time and wasn't opened. To create a fresh link, resend it. The earlier invite stays in history.",
  },
  attributed_other: {
    title: "Joined via another invite",
    body: "Your friend opened someone else's valid invite link first. Rewards go to the first valid link opened.",
  },
  existing_active: {
    title: "Friend isn't eligible",
    body: "Your friend is already an active Airtel user who has completed a qualifying transaction, so this referral can't earn rewards.",
  },
  existing_no_txn: {
    title: "Friend isn't eligible",
    body: "Your friend already has an Airtel account. Under the current rules, existing users without a qualifying transaction aren't eligible.",
  },
  deadline_expired: {
    title: "Recharge deadline passed",
    body: "Your friend didn't complete a qualifying recharge before the deadline, so the reward has lapsed.",
  },
  reward_failed: {
    title: "Reward couldn't be credited",
    body: "Something went wrong while crediting this reward. Our team has been notified and will retry automatically.",
  },
  reward_reversed: {
    title: "Reward reversed",
    body: "Your friend's qualifying recharge was reversed or refunded, so the linked reward was withdrawn.",
  },
  reward_expired: {
    title: "Reward expired",
    body: "This reward wasn't validated in time, so it has expired.",
  },
};

export const TONE_DOT: Record<Tone, string> = {
  success: "bg-airtel-success",
  warning: "bg-airtel-warning",
  error: "bg-airtel-error",
  info: "bg-[#1F5FCC]",
  neutral: "bg-[#A3A3A3]",
  soft: "bg-airtel-red",
};
