import { expect, test } from "@playwright/test";
import { expectScreen, goBack, landing, stored, ui } from "./helpers";

test.describe("Sharing", () => {
  test("copy link", async ({ page }) => {
    await landing(page);
    await ui(page).getByRole("button", { name: "Copy link" }).click();
    await expect(ui(page).getByText("Link copied")).toBeVisible();
  });

  test("WhatsApp creative: personalise, hand off honestly, then track", async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as { __opened: string[] }).__opened = [];
      window.open = ((url: string) => {
        (window as unknown as { __opened: string[] }).__opened.push(url);
        return {} as Window;
      }) as typeof window.open;
      Object.defineProperty(navigator, "share", { value: undefined, configurable: true });
    });
    await landing(page);
    await ui(page).getByRole("button", { name: "WhatsApp" }).click();
    await expectScreen(page, "a_preview");

    const creative = ui(page).getByTestId("creative-preview");
    await expect(creative).toContainText("Hi there,");
    await ui(page).getByLabel("Friend's name (optional)").fill("Priya");
    await expect(creative).toContainText("Hi Priya,");
    await ui(page).getByRole("radio", { name: /Midnight/ }).click();
    await expect(ui(page).getByTestId("creative-preview").last()).toHaveAttribute("data-theme", "midnight");

    const text = ui(page).getByTestId("share-text");
    await expect(text).toContainText("first recharge of ₹100 or more");
    await expect(text).toContainText("https://airtel.in/r/");

    await ui(page).getByTestId("share-primary").click();
    await expect(ui(page).getByText("Did you send your invite?")).toBeVisible();
    const opened = await page.evaluate(() => (window as unknown as { __opened: string[] }).__opened);
    expect(opened[0]).toMatch(/^https:\/\/wa\.me\/\?text=/);
    expect((await stored(page)).referrals ?? []).toHaveLength(0); // nothing tracked until the user confirms

    await ui(page).getByTestId("confirm-shared").click();
    await expectScreen(page, "a_dashboard");
    const s = await stored(page);
    expect(s.referrals[0]).toMatchObject({ name: "Priya", channel: "whatsapp" });
  });

  test("native share sheet with image when supported", async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as { __shared: unknown[] }).__shared = [];
      Object.defineProperty(navigator, "canShare", { value: () => true, configurable: true });
      Object.defineProperty(navigator, "share", {
        value: async (d: ShareData) => void (window as unknown as { __shared: unknown[] }).__shared.push({ text: d.text, files: d.files?.length ?? 0 }),
        configurable: true,
      });
    });
    await landing(page);
    await ui(page).getByRole("button", { name: "WhatsApp" }).click();
    await ui(page).getByTestId("share-primary").click();
    await expect(ui(page).getByText("Did you send your invite?")).toBeVisible();
    const shared = await page.evaluate(() => (window as unknown as { __shared: { files: number }[] }).__shared);
    expect(shared[0].files).toBe(1);
  });

  test("WhatsApp missing → SMS or copy", async ({ page }) => {
    await landing(page, { scenario: { share: "whatsapp_missing" } });
    await ui(page).getByRole("button", { name: "WhatsApp" }).click();
    await ui(page).getByTestId("share-primary").click();
    await expect(ui(page).getByText("WhatsApp isn't available")).toBeVisible();
    await ui(page).getByRole("button", { name: "Share by SMS" }).click();
    await expect(ui(page).getByRole("button", { name: "Open Messages" })).toBeVisible();
  });

  test("SMS hand-off never claims the message was sent", async ({ page, isMobile }) => {
    await landing(page);
    await ui(page).getByRole("button", { name: "SMS" }).click();
    await ui(page).getByTestId("share-primary").click();
    // Desktop browsers can't open Messages → copy fallback. Phones open the composer → ask before tracking.
    await expect(ui(page).getByText(isMobile ? /Did you send your invite\?|Couldn't open Messages/ : "Couldn't open Messages")).toBeVisible();
    await expect(ui(page).getByText(/invite is sent/i)).toHaveCount(0);
  });

  test("more apps falls back to copying when no share sheet exists", async ({ page }) => {
    await page.addInitScript(() => Object.defineProperty(navigator, "share", { value: undefined, configurable: true }));
    await landing(page);
    await ui(page).getByRole("button", { name: "SMS" }).click();
    await ui(page).getByRole("button", { name: "More apps" }).click();
    await expect(ui(page).getByText("Sharing isn't available here")).toBeVisible();
  });
});
