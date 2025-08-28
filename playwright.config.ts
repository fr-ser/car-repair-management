import { defineConfig, devices } from "@playwright/test";

const PORT =
  process.env.PLAYWRIGHT_BACKEND_PORT || process.env.HTTP_PORT || 8080;

export default defineConfig({
  testDir: "./tests/e2e",
  /* Run tests in files in parallel */
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: `http://localhost:${PORT}`,
    httpCredentials: {
      username: "admin",
      password: "local1",
    },
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "make install build run-server-production",
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    stdout: process.env.CI ? "pipe" : "ignore",
  },
});
