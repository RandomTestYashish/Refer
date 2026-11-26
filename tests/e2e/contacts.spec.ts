import { expect, test } from "@playwright/test";
import { expectScreen, goBack, landing, openAt, ui } from "./helpers";

test.describe("Contact selection", () => {
  test("permission → search → select, deselect, multi-select → continue → back", async ({ page }) => {
    await landing(page);
    await ui(page).getByTestId("invite-friends").click();
    await expectScreen(page, "a_permission");
    await ui(page).getByRole("button", { name: "Allow contacts" }).click();
    await ui(page).getByRole("button", { name: "Allow", exact: true }).click();
    await expectScreen(page, "a_contacts");

    const search = ui(page).getByLabel("Search contacts");
    await search.fill("pri");
    await expect(ui(page).getByRole("button", { name: /Priya Nair/ })).toBeVisible();
    await expect(ui(page).getByRole("button", { name: /Rahul Sharma/ })).toHaveCount(0);

    await ui(page).getByRole("button", { name: /Priya Nair/ }).click();
    await expect(ui(page).getByRole("button", { name: "Continue with 1 friend" })).toBeVisible();
    await ui(page).getByRole("button", { name: /Priya Nair/ }).first().click(); // deselect
    await expect(ui(page).getByRole("button", { name: "Select friends to invite" })).toBeVisible();

    await search.fill("");
    await ui(page).getByRole("button", { name: /Priya Nair/ }).click();
    await ui(page).getByRole("button", { name: /Rahul Sharma/ }).click();
    await ui(page).getByRole("button", { name: "Continue with 2 friends" }).click();
    await expectScreen(page, "a_preview");
    await expect(ui(page).getByRole("tab", { name: /Priya/ })).toBeVisible();

    await goBack(page);
    await expectScreen(page, "a_contacts");
    await expect(ui(page).getByRole("button", { name: "Continue with 2 friends" })).toBeVisible();
  });

  test("permission denied offers settings and a manual share", async ({ page }) => {
    await landing(page, { scenario: { contacts: "deny" } });
    await ui(page).getByTestId("invite-friends").click();
    await ui(page).getByRole("button", { name: "Allow contacts" }).click();
    await ui(page).getByRole("button", { name: "Allow", exact: true }).click();
    await expect(ui(page).getByText("Contacts access denied")).toBeVisible();
    await ui(page).getByRole("button", { name: "Share link manually" }).click();
    await expect(ui(page).getByTestId("creative-preview")).toBeVisible();
  });

  test("empty address book and no search results", async ({ page }) => {
    await openAt(page, [{ id: "a_home" }, { id: "a_landing" }, { id: "a_contacts" }], { contactsGranted: true, scenario: { contacts: "empty" } });
    await expect(ui(page).getByText("No contacts found")).toBeVisible();
    await expect(ui(page).getByRole("button", { name: "Share link instead" })).toBeVisible();
  });

  test("search with no match shows a recovery path", async ({ page }) => {
    await openAt(page, [{ id: "a_home" }, { id: "a_landing" }, { id: "a_contacts" }], { contactsGranted: true });
    await ui(page).getByLabel("Search contacts").fill("zzzz");
    await expect(ui(page).getByText(/Nothing matches/)).toBeVisible();
    await ui(page).getByRole("button", { name: "Clear search" }).last().click();
    await expect(ui(page).getByRole("button", { name: /Rahul Sharma/ })).toBeVisible();
  });
});
