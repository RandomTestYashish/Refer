/**
 * End-to-end checks for the Refer a App · Pull, Aim & Invite journey.
 *
 * Uses the Playwright runtime (no test-runner dependency added to the project).
 *   npm run dev            # in one terminal (or set BASE_URL)
 *   npm run test:e2e       # node tests/e2e/refer-flow.cjs
 * Set SHOTS=<dir> to also save screenshots of the key states.
 */
const { chromium } = require("playwright");
const assert = require("node:assert/strict");

const BASE = process.env.BASE_URL || "http://localhost:5173/";
const SHOTS = process.env.SHOTS;
const results = [];

/** Seed persisted prototype state so each case starts on the landing screen with a given scenario. */
function seed(scenario = {}, extra = {}) {
  return {
    state: {
      journey: "A",
      nav: { A: [{ id: "a_home", key: "h" }, { id: "a_landing", key: "l" }], B: [{ id: "b_sms", key: "b" }] },
      scenario,
      ...extra,
    },
    version: 1,
  };
}

async function open(browser, { scenario, extra, ctx = {} } = {}) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 1000 }, ...ctx });
  await context.addInitScript((s) => localStorage.setItem("airtel-refer-proto-v1", JSON.stringify(s)), seed(scenario, extra));
  const page = await context.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(BASE);
  await page.getByTestId("pull-handle").waitFor();
  await page.waitForTimeout(1900); // let the one-time idle nudge finish
  return { context, page, errors };
}

const screenName = (page) => page.getByTestId("screen-name").innerText();
const phase = (page) => page.getByTestId("pull-area").getAttribute("data-phase");
const shot = async (page, name) => SHOTS && page.locator("[data-phone-screen]").screenshot({ path: `${SHOTS}/${name}.png` });

/** Drag the invitation handle by (dx, dy) screen pixels; optionally keep the pointer down. */
async function pull(page, dx, dy, { release = true } = {}) {
  const b = await page.getByTestId("pull-handle").boundingBox();
  const x = b.x + b.width / 2;
  const y = b.y + b.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx / 2, y + dy / 2, { steps: 6 });
  await page.mouse.move(x + dx, y + dy, { steps: 6 });
  await page.waitForTimeout(120);
  if (release) await page.mouse.up();
}

async function toContacts(page) {
  await page.getByRole("button", { name: "Choose contacts" }).click();
  await page.getByRole("button", { name: "Allow contacts" }).click();
  await page.getByRole("button", { name: "Allow", exact: true }).click();
  await page.getByRole("checkbox", { name: /Rahul Sharma/ }).waitFor();
}

async function test(name, fn, opts) {
  const browser = await chromium.launch();
  let env;
  try {
    env = await open(browser, opts);
    await fn(env.page, env);
    assert.deepEqual(env.errors, [], "console errors: " + env.errors.join(" | ").slice(0, 400));
    results.push(["PASS", name]);
  } catch (e) {
    results.push(["FAIL", name, e.message.split("\n")[0]]);
    if (env && SHOTS) await shot(env.page, `FAIL-${name.replace(/\W+/g, "_")}`).catch(() => {});
  } finally {
    await browser.close();
  }
}

