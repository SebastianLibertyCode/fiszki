import { test } from "@playwright/test";
import { LoginPage } from "./pages/login.page";

test.describe("Authentication and Deck Management", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
  });

  test("should show validation error for invalid login credentials", async () => {
    await loginPage.goto();
    await loginPage.login("invalid@email.com", "wrongpassword");
    await loginPage.expectErrorMessage();
  });

  test("should successfully login with valid credentials", async () => {
    await loginPage.goto();
    await loginPage.login("test@user.com", "Q1w2e3");
    await loginPage.expectSuccessfulLogin();
  });
});
