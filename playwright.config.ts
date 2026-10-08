import { defineConfig, devices } from "@playwright/test";
const channel =
  process.env.PLAYWRIGHT_CHANNEL ||
  (process.platform === "win32" ? "msedge" : undefined);
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30000,
  use: {
    baseURL: "http://127.0.0.1:4173",
    channel,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], channel },
    },
    {
      name: "mobile",
      use: {
        ...devices["iPhone 13"],
        defaultBrowserType: "chromium",
        channel,
      },
    },
  ],
  webServer: {
    command: "npm run preview -- --port 4173 --strictPort",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
  },
});