(async () => {
  await test("landing shows proposition, pull affordance and alternative CTA", async (page) => {
    await page.getByRole("heading", { name: /Earn up to ₹5,000 a year/ }).waitFor();
    assert.equal(await page.getByTestId("pull-label").innerText().then((t) => t.split("\n")[0]), "Pull down to invite");
    await page.getByRole("button", { name: "Choose contacts" }).waitFor();
    await page.getByRole("button", { name: /Share your link instead/ }).waitFor();
    await shot(page, "01-landing");
    await page.getByRole("button", { name: /How referrals work/ }).click();
    await page.getByText("Sending an invite or your friend registering doesn't earn a reward on its own.").waitFor();
    await shot(page, "02-how-it-works");
  });

  await test("short pull is cancelled and snaps back", async (page) => {
    await pull(page, 0, 60, { release: false });
    assert.equal(await phase(page), "pulling");
    await shot(page, "03-pulling");
    await page.mouse.up();
    assert.equal(await phase(page), "cancelled");
    await page.getByText("Pull a little further to invite").waitFor();
    await page.waitForTimeout(700);
    const t = await page.getByTestId("pull-handle").evaluate((el) => new DOMMatrix(getComputedStyle(el).transform));
    assert.ok(Math.abs(t.m41) < 1 && Math.abs(t.m42) < 1, `handle back at rest (${t.m41}, ${t.m42})`);
    assert.equal(await screenName(page), "Refer a App — Pull to invite");
  });

  await test("pulling off-target asks to aim, and does not trigger", async (page) => {
    await pull(page, 260, 380, { release: false });
    await page.getByText("Aim at your contacts").waitFor();
    await page.mouse.up();
    assert.equal(await phase(page), "cancelled");
    assert.equal(await screenName(page), "Refer a App — Pull to invite");
  });

  await test("Escape cancels an in-progress pull", async (page) => {
    await pull(page, 0, 380, { release: false });
    assert.equal(await phase(page), "armed");
    await page.keyboard.press("Escape");
    assert.equal(await phase(page), "cancelled");
    await page.mouse.up();
    await page.waitForTimeout(500);
    assert.equal(await screenName(page), "Refer a App — Pull to invite");
  });

  await test("full pull reaches threshold, releases and opens contact permission", async (page) => {
    await pull(page, 0, 380, { release: false });
    assert.equal(await phase(page), "armed");
    await page.getByText("Release to choose contacts").waitFor();
    await page.waitForTimeout(400); await shot(page, "04-armed");
    await page.mouse.up();
    await page.waitForTimeout(1200);
    assert.equal(await screenName(page), "Contact Permission");
    await shot(page, "05-permission");
  });

  await test("tap without dragging teaches the gesture", async (page) => {
    await page.getByTestId("pull-handle").click();
    await page.getByText("Drag the invite down to your contacts").waitFor();
  });

  await test("keyboard: Enter on the handle opens contacts", async (page) => {
    await page.getByTestId("pull-handle").focus();
    await page.keyboard.press("ArrowDown");
    assert.equal(await phase(page), "pulling");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(1000);
    assert.equal(await screenName(page), "Contact Permission");
  });

  await test("touch input: pull and release works", async (page) => {
    const b = await page.getByTestId("pull-handle").boundingBox();
    const cdp = await page.context().newCDPSession(page);
    const x = b.x + b.width / 2;
    const y = b.y + b.height / 2;
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
    for (let i = 1; i <= 12; i++) await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y: y + i * 32 }] });
    assert.equal(await phase(page), "armed");
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await page.waitForTimeout(1200);
    assert.equal(await screenName(page), "Contact Permission");
  }, { ctx: { hasTouch: true } });

  await test("scaled phone frame (small window): pull still reaches threshold", async (page) => {
    await pull(page, 0, 300, { release: false });
    assert.equal(await phase(page), "armed");
    await page.mouse.up();
    await page.waitForTimeout(1200);
    assert.equal(await screenName(page), "Contact Permission");
  }, { ctx: { viewport: { width: 390, height: 700 } } });

  await test("reduced motion: gesture still works without spring animation", async (page) => {
    await pull(page, 0, 380);
    await page.waitForTimeout(600);
    assert.equal(await screenName(page), "Contact Permission");
  }, { ctx: { reducedMotion: "reduce" } });

  await test("permission denied shows recovery options", async (page) => {
    await page.getByRole("button", { name: "Choose contacts" }).click();
    await page.getByRole("button", { name: "Allow contacts" }).click();
    await page.getByRole("button", { name: "Don't Allow" }).click();
    await page.getByText("Contacts access denied").waitFor();
    await page.getByRole("button", { name: "Share link manually" }).waitFor();
    await shot(page, "06-permission-denied");
  });

  await test("search, no-results and single selection with personalised preview", async (page) => {
    await toContacts(page);
    await page.getByText("Sample contacts — not your phone's address book").waitFor();
    await page.getByLabel("Search contacts").fill("zzz");
    await page.getByText("Nothing matches “zzz”", { exact: false }).waitFor();
    await shot(page, "07-no-results");
    await page.getByRole("button", { name: "Clear search" }).first().click();
    await page.getByLabel("Search contacts").fill("pri");
    await page.getByRole("checkbox", { name: /Priya Nair/ }).click();
    await page.getByLabel("Search contacts").fill("");
    await page.getByRole("button", { name: "Preview invite for Priya" }).click();
    const msg = await page.getByTestId("invite-message").innerText();
    assert.match(msg, /^Hey Priya,/);
    assert.match(msg, /I thought you'd like Airtel\. Join using my referral link and enjoy the benefits!/);
    await shot(page, "08-preview-single");
    // back preserves the selection
    await page.getByRole("button", { name: "Change" }).click();
    await page.getByText("1 friend selected").waitFor();
    assert.equal(await page.getByRole("checkbox", { name: /Priya Nair/ }).getAttribute("aria-checked"), "true");
  });

  await test("multi-select: remove, clear, bulk confirm and simulated success", async (page) => {
    await toContacts(page);
    for (const n of ["Rahul Sharma", "Priya Nair", "Ankit Verma"]) await page.getByRole("checkbox", { name: new RegExp(n) }).click();
    await page.getByText("3 friends selected").waitFor();
    await page.getByRole("button", { name: "Remove Ankit Verma" }).click();
    await page.getByText("2 friends selected").waitFor();
    await page.getByRole("button", { name: "Clear all" }).click();
    await page.getByRole("button", { name: "Select friends to invite" }).waitFor();
    for (const n of ["Rahul Sharma", "Priya Nair", "Ankit Verma"]) await page.getByRole("checkbox", { name: new RegExp(n) }).click();
    await page.getByRole("button", { name: "Preview 3 invites" }).click();
    await page.getByRole("button", { name: "Preview message for Priya Nair" }).click();
    assert.match(await page.getByTestId("invite-message").innerText(), /^Hey Priya,/);
    await page.getByRole("button", { name: "Remove Ankit Verma" }).click();
    await page.getByRole("button", { name: "Send 2 invites by SMS" }).click();
    await page.getByRole("heading", { name: "Send 2 invites?" }).waitFor();
    await page.waitForTimeout(400); await shot(page, "09-bulk-confirm");
    await page.getByRole("button", { name: "Send 2 invites", exact: true }).click();
    await page.locator('[data-phase="success"]').waitFor({ timeout: 6000 });
    await page.getByRole("heading", { name: "2 invites sent" }).waitFor();
    await page.getByText("Simulated", { exact: true }).waitFor();
    await page.getByText("Reward not earned yet.").waitFor();
    await page.waitForTimeout(800); await shot(page, "10-success");
  });

  await test("partial failure, then retry only the failed invite", async (page) => {
    await toContacts(page);
    for (const n of ["Rahul Sharma", "Priya Nair", "Ankit Verma"]) await page.getByRole("checkbox", { name: new RegExp(n) }).click();
    await page.getByRole("button", { name: "Preview 3 invites" }).click();
    await page.getByRole("button", { name: "Send 3 invites by SMS" }).click();
    await page.getByRole("button", { name: "Send 3 invites", exact: true }).click();
    await page.locator('[data-phase="partial"]').waitFor({ timeout: 6000 });
    await page.getByRole("heading", { name: "2 of 3 invites sent" }).waitFor();
    assert.equal(await page.getByTestId("send-row-c_ankit").getAttribute("data-state"), "failed");
    await shot(page, "11-partial");
    await page.getByRole("button", { name: /Retry Ankit/ }).click();
    await page.locator('[data-phase="success"]').waitFor({ timeout: 6000 });
    await page.getByRole("heading", { name: "3 invites sent" }).waitFor();
  }, { scenario: { share: "partial" } });

  await test("network failure offers retry and copy-link fallback", async (page) => {
    await toContacts(page);
    await page.getByRole("checkbox", { name: /Rahul Sharma/ }).click();
    await page.getByRole("button", { name: "Preview invite for Rahul" }).click();
    await page.getByRole("button", { name: "Send invite to Rahul" }).click();
    await page.locator('[data-phase="failure"]').waitFor({ timeout: 6000 });
    await shot(page, "12-failure");
    await page.getByRole("button", { name: "Copy invite link" }).click();
    await page.getByText(/Link copied|Link ready to paste/).waitFor();
    await page.getByRole("button", { name: "Try again" }).click();
    await page.locator('[data-phase="failure"]').waitFor({ timeout: 6000 });
    await page.getByRole("button", { name: "Back to invite" }).click();
    await page.getByRole("button", { name: "Send invite to Rahul" }).waitFor(); // selection kept
  }, { scenario: { network: "failure" } });

  await test("cancel invite from preview clears selection and returns to landing", async (page) => {
    await toContacts(page);
    await page.getByRole("checkbox", { name: /Rahul Sharma/ }).click();
    await page.getByRole("button", { name: "Preview invite for Rahul" }).click();
    await page.getByRole("button", { name: "Cancel", exact: true }).click();
    await page.getByRole("button", { name: "Discard invite" }).click();
    await page.waitForTimeout(600);
    assert.equal(await screenName(page), "Refer a App — Pull to invite");
  });

  await test("empty and unavailable contact states", async (page) => {
    await toContacts(page).catch(() => {});
    await page.getByText("No contacts found").first().waitFor();
  }, { scenario: { contacts: "empty" } });

  await test("contacts loading error state", async (page) => {
    await toContacts(page).catch(() => {});
    await page.getByText("Contacts unavailable").first().waitFor();
  }, { scenario: { contacts: "unavailable" } });

  await test("share-link path works without contacts", async (page) => {
    await page.getByRole("button", { name: /Share your link instead/ }).click();
    assert.match(await page.getByTestId("invite-message").innerText(), /^Hey,/);
    await page.getByRole("button", { name: "Send by SMS" }).click();
    await page.locator('[data-phase="success"]').waitFor({ timeout: 6000 });
    await page.getByRole("heading", { name: "Invite ready to share" }).waitFor();
  });

  for (const r of results) console.log(r.join("  "));
  const failed = results.filter((r) => r[0] === "FAIL").length;
  console.log(`\n${results.length - failed}/${results.length} passed`);
  process.exit(failed ? 1 : 0);
})();
