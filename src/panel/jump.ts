import { toast } from "sonner";
import { CONTACTS } from "@/domain/data";
import type { Journey, ScreenId } from "@/domain/types";
import { activeLink, useProto, type BRun } from "@/store/useProto";

const S = () => useProto.getState();

/** The referral that represents User B (creates a demo invite if none exists). */
export function ensureFocus(): string {
  const s = S();
  const f = s.referrals.find((r) => r.id === s.focusReferralId);
  if (f) return f.id;
  if (s.referrals[0]) {
    s.setFocus(s.referrals[0].id);
    return s.referrals[0].id;
  }
  const id = s.createInvites([CONTACTS[0].id], "sms")[0];
  toast("Demo invitation created", { description: `${CONTACTS[0].name} was invited so User B has an SMS.` });
  return id;
}

export function go(j: Journey, screen: ScreenId, params?: Record<string, string>) {
  const s = S();
  s.setJourney(j);
  s.resetTo(screen, params);
}

const READY_B: Partial<BRun> = {
  linkTapped: true,
  installed: true,
  contextRestored: true,
  registered: true,
  eligibility: { eligible: true, segment: "new" },
  attributedOther: false,
  sheetSeen: true,
};

/** Put shared data into the minimum state a screen needs (used by panel Prev/Next and scenario jumps). */
export function prepare(screen: ScreenId): Record<string, string> | undefined {
  const s = S();
  switch (screen) {
    case "a_contacts":
      s.setContactsGranted(true);
      return;
    case "a_preview":
    case "a_sending": {
      if (s.selectedContactIds.length === 0) {
        const free = CONTACTS.find((c) => !s.referrals.some((r) => r.contactId === c.id)) ?? CONTACTS[1];
        s.setSelected([free.id]);
      }
      const ids = S().selectedContactIds.join(",");
      return screen === "a_sending" ? { ids, channel: "sms", n: String(Date.now()) } : { mode: "contacts" };
    }
    case "a_detail":
    case "a_pending":
      return { id: ensureFocus() };
    case "a_unlocked": {
      const id = ensureFocus();
      const r = S().referrals.find((x) => x.id === id)!;
      if (r.rewardA !== "credited") {
        s.rebuild(id, "reward_processing");
        S().applyRewardOutcome(id, "credited", true);
      }
      return { id };
    }
    case "b_sms":
      ensureFocus();
      return;
    case "b_appstore":
      ensureFocus();
      s.setBRun({ installed: false });
      return;
    case "b_launch":
    case "b_register": {
      const id = ensureFocus();
      const r = S().referrals.find((x) => x.id === id)!;
      if (activeLink(r).state !== "active" || !["invited", "link_opened"].includes(r.status)) s.rebuild(id, "link_opened");
      else if (r.status === "invited") s.openLink();
      s.setBRun({ linkTapped: true, installed: true });
      return screen === "b_launch" ? { via: s.scenario.appInstalled ? "deeplink" : "store" } : undefined;
    }
    case "b_eligibility": {
      const id = ensureFocus();
      s.rebuild(id, "accepted");
      s.setBRun({ ...READY_B, eligibility: undefined });
      return;
    }
    case "b_home":
    case "b_plans":
    case "b_payment": {
      const id = ensureFocus();
      const r = S().referrals.find((x) => x.id === id)!;
      if (r.status !== "pending_recharge") s.rebuild(id, "pending_recharge");
      s.setBRun({ ...READY_B, sheetSeen: screen !== "b_home" });
      return screen === "b_payment" ? { plan: "p199" } : undefined;
    }
    case "b_success":
    case "b_complete": {
      const id = ensureFocus();
      s.rebuild(id, "pending_recharge");
      s.setBRun({ ...READY_B });
      S().completeRecharge("p199");
      return { plan: "p199" };
    }
  }
}
