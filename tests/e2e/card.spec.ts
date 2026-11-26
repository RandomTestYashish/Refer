import { expect, test } from "@playwright/test";
import { goBack, landing, ui } from "./helpers";

test.describe("Referral card", () => {
  test("shows the proposition on the front", async ({ page }) => {
    await landing(page);
    await expect(ui(page).getByRole("heading", { name: /earn up to ₹5,000\s*a year/i })).toBeVisible();
    const card = ui(page).getByTestId("referral-card");
    await expect(card).toHaveAttribute("data-side", "front");
    await expect(ui(page).getByTestId("logo-coin")).toHaveAttribute("data-face", "logo");
  });

  test("logo coin tosses between faces without flipping the card", async ({ page }) => {
    await landing(page);
    const card = ui(page).getByTestId("referral-card");
    const coin = ui(page).getByTestId("logo-coin");
    await coin.click();
    await expect(coin).toHaveAttribute("data-face", "reward");
    await expect(coin).toContainText("₹25");
    await expect(card).toHaveAttribute("data-side", "front");
    await coin.click();
    await expect(coin).toHaveAttribute("data-face", "logo");
    await coin.focus();
    await page.keyboard.press("Enter");
    await expect(coin).toHaveAttribute("data-face", "reward");
    await expect(card).toHaveAttribute("data-side", "front");
  });

  test("flips to How it works and back, repeatedly (tap, toggle and keyboard)", async ({ page }) => {
    await landing(page);
    const card = ui(page).getByTestId("referral-card");
    await card.click({ position: { x: 20, y: 20 } });
    await expect(card).toHaveAttribute("data-side", "back");
    await expect(card.getByText("How it works")).toBeVisible();
    await expect(card.getByText(/Your friend gets ₹25 \+ 2 GB/)).toBeVisible();
    await expect(card.getByText(/They recharge ₹100 or more/)).toBeVisible();

    await ui(page).getByTestId("flip-toggle").click();
    await expect(card).toHaveAttribute("data-side", "front");
    await expect(ui(page).getByTestId("flip-toggle")).toHaveText(/How it works/);

    for (let i = 0; i < 4; i++) await card.click({ position: { x: 20, y: 20 } });
    await expect(card).toHaveAttribute("data-side", "front");

    await card.focus();
    await page.keyboard.press("Enter");
    await expect(card).toHaveAttribute("data-side", "back");
    await page.keyboard.press(" ");
    await expect(card).toHaveAttribute("data-side", "front");
  });

  test("tilts toward the pointer", async ({ page, isMobile }) => {
    test.skip(isMobile, "hover tilt is a pointer interaction; touch tilt follows the finger while pressed");
    await landing(page);
    const card = ui(page).getByTestId("referral-card");
    const box = (await card.boundingBox())!;
    const before = await card.evaluate((el) => getComputedStyle(el).transform);
    await page.mouse.move(box.x + box.width * 0.9, box.y + box.height * 0.2);
    await page.waitForTimeout(400);
    const after = await card.evaluate((el) => getComputedStyle(el).transform);
    expect(after).not.toBe(before);
  });
});
