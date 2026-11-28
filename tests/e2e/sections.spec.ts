import { expect, test } from "@playwright/test";
import { expectScreen, goBack, landing, openAt, ui } from "./helpers";

test.describe("Supporting sections & quality", () => {
  test("header reads Refer Airtel App and there is no social-proof line", async ({ page }) => {
    await landing(page);
    await expect(ui(page).getByRole("heading", { name: "Refer Airtel App" })).toBeVisible();
    await expect(ui(page).getByTestId("social-proof")).toHaveCount(0);
  });

  test("FAQ and Terms are separate, working accordions; footer present", async ({ page }) => {
    await landing(page);
    const faqs = ui(page).getByRole("button", { name: "FAQs", exact: true });
    await faqs.scrollIntoViewIfNeeded();
    await faqs.click();
    await expect(faqs).toHaveAttribute("aria-expanded", "true");
    const q = ui(page).getByRole("button", { name: "Does downloading the app count?" });
    await q.scrollIntoViewIfNeeded();
    await expect(q).toHaveAttribute("aria-expanded", "false");
    await q.click();
    await expect(q).toHaveAttribute("aria-expanded", "true");
    await expect(ui(page).getByText("Installing or signing up alone doesn't unlock a reward.")).toBeVisible();
    await q.click();
    await expect(q).toHaveAttribute("aria-expanded", "false");

    const t = ui(page).getByRole("button", { name: "Terms & conditions" });
    await t.click();
    await expect(ui(page).getByText(/first recharge of ₹100 or more for the offer to activate/)).toBeVisible();
    await expect(ui(page).getByText(/Refer more\.\s*Earn more\./)).toBeVisible();
  });

  test("help sheet opens FAQs", async ({ page }) => {
    await landing(page);
    await ui(page).getByRole("button", { name: "Help" }).click();
    await ui(page).getByRole("button", { name: "Read FAQs" }).click();
    await expect(ui(page).getByRole("button", { name: "Who can I invite?" })).toHaveAttribute("aria-expanded", "true");
  });

  test("home banner opens Refer a App", async ({ page }) => {
    await openAt(page, [{ id: "a_home" }]);
    const banner = ui(page).getByTestId("home-refer-banner");
    await banner.scrollIntoViewIfNeeded();
    await banner.click();
    await expectScreen(page, "a_landing");
  });

  test("every landing CTA leads somewhere", async ({ page }) => {
    await landing(page);
    await ui(page).getByRole("button", { name: "Help" }).click();
    await ui(page).getByRole("button", { name: "My referrals" }).click();
    await expectScreen(page, "a_dashboard");
    await goBack(page);
    await expectScreen(page, "a_landing");
    await ui(page).getByRole("button", { name: "Start inviting" }).click();
    await expect(ui(page).getByTestId("contacts-prompt")).toBeVisible();
    await ui(page).getByRole("button", { name: "Don't Allow", exact: true }).click();
    await expectScreen(page, "a_permission");
    await goBack(page);
    await goBack(page);
    await expectScreen(page, "a_home");
  });

  test("keyboard: reach and operate the card, toggle and accordions", async ({ page, isMobile }) => {
    test.skip(isMobile, "keyboard navigation checked on desktop");
    await landing(page);
    const card = ui(page).getByTestId("referral-card");
    for (let i = 0; i < 12 && !(await card.evaluate((el) => el === document.activeElement)); i++) await page.keyboard.press("Tab");
    await expect(card).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(card).toHaveAttribute("data-side", "back");
    const toggle = ui(page).getByTestId("flip-toggle");
    for (let i = 0; i < 4 && !(await toggle.evaluate((el) => el === document.activeElement)); i++) await page.keyboard.press("Tab");
    await expect(toggle).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(card).toHaveAttribute("data-side", "front");
  });

  test("reduced motion: card flips and envelope intro without animation", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openAt(page, [{ id: "a_home" }, { id: "a_landing" }, { id: "a_preview", params: { mode: "contacts" } }], { selectedContactIds: ["c_priya"], contactsGranted: true });
    await expect(ui(page).getByTestId("invite-envelope")).toHaveAttribute("data-step", "3");
    await expect(ui(page).getByTestId("confirm-send")).toBeEnabled({ timeout: 1000 });
  });

  test("offline banner on the landing page", async ({ page, context }) => {
    await landing(page);
    await context.setOffline(true);
    await expect(ui(page).getByTestId("offline-banner")).toBeVisible();
    await expect(ui(page).getByTestId("invite-friends")).toBeDisabled();
    await context.setOffline(false);
    await expect(ui(page).getByTestId("offline-banner")).toHaveCount(0);
  });

  test("layout fits the screen with no horizontal scroll", async ({ page }) => {
    await landing(page);
    const overflow = await page.evaluate(() => {
      const screen = document.querySelector("[data-phone-screen]") as HTMLElement;
      const bodies = [...screen.querySelectorAll<HTMLElement>(".overflow-y-auto")];
      return { page: document.documentElement.scrollWidth - document.documentElement.clientWidth, inner: bodies.map((b) => b.scrollWidth - b.clientWidth) };
    });
    expect(overflow.page).toBeLessThanOrEqual(0);
    for (const v of overflow.inner) expect(v).toBeLessThanOrEqual(0);
  });
});
