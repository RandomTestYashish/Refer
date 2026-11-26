/**
 * End-to-end checks for the Refer a Friend · Pull, Aim & Invite journey.
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
  await page.getByRole("button", { name: "Or choose from your contacts" }).click();
  await page.getByRole("button", { name: "Allow contacts", exact: true }).click();
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

const handleCentre = async (page) => {
  const b = await page.getByTestId("pull-handle").boundingBox();
  return [b.x + b.width / 2, b.y + b.height / 2];
};

(async () => {
  const LANDING = "Refer a Friend — Pull to invite";
  const GRANTED = { extra: { contactsGranted: true } };
  const confirmHeading = (page) => page.getByRole("heading", { name: /^Invite .+\?$/ });

  await test("landing shows proposition, invite card and alternative routes", async (page) => {
    await page.getByRole("heading", { name: /Earn up to ₹5,000 a year/ }).waitFor();
    assert.match(await page.getByTestId("pull-label").innerText(), /^Pull to invite/);
    await page.getByRole("button", { name: "Or choose from your contacts" }).waitFor();
    await page.getByRole("button", { name: "Allow contacts to see your friends here" }).waitFor();
    await shot(page, "01-landing-no-access");
    await page.getByRole("button", { name: "How referrals work" }).click();
    await page.getByText("Sending an invite or your friend registering doesn't earn a reward on its own.").waitFor();
    await page.waitForTimeout(400);
    await shot(page, "02-how-it-works");
  });

  await test("short pull is cancelled and snaps back", async (page) => {
    await pull(page, 0, 30, { release: false });
    assert.equal(await phase(page), "pulling");
    await page.mouse.up();
    assert.equal(await phase(page), "cancelled");
    await page.getByText("Pull a little further to invite").waitFor();
    await page.waitForTimeout(700);
    const t = await page.getByTestId("pull-handle").evaluate((el) => new DOMMatrix(getComputedStyle(el).transform));
    assert.ok(Math.abs(t.m41) < 1 && Math.abs(t.m42) < 1, `card back at rest (${t.m41}, ${t.m42})`);
    assert.equal(await screenName(page), LANDING);
  }, GRANTED);

  await test("aiming: sideways movement moves the beam between friends; Esc cancels", async (page) => {
    const [x, y] = await handleCentre(page);
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x - 60, y + 300, { steps: 10 });
    await page.waitForTimeout(100);
    const left = await page.getByTestId("pull-area").getAttribute("data-aim");
    await page.mouse.move(x + 60, y + 300, { steps: 10 });
    await page.waitForTimeout(100);
    const right = await page.getByTestId("pull-area").getAttribute("data-aim");
    assert.ok(left && right && left !== right, `aim changed (${left} → ${right})`);
    assert.equal(await phase(page), "armed");
    await page.waitForTimeout(300);
    await shot(page, "04-armed-aim");
    await page.keyboard.press("Escape");
    assert.equal(await phase(page), "cancelled");
    await page.mouse.up();
    await page.waitForTimeout(400);
    assert.equal(await screenName(page), LANDING);
  }, GRANTED);

  await test("pull, aim and let go invites the aimed friend", async (page) => {
    await shot(page, "03-landing-friends");
    await pull(page, 0, 300, { release: false });
    assert.equal(await phase(page), "armed");
    const id = await page.getByTestId("pull-area").getAttribute("data-aim");
    const name = (await page.getByTestId(`aim-${id}`).innerText()).split("\n").pop().trim();
    assert.match(await page.getByTestId("pull-label").innerText(), new RegExp(`^Let go to invite ${name}`));
    await page.mouse.up();
    await page.getByRole("heading", { name: `Invite ${name}?` }).waitFor({ timeout: 4000 });
    assert.match(await page.getByTestId("invite-message").innerText(), new RegExp(`^Hey ${name},`));
    await page.waitForTimeout(600);
    await shot(page, "05-confirm");
  }, GRANTED);

  await test("without contact access, letting go asks for permission, then returns to aim", async (page) => {
    await pull(page, 0, 300);
    await page.waitForTimeout(1200);
    assert.equal(await screenName(page), "Contact Permission");
    await page.getByRole("button", { name: "Allow contacts", exact: true }).click();
    await page.getByRole("button", { name: "Allow", exact: true }).click();
    await page.waitForTimeout(600);
    assert.equal(await screenName(page), LANDING);
    await page.getByTestId("aim-c_rahul").waitFor();
  });

  await test("tapping a friend is the non-gesture route", async (page) => {
    await page.getByRole("button", { name: "Invite Priya Nair" }).click();
    await page.getByRole("heading", { name: "Invite Priya?" }).waitFor();
  }, GRANTED);

  await test("tap on the card without dragging teaches the gesture", async (page) => {
    await page.getByTestId("pull-handle").click();
    await page.getByText("Pull the card down, aim, then let go").first().waitFor();
  });

  await test("keyboard: arrows aim, Enter invites", async (page) => {
    await page.getByTestId("pull-handle").focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(150);
    assert.equal(await phase(page), "pulling");
    const id = await page.getByTestId("pull-area").getAttribute("data-aim");
    const name = (await page.getByTestId(`aim-${id}`).innerText()).split("\n").pop().trim();
    await page.keyboard.press("Enter");
    await page.getByRole("heading", { name: `Invite ${name}?` }).waitFor({ timeout: 4000 });
  }, GRANTED);

  await test("touch input: pull and release works", async (page) => {
    const [x, y] = await handleCentre(page);
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
    for (let i = 1; i <= 12; i++) await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y: y + i * 25 }] });
    assert.equal(await phase(page), "armed");
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await confirmHeading(page).waitFor({ timeout: 4000 });
  }, { ...GRANTED, ctx: { hasTouch: true } });

  await test("scaled phone frame (small window): pull still arms", async (page) => {
    await pull(page, 0, 200, { release: false });
    assert.equal(await phase(page), "armed");
    await page.mouse.up();
    await confirmHeading(page).waitFor({ timeout: 4000 });
  }, { ...GRANTED, ctx: { viewport: { width: 390, height: 700 } } });

  await test("reduced motion: gesture still works without spring animation", async (page) => {
    await pull(page, 0, 300);
    await confirmHeading(page).waitFor({ timeout: 2000 });
  }, { ...GRANTED, ctx: { reducedMotion: "reduce" } });

  await test("permission denied shows recovery options", async (page) => {
    await page.getByRole("button", { name: "Or choose from your contacts" }).click();
    await page.getByRole("button", { name: "Allow contacts", exact: true }).click();
    await page.getByRole("button", { name: "Don't Allow" }).click();
    await page.getByText("Contacts access denied").waitFor();
    await page.getByRole("button", { name: "Share link manually" }).waitFor();
  });

  await test("search, no-results and single selection with personalised confirm", async (page) => {
    await toContacts(page);
    await page.getByText("Sample contacts — not your phone's address book").waitFor();
    await page.getByLabel("Search contacts").fill("zzz");
    await page.getByText("Nothing matches “zzz”", { exact: false }).waitFor();
    await page.getByRole("button", { name: "Clear search" }).first().click();
    await page.getByLabel("Search contacts").fill("pri");
    await page.getByRole("checkbox", { name: /Priya Nair/ }).click();
    await page.getByLabel("Search contacts").fill("");
    await page.getByRole("button", { name: "Preview invite for Priya" }).click();
    await page.getByRole("heading", { name: "Invite Priya?" }).waitFor();
    const msg = await page.getByTestId("invite-message").innerText();
    assert.match(msg, /^Hey Priya,/);
    assert.match(msg, /I thought you'd like Airtel\. Join using my referral link and enjoy the benefits!/);
    await page.getByRole("button", { name: "Choose someone else" }).click();
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
    await page.getByRole("button", { name: "Send 2 invites", exact: true }).click();
    await page.locator('[data-phase="success"]').waitFor({ timeout: 6000 });
    await page.getByRole("heading", { name: "2 invites sent" }).waitFor();
    await page.getByText("Simulated", { exact: true }).waitFor();
    await page.getByText("Reward not earned yet.").waitFor();
  });

  await test("single friend: send from the confirm screen", async (page) => {
    await page.getByRole("button", { name: "Invite Rahul Sharma" }).click();
    await page.getByRole("button", { name: "Send Invite (SMS)" }).click();
    await page.locator('[data-phase="success"]').waitFor({ timeout: 6000 });
    await page.getByRole("heading", { name: "Invite sent" }).waitFor();
    await page.waitForTimeout(800);
    await shot(page, "06-sent");
  }, GRANTED);

  await test("partial failure, then retry only the failed invite", async (page) => {
    await toContacts(page);
    for (const n of ["Rahul Sharma", "Priya Nair", "Ankit Verma"]) await page.getByRole("checkbox", { name: new RegExp(n) }).click();
    await page.getByRole("button", { name: "Preview 3 invites" }).click();
    await page.getByRole("button", { name: "Send 3 invites by SMS" }).click();
    await page.getByRole("button", { name: "Send 3 invites", exact: true }).click();
    await page.locator('[data-phase="partial"]').waitFor({ timeout: 6000 });
    await page.getByRole("heading", { name: "2 of 3 invites sent" }).waitFor();
    assert.equal(await page.getByTestId("send-row-c_ankit").getAttribute("data-state"), "failed");
    await page.getByRole("button", { name: /Retry Ankit/ }).click();
    await page.locator('[data-phase="success"]').waitFor({ timeout: 6000 });
    await page.getByRole("heading", { name: "3 invites sent" }).waitFor();
  }, { scenario: { share: "partial" } });

  await test("network failure offers retry and copy-link fallback", async (page) => {
    await page.getByRole("button", { name: "Invite Rahul Sharma" }).click();
    await page.getByRole("button", { name: "Send Invite (SMS)" }).click();
    await page.locator('[data-phase="failure"]').waitFor({ timeout: 6000 });
    await page.getByRole("button", { name: "Copy invite link" }).click();
    await page.getByText(/Link copied|Link ready to paste/).waitFor();
    await page.getByRole("button", { name: "Try again" }).click();
    await page.locator('[data-phase="failure"]').waitFor({ timeout: 6000 });
    await page.getByRole("button", { name: "Back to invite" }).click();
    await page.getByRole("heading", { name: "Invite Rahul?" }).waitFor(); // selection kept
  }, { scenario: { network: "failure" }, extra: { contactsGranted: true } });

  await test("cancel invite from the confirm screen returns to landing", async (page) => {
    await page.getByRole("button", { name: "Invite Rahul Sharma" }).click();
    await page.getByRole("button", { name: "Cancel", exact: true }).click();
    await page.getByRole("button", { name: "Discard invite" }).click();
    await page.waitForTimeout(600);
    assert.equal(await screenName(page), LANDING);
  }, GRANTED);

  await test("empty contacts state", async (page) => {
    await toContacts(page).catch(() => {});
    await page.getByText("No contacts found").first().waitFor();
  }, { scenario: { contacts: "empty" } });

  await test("contacts loading error state", async (page) => {
    await toContacts(page).catch(() => {});
    await page.getByText("Contacts unavailable").first().waitFor();
  }, { scenario: { contacts: "unavailable" } });

  await test("share-link path works without contacts", async (page) => {
    await page.getByRole("button", { name: "How referrals work" }).click();
    await page.getByRole("button", { name: "Share link" }).click();
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
