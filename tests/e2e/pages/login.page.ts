import type { Page, Locator } from "@playwright/test";
import { expect } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel("Email");
    this.passwordInput = page.getByLabel("Password");
    this.loginButton = page.getByRole("button", { name: "Sign in" });
    this.errorMessage = page.getByText("Invalid email or password", { exact: true });
  }

  async goto() {
    await this.page.goto("/login");
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);

    // Wait for both the click and any subsequent navigation or API request
    await Promise.all([
      this.page
        .waitForResponse(
          (response) =>
            response.url().includes("/api/auth/login") ||
            response.url().includes("/api/auth/signin") ||
            response.url().includes("/auth")
        )
        .catch(() => null), // ignore if no API call was made
      this.loginButton.click(),
    ]);

    // Give the app a moment to process the response
    await this.page.waitForTimeout(1000);
  }

  async expectErrorMessage() {
    await expect(this.errorMessage).toBeVisible({ timeout: 5000 });
  }

  async expectSuccessfulLogin() {
    await expect(this.page).toHaveURL("/decks", { timeout: 10000 });
  }
}
