import { expect, test } from "@playwright/test";
import { goBack, landing, ui } from "./helpers";

test.describe("Referral card", () => {
  test("shows the proposition on the front", async ({ page }) => {
    await landing(page);
    await expect(ui(page).getByRole("heading", { name: /Earn up to ₹5,000\s*a year/ })).toBeVisible();
    const card = ui(page).getByTestId("referral-card");
    await expect(card).toHaveAttribute("data-side", "front");
    await expect(ui(page).getByTestId("card-cap")).toHaveText("₹5,000");
  });

  test("flips to How it works and back, repeatedly (tap, toggle and keyboard)", async ({ page }) => {
    await landing(page);
    const card = ui(page).getByTestId("referral-card");
    await card.click();
    await expect(card).toHaveAttribute("data-side", "back");
    await expect(card.getByText("How it works")).toBeVisible();
    await expect(card.getByText(/Your friend gets ₹25 \+ 2 GB/)).toBeVisible();
    await expect(card.getByText(/They recharge ₹100 or more/)).toBeVisible();

    await ui(page).getByTestId("flip-toggle").click();
    await expect(card).toHaveAttribute("data-side", "front");
    await expect(ui(page).getByTestId("flip-toggle")).toHaveText(/How it works/);

    for (let i = 0; i < 4; i++) await card.click();
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
