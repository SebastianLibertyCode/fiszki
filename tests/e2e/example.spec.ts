import { test, expect } from "@playwright/test";

test.describe("Example E2E Tests", () => {
  test("should load the homepage", async ({ page }) => {
    await page.goto("/");

    // Check if the page loaded successfully
    await expect(page).toHaveTitle(/Fiszki/);

    // Take a screenshot for visual comparison
    await expect(page).toHaveScreenshot("homepage.png");
  });

  test("should navigate between pages", async ({ page }) => {
    await page.goto("/");

    // Example: Click on a navigation link (adjust selector based on actual UI)
    // await page.click('[data-testid="nav-decks"]');
    // await expect(page).toHaveURL(/\/decks/);

    // For now, just verify the page loads
    await expect(page.locator("body")).toBeVisible();
  });

  test("should handle authentication flow", async ({ page }) => {
    await page.goto("/login");

    // Example authentication test (adjust based on actual UI)
    // await page.fill('[data-testid="email-input"]', 'test@user.com');
    // await page.fill('[data-testid="password-input"]', 'password123');
    // await page.click('[data-testid="login-button"]');

    // For now, just verify the login page loads
    await expect(page.locator("body")).toBeVisible();
  });

  test("should be responsive on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    await expect(page.locator("body")).toBeVisible();

    // Take mobile screenshot
    await expect(page).toHaveScreenshot("homepage-mobile.png");
  });
});
