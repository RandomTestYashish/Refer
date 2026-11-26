import { expect, test } from "@playwright/test";
import { expectScreen, goBack, openAt, stored, ui } from "./helpers";

const envelopeAt = (page: import("@playwright/test").Page, ids: string[], state: Record<string, unknown> = {}) =>
  openAt(page, [{ id: "a_home" }, { id: "a_landing" }, { id: "a_contacts" }, { id: "a_preview", params: { mode: "contacts" } }], {
    contactsGranted: true,
    selectedContactIds: ids,
    ...state,
  });

test.describe("Personalised invitation", () => {
  test("envelope intro, personal message, confirm, send animation, success", async ({ page }) => {
    await envelopeAt(page, ["c_priya"]);
    const env = ui(page).getByTestId("invite-envelope");
    await expect(env).toBeVisible();
    await expect(ui(page).getByTestId("envelope-message")).toContainText("Hi Priya,");
    await expect(ui(page).getByTestId("envelope-message")).toContainText("Aarav invited you to try Airtel!");

    // Nothing is sent before confirmation.
    expect((await stored(page)).referrals ?? []).toHaveLength(0);
    await expect(ui(page).getByTestId("invite-sent")).toHaveCount(0);

    const send = ui(page).getByTestId("confirm-send");
    await expect(send).toBeEnabled();
    await expect(send).toHaveText(/Send invite to Priya/);
    await send.click();
    await expect(env).toHaveAttribute("data-stage", /sealing|flying/);
    await expect(ui(page).getByTestId("invite-sent")).toBeVisible({ timeout: 8000 });
    await expect(ui(page).getByRole("heading", { name: "Your invite is sent!" })).toBeVisible();
    await expect(ui(page).getByText(/SMS is simulated/)).toBeVisible();

    const s = await stored(page);
    expect(s.referrals).toHaveLength(1);
    expect(s.referrals[0].name).toBe("Priya Nair");

    await ui(page).getByRole("button", { name: "Track in My referrals" }).click();
    await expectScreen(page, "a_dashboard");
  });

  test("multiple friends: preview switches name, sends one invite each", async ({ page }) => {
    await envelopeAt(page, ["c_priya", "c_rahul", "c_neha"]);
    await expect(ui(page).getByTestId("envelope-message")).toContainText("Hi Priya,");
    await ui(page).getByRole("tab", { name: /Rahul/ }).click();
    await expect(ui(page).getByTestId("envelope-message")).toContainText("Hi Rahul,");
    await ui(page).getByTestId("confirm-send").click();
    await expect(ui(page).getByTestId("invite-sent")).toBeVisible({ timeout: 8000 });
    expect((await stored(page)).referrals).toHaveLength(3);
  });

  test("failure shows nothing was sent, retry succeeds", async ({ page }) => {
    await envelopeAt(page, ["c_priya"], { scenario: { network: "failure" } });
    await ui(page).getByTestId("confirm-send").click();
    await expect(ui(page).getByText("Couldn't send your invite")).toBeVisible();
    expect((await stored(page)).referrals ?? []).toHaveLength(0);
    // Recover the network (the developer panel's "Network: Success" switch).
    await page.evaluate(async () => {
      const mod = await import("/src/store/useProto.ts");
      mod.useProto.getState().setScenario({ network: "success" });
    });
    await ui(page).getByRole("button", { name: "Try again" }).click();
    await expect(ui(page).getByTestId("confirm-send")).toBeEnabled();
    await ui(page).getByTestId("confirm-send").click();
    await expect(ui(page).getByTestId("invite-sent")).toBeVisible({ timeout: 8000 });
  });

  test("offline: invites are blocked with a clear message", async ({ page, context }) => {
    await envelopeAt(page, ["c_priya"]);
    await context.setOffline(true);
    await expect(ui(page).getByText("You're offline. Connect to send your invite.")).toBeVisible();
    await expect(ui(page).getByTestId("confirm-send")).toBeDisabled();
    await context.setOffline(false);
    await expect(ui(page).getByTestId("confirm-send")).toBeEnabled();
  });
});
