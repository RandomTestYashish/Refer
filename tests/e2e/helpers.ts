import { expect, type Page } from "@playwright/test";

type Ref = { id: string; params?: Record<string, string> };

/** Boots the prototype directly on a screen stack, with optional persisted state (referrals, scenario, rules…). */
export async function openAt(page: Page, stack: Ref[], state: Record<string, unknown> = {}) {
  const nav = { A: stack.map((s, i) => ({ ...s, key: `t${i}` })), B: [{ id: "b_sms", key: "b0" }] };
  await page.addInitScript(
    ([payload]) => {
      if (sessionStorage.getItem("__seeded")) return; // seed once; later reloads keep app state
      sessionStorage.setItem("__seeded", "1");
      localStorage.setItem("airtel-refer-proto-v1", payload);
    },
    [JSON.stringify({ state: { journey: "A", nav, ...state }, version: 1 })],
  );
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
}

export const landing = (page: Page, state: Record<string, unknown> = {}) => openAt(page, [{ id: "a_home" }, { id: "a_landing" }], state);

export const stored = (page: Page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem("airtel-refer-proto-v1") ?? "{}").state as { referrals: { name: string; channel: string; status: string }[]; nav: { A: { id: string }[] } });

export async function currentScreen(page: Page) {
  const s = await stored(page);
  return s.nav.A[s.nav.A.length - 1].id;
}

export async function expectScreen(page: Page, id: string) {
  await expect.poll(() => currentScreen(page)).toBe(id);
}

/** A referral in a given status — used to create "in progress" / successful history. */
export const referral = (id: string, status: string, contactId = "c_rahul", name = "Rahul Sharma") => ({
  id,
  contactId,
  name,
  phone: "+91 98765 43210",
  channel: "sms",
  createdAt: Date.now(),
  status,
  links: [{ code: "X", url: "https://airtel.in/r/X", createdAt: Date.now(), expiresAt: Date.now() + 864e5, state: "active" }],
  events: [{ kind: "invited", at: Date.now() }],
  delivery: "sent",
  rewardA: "locked",
  rewardB: "locked",
});

/** The app UI only (the simulated phone, or the full-bleed screen on phones) — excludes the developer panel. */
export const ui = (page: Page) => page.locator("[data-phone-screen]");

/** Taps the top-most Back button (the previous screen may still be animating out). */
export const goBack = (page: Page) => ui(page).getByRole("button", { name: "Back" }).last().click();
