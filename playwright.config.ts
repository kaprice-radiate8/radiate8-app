/**
 * BROWSER TESTS
 * Run with:  npm test
 * They build nothing themselves: run `npm run build` first. The tests start
 * the built app, open it at phone size, and walk through the main flows.
 */
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3100",
    ...devices["Pixel 7"],
    // On machines with a pre-installed Chromium, point to it (otherwise Playwright's own is used).
    launchOptions: process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {},
  },
  webServer: {
    command: "npx next start -p 3100",
    url: "http://localhost:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
