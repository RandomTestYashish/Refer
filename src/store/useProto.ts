import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { DEFAULT_RULES, type BusinessRules } from "@/config/businessRules";
import { CONTACTS, PLANS, REFERRER } from "@/domain/data";
import { HOME_SCREEN } from "@/domain/screens";
import {
  DEFAULT_SCENARIO,
  type Journey,
  type Referral,
  type ReferralEvent,
  type ReferralReason,
  type ReferralStatus,
  type Scenario,
  type ScreenId,
  type ScreenRef,
} from "@/domain/types";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const HOUR = 3_600_000;
const uid = (p: string) => `${p}_${Math.random().toString(36).slice(2, 8)}`;
const code = () =>
  `${REFERRER.first.toUpperCase()}-${Array.from({ length: 4 }, () => "ABCDEFGHJKMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 30)]).join("")}`;

function newLink(rules: BusinessRules, now = Date.now()) {
  const c = code();
  return {
    code: c,
    url: `https://airtel.in/r/${c}`,
    createdAt: now,
    expiresAt: now + rules.linkValidityHours * HOUR,
    state: "active" as const,
  };
}

export const activeLink = (r: Referral) => r.links[r.links.length - 1];

/** Successful = reward credited (counts towards milestones). */
export const isSuccessful = (r: Referral) => r.status === "reward_credited";

export type EligibilityResult =
  | { eligible: true; segment: Scenario["userType"] }
  | { eligible: false; segment: Scenario["userType"]; reason: ReferralReason };

export interface BRun {
  linkTapped: boolean;
  installed: boolean;
  contextRestored: boolean;
  registered: boolean;
  eligibility?: EligibilityResult;
  attributedOther: boolean;
  sheetSeen: boolean;
  planId?: string;
  txnId?: string;
}

const EMPTY_BRUN: BRun = {
  linkTapped: false,
  installed: false,
  contextRestored: false,
  registered: false,
  attributedOther: false,
  sheetSeen: false,
};

export interface Notice {
  id: string;
  text: string;
  at: number;
  read: boolean;
}

interface State {
  journey: Journey;
  nav: Record<Journey, ScreenRef[]>;
  direction: 1 | -1;
  rules: BusinessRules;
  scenario: Scenario;
  referrals: Referral[];
  focusReferralId?: string;
  pastSuccesses: number; // simulated historic successful referrals (milestone testing)
  selectedContactIds: string[];
  contactsGranted: boolean;
  bRun: BRun;
  notices: Notice[];
  /** Completed send attempts keyed by the nonce of the a_sending screen (prevents re-sending on remount). */
  sendResults: Record<string, { phase: "success" | "pending"; created: string[] }>;
}

interface Actions {
  setJourney: (j: Journey) => void;
  navigate: (id: ScreenId, params?: Record<string, string>) => void;
  replace: (id: ScreenId, params?: Record<string, string>) => void;
  back: () => void;
  resetTo: (id: ScreenId, params?: Record<string, string>) => void;
  setScenario: (patch: Partial<Scenario>) => void;
  setRules: (patch: Partial<BusinessRules>) => void;
  setPastSuccesses: (n: number) => void;
  setFocus: (id: string) => void;
  setBRun: (patch: Partial<BRun>) => void;

  // User A
  setContactsGranted: (v: boolean) => void;
  toggleContact: (id: string) => void;
  setSelected: (ids: string[]) => void;
  createInvites: (contactIds: string[], channel: Referral["channel"], pending?: boolean) => string[];
  markDelivered: (ids: string[]) => void;
  resend: (id: string) => void;
  remind: (id: string) => void;
  expireLink: (id: string) => void;
  fastForward: (id: string) => void;
  applyRewardOutcome: (id: string, outcome?: Scenario["reward"], force?: boolean) => void;
  rebuild: (id: string, upTo: ReferralStatus) => void;
  markNoticesRead: () => void;
  recordSend: (nonce: string, phase: "success" | "pending", created: string[]) => void;
  ensureReferral: () => string;

