import { defineConfig, devices } from "@playwright/test";
import { loadEnv } from "vite";

const { PUBLIC_SITE_URL } = loadEnv("test", process.cwd(), "");

export default defineConfig({
  testDir: "./tests/e2e",

  forbidOnly: !!process.env.CI,
  fullyParallel: true,
  reporter: process.env.CI ? "dot" : [["list"], ["html", { open: "never" }]],
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "chromium-mobile", use: { ...devices["Galaxy S24"] } },
    { name: "webkit-mobile", use: { ...devices["iPhone 15"] } },
  ],

  use: {
    baseURL: PUBLIC_SITE_URL,
    trace: "on-first-retry",
  },

  webServer: {
    command: "npm run preview",
    reuseExistingServer: !process.env.CI,
    url: PUBLIC_SITE_URL,
  },
});
