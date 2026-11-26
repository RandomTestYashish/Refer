import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests for the Refer a App journeys.
 * Phone-sized projects run the app full-bleed (device mode); "desktop-frame" runs it inside the simulated phone.
 */
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 45_000,
  expect: { timeout: 7_000 },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: { baseURL: "http://localhost:4317", trace: "off", permissions: ["clipboard-read", "clipboard-write"] },
  webServer: { command: "npx vite --port 4317 --strictPort", url: "http://localhost:4317", reuseExistingServer: !process.env.CI, timeout: 60_000 },
  projects: [
    { name: "phone-375x812", use: { viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
    { name: "pixel-7", use: { ...devices["Pixel 7"] } },
    { name: "small-320x568", use: { viewport: { width: 320, height: 568 }, isMobile: true, hasTouch: true } },
    { name: "desktop-frame", use: { viewport: { width: 1280, height: 900 } } },
  ],
});