  // User B
  openLink: (code?: string) => { ok: true } | { ok: false; error: "invalid_link" | "expired_link" | "no_invite" };
  acceptReferral: () => void;
  decideEligibility: () => EligibilityResult;
  completeRecharge: (planId: string) => void;
  expireDeadline: () => void;

  resetJourney: (j?: Journey) => void;
  resetAll: () => void;
}

export type Store = State & Actions;

const initial = (): State => ({
  journey: "A",
  nav: { A: [{ id: HOME_SCREEN.A }], B: [{ id: HOME_SCREEN.B }] },
  direction: 1,
  rules: DEFAULT_RULES,
  scenario: DEFAULT_SCENARIO,
  referrals: [],
  focusReferralId: undefined,
  pastSuccesses: 0,
  selectedContactIds: [],
  contactsGranted: false,
  bRun: EMPTY_BRUN,
  notices: [],
  sendResults: {},
});

/* ------------------------------------------------------------------ */
/* Store                                                               */
/* ------------------------------------------------------------------ */

export const useProto = create<Store>()(
  persist(
    (set, get) => {
      /** Immutable update of one referral with optional status transition + event. */
      const patchReferral = (
        id: string,
        fn: (r: Referral) => Partial<Referral> | void,
        event?: ReferralEvent | ReferralEvent[],
      ) =>
        set((s) => ({
          referrals: s.referrals.map((r) => {
            if (r.id !== id) return r;
            const patch = fn(r) || {};
            const evs = event ? (Array.isArray(event) ? event : [event]) : [];
            return { ...r, ...patch, events: [...r.events, ...evs] };
          }),
        }));

      const transition = (id: string, status: ReferralStatus, note?: string, extra: Partial<Referral> = {}, at = Date.now()) =>
        patchReferral(id, () => ({ status, ...extra }), { kind: status, at, note });

      const notify = (text: string) =>
        set((s) => ({ notices: [{ id: uid("n"), text, at: Date.now(), read: false }, ...s.notices].slice(0, 20) }));

      const focus = () => {
        const s = get();
        return s.referrals.find((r) => r.id === s.focusReferralId);
      };

      return {
        ...initial(),

        setJourney: (journey) => set({ journey }),
        navigate: (id, params) =>
          set((s) => ({ direction: 1, nav: { ...s.nav, [s.journey]: [...s.nav[s.journey], { id, params }] } })),
        replace: (id, params) =>
          set((s) => ({ direction: 1, nav: { ...s.nav, [s.journey]: [...s.nav[s.journey].slice(0, -1), { id, params }] } })),
        back: () =>
          set((s) => {
            const stack = s.nav[s.journey];
            if (stack.length <= 1) return {};
            return { direction: -1, nav: { ...s.nav, [s.journey]: stack.slice(0, -1) } };
          }),
        resetTo: (id, params) =>
          set((s) => {
            // Rebuild a sensible back-stack beneath the target screen.
            const base: ScreenId[] =
              s.journey === "A"
                ? id === "a_home" ? [] : id === "a_landing" ? ["a_home"] : ["a_home", "a_landing"]
                : id === "b_sms" ? [] : ["b_home", "b_plans", "b_payment", "b_success", "b_complete"].includes(id) && id !== "b_home" ? ["b_sms", "b_home"] : ["b_sms"];
            const stack: ScreenRef[] = [...base.map((b) => ({ id: b })), { id, params }];
            return { direction: -1, nav: { ...s.nav, [s.journey]: stack } };
          }),
        setScenario: (patch) => set((s) => ({ scenario: { ...s.scenario, ...patch } })),
        setRules: (patch) => set((s) => ({ rules: { ...s.rules, ...patch } })),
        setPastSuccesses: (pastSuccesses) => set({ pastSuccesses }),
        setFocus: (focusReferralId) => set({ focusReferralId, bRun: EMPTY_BRUN }),
        setBRun: (patch) => set((s) => ({ bRun: { ...s.bRun, ...patch } })),

        /* ---------------- User A ---------------- */
        setContactsGranted: (contactsGranted) => set({ contactsGranted }),
        toggleContact: (id) =>
          set((s) => ({
            selectedContactIds: s.selectedContactIds.includes(id)
              ? s.selectedContactIds.filter((x) => x !== id)
              : [...s.selectedContactIds, id],
          })),
        setSelected: (selectedContactIds) => set({ selectedContactIds }),

        createInvites: (contactIds, channel, pending = false) => {
          const { rules } = get();
          const now = Date.now();
          const created: Referral[] = contactIds.map((cid, i) => {
            const c = CONTACTS.find((x) => x.id === cid) ?? { id: cid, name: "Friend", phone: "" };
            return {
              id: uid("ref"),
              contactId: cid,
              name: c.name,
              phone: c.phone,
              channel,
              createdAt: now + i,
              status: "invited",
              links: [newLink(rules, now)],
              events: [{ kind: pending ? "delivery_pending" : "invited", at: now, note: pending ? "Queued — waiting for network" : `Sent via ${channel === "sms" ? "SMS" : channel === "whatsapp" ? "WhatsApp" : "link"}` }],
              delivery: pending ? "pending" : "sent",
              rewardA: "locked",
              rewardB: "locked",
            };
          });
          set((s) => ({
            referrals: [...created, ...s.referrals],
            focusReferralId: created[0]?.id ?? s.focusReferralId,
            bRun: created.length ? EMPTY_BRUN : s.bRun,
            // User B's phone receives a fresh SMS — restart B's journey at the inbox.
            nav: created.length ? { ...s.nav, B: [{ id: "b_sms" }] } : s.nav,
          }));
          return created.map((r) => r.id);
        },
        markDelivered: (ids) =>
          ids.forEach((id) =>
            patchReferral(id, () => ({ delivery: "sent" }), [
              { kind: "delivered", at: Date.now(), note: "Delivered after network recovered" },
              { kind: "invited", at: Date.now() },
            ]),
          ),
        resend: (id) => {
          const { rules } = get();
          patchReferral(
            id,
            (r) => ({
              status: "invited",
              reason: undefined,
              rewardA: "locked",
              rewardB: "locked",
              delivery: "sent",
              links: [
                ...r.links.map((l) => (l.state === "active" ? { ...l, state: "superseded" as const } : l)),
                newLink(rules),
              ],
            }),
            { kind: "resent", at: Date.now(), note: "New link generated — previous history kept" },
          );
          set((s) => (s.focusReferralId === id ? { bRun: EMPTY_BRUN, nav: { ...s.nav, B: [{ id: "b_sms" }] } } : {}));
        },
        remind: (id) => patchReferral(id, () => ({}), { kind: "reminder", at: Date.now(), note: "Reminder sent" }),
        expireLink: (id) => {
          const r = get().referrals.find((x) => x.id === id);
          if (!r) return;
          const linkOnly = ["invited", "link_opened"].includes(r.status);
          patchReferral(
            id,
            (r) => ({
              links: r.links.map((l) => (l.state === "active" ? { ...l, state: "expired" as const, expiresAt: Math.min(l.expiresAt, Date.now() - 1) } : l)),
              ...(linkOnly ? { status: "expired" as const, reason: "link_expired" as const, rewardA: "expired" as const, rewardB: "expired" as const } : {}),
            }),
            linkOnly ? { kind: "expired", at: Date.now(), note: "Link validity ended" } : undefined,
          );
        },
        fastForward: (id) => {
          const r = get().referrals.find((x) => x.id === id);
          if (!r) return;
          const t = Date.now();
          const order: ReferralStatus[] = ["link_opened", "accepted", "pending_recharge", "transaction_completed", "reward_processing"];
          const from = Math.max(0, order.indexOf(r.status as ReferralStatus) + 1);
          const steps = r.status === "invited" ? order : order.slice(from);
          steps.forEach((st, i) =>
            transition(id, st, st === "transaction_completed" ? "₹199 recharge (simulated)" : undefined, {}, t - (steps.length - i) * 60_000),
          );
          patchReferral(id, () => ({
            rewardA: "validating",
            rewardB: "validating",
            recharge: { amount: 199, planName: "₹199 Unlimited", txnId: uid("TXN").toUpperCase(), at: t, qualifying: true },
          }));
          get().applyRewardOutcome(id);
        },
        applyRewardOutcome: (id, outcome, force) => {
          const o = outcome ?? get().scenario.reward;
          const r = get().referrals.find((x) => x.id === id);
          if (!r || !r.recharge?.qualifying) return;
          const resolvable = force
            ? ["transaction_completed", "reward_processing", "reward_credited", "failed", "expired"].includes(r.status)
            : ["transaction_completed", "reward_processing"].includes(r.status);
          if (!resolvable) return;
          if (r.status === "reward_credited" && o === "credited") return;
          const { rules } = get();
          if (r.status === "transaction_completed") transition(id, "reward_processing", "Validating qualifying transaction");
          switch (o) {
            case "credited":
              transition(id, "reward_credited", `₹${rules.referrerReward} credited to both`, { rewardA: "credited", rewardB: "credited", reason: undefined });
              notify(`${r.name.split(" ")[0]} completed a recharge — ₹${rules.referrerReward} unlocked!`);
              break;
            case "pending":
              if (r.rewardA === "validating" && r.events[r.events.length - 1]?.note?.startsWith("Validation pending")) break;
              patchReferral(id, () => ({ status: "reward_processing", rewardA: "validating", rewardB: "validating", reason: undefined }), {
                kind: "reward_processing",
                at: Date.now(),
                note: `Validation pending (up to ${rules.rewardValidationDays} days)`,
              });
              break;
            case "delayed":
              if (r.rewardA === "delayed") break;
              patchReferral(id, () => ({ status: "reward_processing", rewardA: "delayed", rewardB: "delayed", reason: undefined }), {
                kind: "reward_processing",
                at: Date.now(),
                note: "Processing is taking longer than usual",
              });
              break;
            case "failed":
              transition(id, "failed", "Reward credit failed", { rewardA: "failed", rewardB: "failed", reason: "reward_failed" });
              break;
            case "reversed":
              transition(id, "failed", "Transaction reversed — reward withdrawn", { rewardA: "reversed", rewardB: "reversed", reason: "reward_reversed" });
              break;
            case "expired":
              transition(id, "expired", "Validation window ended", { rewardA: "expired", rewardB: "expired", reason: "reward_expired" });
              break;
          }
        },
        rebuild: (id, upTo) => {
          const { rules } = get();
          const order: ReferralStatus[] = ["invited", "link_opened", "accepted", "pending_recharge", "transaction_completed", "reward_processing", "reward_credited"];
          const idx = order.indexOf(upTo);
          const now = Date.now();
          const steps = order.slice(0, idx + 1);
          const paid = idx >= order.indexOf("transaction_completed");
          set((s) => ({
            referrals: s.referrals.map((r) => {
              if (r.id !== id) return r;
              const created = now - steps.length * 7 * 60_000;
              const link = { ...newLink(rules, created), openedAt: idx >= 1 ? created + 7 * 60_000 : undefined };
              return {
                ...r,
                status: upTo,
                reason: undefined,
                delivery: "sent",
                createdAt: created,
                links: [...r.links.map((l) => ({ ...l, state: "superseded" as const })), link].slice(-1),
                events: steps.map((k, i) => ({
                  kind: k,
                  at: created + i * 7 * 60_000,
                  note: k === "invited" ? "Sent via SMS" : k === "transaction_completed" ? "₹199 recharge (simulated)" : undefined,
                })),
                rewardA: upTo === "reward_credited" ? "credited" : paid ? "validating" : "locked",
                rewardB: upTo === "reward_credited" ? "credited" : paid ? "validating" : "locked",
                recharge: paid ? { amount: 199, planName: "₹199 plan", txnId: `TXN${Math.floor(1e9 + Math.random() * 9e9)}`, at: now, qualifying: true } : undefined,
              };
            }),
          }));
        },
        recordSend: (nonce, phase, created) => set((s) => ({ sendResults: { ...s.sendResults, [nonce]: { phase, created } } })),
        markNoticesRead: () => set((s) => ({ notices: s.notices.map((n) => ({ ...n, read: true })) })),
        ensureReferral: () => {
          const s = get();
          const existing = s.referrals.find((r) => r.id === s.focusReferralId) ?? s.referrals[0];
          if (existing) return existing.id;
          return get().createInvites([CONTACTS[0].id], "sms")[0];
        },

        /* ---------------- User B ---------------- */
        openLink: (linkCode) => {
          const s = get();
          const r = focus();
          if (!r) return { ok: false, error: "no_invite" };
          if (s.scenario.linkState === "invalid") return { ok: false, error: "invalid_link" };
          const tapped = linkCode ? r.links.find((l) => l.code === linkCode) : undefined;
          if (tapped && tapped.state === "superseded") return { ok: false, error: "expired_link" };
          const link = activeLink(r);
          if (r.status === "expired" && r.reason === "link_expired") return { ok: false, error: "expired_link" };
          if (link.state !== "active" || link.expiresAt < Date.now()) {
            get().expireLink(r.id);
            return { ok: false, error: "expired_link" };
          }
          if (r.status === "invited") {
            transition(r.id, "link_opened", "Opened from SMS");
            patchReferral(r.id, (x) => ({ links: x.links.map((l, i) => (i === x.links.length - 1 ? { ...l, openedAt: Date.now() } : l)) }));
            notify(`${r.name.split(" ")[0]} opened your invite`);
          }
          set((st) => ({ bRun: { ...st.bRun, linkTapped: true } }));
          return { ok: true };
        },
        acceptReferral: () => {
          const s = get();
          const r = focus();
          if (!r) return;
          if (s.scenario.attribution === "other_inviter") {
            if (r.status !== "not_eligible")
              transition(r.id, "not_eligible", "Friend opened another inviter's link first", {
                reason: "attributed_other",
                rewardA: "not_eligible",
              });
            set((st) => ({ bRun: { ...st.bRun, attributedOther: true } }));
            return;
          }
          if (["invited", "link_opened"].includes(r.status)) {
            if (r.status === "invited") transition(r.id, "link_opened");
            transition(r.id, "accepted", "Friend signed in to Airtel");
          }
        },
        decideEligibility: () => {
          const s = get();
          const seg = s.scenario.userType;
          let res: EligibilityResult;
          if (seg === "existing_active") res = { eligible: false, segment: seg, reason: "existing_active" };
          else if (seg === "existing_no_txn" && !s.rules.existingNoTxnEligible) res = { eligible: false, segment: seg, reason: "existing_no_txn" };
          else res = { eligible: true, segment: seg };
          const r = focus();
          if (r && !s.bRun.attributedOther) {
            if (!res.eligible) {
              if (r.status !== "not_eligible")
                transition(r.id, "not_eligible", res.reason === "existing_active" ? "Existing active user" : "Existing user — segment not eligible", {
                  reason: res.reason,
                  rewardA: "not_eligible",
                  rewardB: "not_eligible",
                });
              notify(`${r.name.split(" ")[0]} isn't eligible for this referral`);
            } else if (r.status === "accepted") {
              transition(r.id, "pending_recharge", `First qualifying recharge due within ${s.rules.firstTxnDeadlineDays} days`);
            }
          }
          set((st) => ({ bRun: { ...st.bRun, eligibility: res } }));
          return res;
        },
        completeRecharge: (planId) => {
          const s = get();
          const plan = PLANS.find((p) => p.id === planId)!;
          const txnId = `TXN${Math.floor(1e9 + Math.random() * 9e9)}`;
          set((st) => ({ bRun: { ...st.bRun, txnId, planId } }));
          const r = focus();
          if (!r || s.bRun.attributedOther || !s.bRun.eligibility?.eligible) return;
          const qualifying = plan.price >= s.rules.minTransaction && s.scenario.deadline === "within" && r.status === "pending_recharge";
          if (!qualifying) {
            if (r.status === "pending_recharge")
              patchReferral(r.id, () => ({}), {
                kind: "pending_recharge",
                at: Date.now(),
                note: plan.price < s.rules.minTransaction ? `₹${plan.price} recharge below ₹${s.rules.minTransaction} minimum` : undefined,
              });
            return;
          }
          transition(r.id, "transaction_completed", `₹${plan.price} recharge · ${txnId}`, {
            recharge: { amount: plan.price, planName: `₹${plan.price} plan`, txnId, at: Date.now(), qualifying: true },
          });
          transition(r.id, "reward_processing", "Validating qualifying transaction", { rewardA: "validating", rewardB: "validating" });
        },
        expireDeadline: () => {
          const r = focus();
          if (!r || !["accepted", "pending_recharge"].includes(r.status)) return;
          transition(r.id, "expired", `No qualifying recharge within ${get().rules.firstTxnDeadlineDays} days`, {
            reason: "deadline_expired",
            rewardA: "expired",
            rewardB: "expired",
          });
        },

        resetJourney: (j) =>
          set((s) => {
            const jj = j ?? s.journey;
            return {
              direction: -1,
              nav: { ...s.nav, [jj]: [{ id: HOME_SCREEN[jj] }] },
              ...(jj === "B" ? { bRun: EMPTY_BRUN } : { selectedContactIds: [] }),
            };
          }),
        resetAll: () => set({ ...initial() }),
      };
    },
    {
      name: "airtel-refer-proto-v1",
      version: 1,
      storage: createJSONStorage(() => {
        try {
          localStorage.setItem("__t", "1");
          localStorage.removeItem("__t");
          return localStorage;
        } catch {
          const mem = new Map<string, string>();
          return { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => void mem.set(k, v), removeItem: (k) => void mem.delete(k) };
        }
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<State>;
        return {
          ...current,
          ...p,
          rules: { ...DEFAULT_RULES, ...(p.rules ?? {}) },
          scenario: { ...DEFAULT_SCENARIO, ...(p.scenario ?? {}) },
        };
      },
    },
  ),
);

/* ------------------------------------------------------------------ */
/* Selectors                                                           */
/* ------------------------------------------------------------------ */

export const useCurrentScreen = () => useProto((s) => s.nav[s.journey][s.nav[s.journey].length - 1]);
export const useFocusReferral = () => useProto((s) => s.referrals.find((r) => r.id === s.focusReferralId));

export function referralStats(referrals: Referral[], pastSuccesses: number, reward: number) {
  const accepted = referrals.filter((r) =>
    ["accepted", "pending_recharge", "transaction_completed", "reward_processing", "reward_credited"].includes(r.status) ||
    (r.status === "failed" && r.recharge) ||
    (r.status === "expired" && (r.reason === "deadline_expired" || r.reason === "reward_expired")),
  ).length;
  const pending = referrals.filter((r) => ["invited", "link_opened", "accepted", "pending_recharge", "transaction_completed", "reward_processing"].includes(r.status)).length;
  const successful = referrals.filter(isSuccessful).length;
  return {
    total: referrals.length,
    accepted,
    pending,
    successful,
    milestoneCount: successful + pastSuccesses,
    earned: successful * reward,
    pendingRewards: referrals.filter((r) => r.rewardA === "validating" || r.rewardA === "delayed").length * reward,
  };
}

