import { test, expect } from "@playwright/test";

// Requires a seeded database (`npm run seed`) and the production build
// running (`npm run build && npm run start`, which playwright.config.ts's
// webServer does automatically). Credentials come from the same env vars
// the seed script reads, so this test exercises the real login flow against
// a real account rather than a mock.
const SUPER_ADMIN_EMAIL = process.env.SEED_SUPER_ADMIN_EMAIL ?? "superadmin@jnvsmartconnect.in";
const SUPER_ADMIN_PASSWORD = process.env.SEED_SUPER_ADMIN_PASSWORD ?? "ChangeMe123!";

test("unauthenticated visitors are redirected to /login", async ({ page }) => {
  await page.goto("/dashboard/students");
  await expect(page).toHaveURL(/\/login/);
});

test("rejects an invalid password without navigating away from /login", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(SUPER_ADMIN_EMAIL);
  await page.getByLabel("Password").fill("definitely-the-wrong-password");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page.getByText(/invalid email or password/i)).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});

test("signs in with valid credentials and reaches the dashboard", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(SUPER_ADMIN_EMAIL);
  await page.getByLabel("Password").fill(SUPER_ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByText(/welcome back/i)).toBeVisible();
});
