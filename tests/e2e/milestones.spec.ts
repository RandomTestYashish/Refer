import { expect, test } from "@playwright/test";
import { goBack, landing, referral, ui } from "./helpers";

const ALL = ["bronze", "silver", "gold", "platinum"];

test.describe("Milestones", () => {
  test("new user: everything locked; flip explains reward and next step", async ({ page }) => {
    await landing(page);
    for (const id of ALL) await expect(ui(page).getByTestId(`badge-${id}`)).toHaveAttribute("data-status", "locked");
    await expect(ui(page).getByTestId("milestone-summary")).toContainText("0 of 4 badges");

    const bronze = ui(page).getByTestId("badge-bronze");
    await bronze.scrollIntoViewIfNeeded();
    await bronze.click();
    await expect(bronze).toHaveAttribute("data-side", "back");
    await expect(bronze).toContainText("₹25 reward");
    await expect(bronze).toContainText("1 more successful referral to unlock.");
    await expect(bronze).toContainText("Next: Silver at 5");

    const silver = ui(page).getByTestId("badge-silver");
    await silver.click();
    await expect(silver).toContainText("Reward to be announced");

    const plat = ui(page).getByTestId("badge-platinum");
    await plat.click();
    await expect(plat).toContainText("₹200 reward");
    await expect(plat).toContainText("Highest tier you can reach this month");

    await bronze.click();
    await expect(bronze).toHaveAttribute("data-side", "front");
  });

  test("pending: a friend in progress could earn the next tier", async ({ page }) => {
    await landing(page, { referrals: [referral("r1", "pending_recharge")] });
    await expect(ui(page).getByTestId("badge-bronze")).toHaveAttribute("data-status", "pending");
    await ui(page).getByTestId("badge-bronze").click();
    await expect(ui(page).getByTestId("badge-bronze")).toContainText("1 friend is on the way");
  });

  test("earning Bronze celebrates once", async ({ page }) => {
    await landing(page, { pastSuccesses: 1 });
    const dlg = ui(page).getByTestId("unlock-celebration");
    await expect(dlg).toBeVisible();
    await expect(dlg).toContainText("Bronze badge earned");
    await ui(page).getByRole("button", { name: "Close" }).click();
    await expect(dlg).toHaveCount(0);
    await expect(ui(page).getByTestId("badge-bronze")).toHaveAttribute("data-status", "earned");
    await page.reload();
    await page.waitForTimeout(900);
    await expect(dlg).toHaveCount(0);
  });

  test("monthly boundary: progress stops at Platinum", async ({ page }) => {
    await landing(page, { pastSuccesses: 42, celebrated: ALL });
    for (const id of ALL) await expect(ui(page).getByTestId(`badge-${id}`)).toHaveAttribute("data-status", "earned");
    await expect(ui(page).getByTestId("milestone-summary")).toContainText("4 of 4 badges");
    await expect(ui(page).getByTestId("milestones")).toContainText("30 successful referrals this month");
    await expect(ui(page).getByTestId("milestones")).toContainText("You've reached Platinum, the highest tier");
  });
});
