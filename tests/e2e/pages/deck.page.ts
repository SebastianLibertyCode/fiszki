import type { Page, Locator } from "@playwright/test";
import { expect } from "@playwright/test";

export class DeckPage {
  readonly page: Page;
  readonly createDeckButton: Locator;
  readonly deckNameInput: Locator;
  readonly deckDescriptionInput: Locator;
  readonly saveDeckButton: Locator;
  readonly generateCardsButton: Locator;
  readonly cardsContainer: Locator;
  readonly loadingSpinner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createDeckButton = page.getByRole("button", { name: "Create Deck" });
    this.deckNameInput = page.getByLabel("Name");
    this.deckDescriptionInput = page.getByLabel("Description");
    this.saveDeckButton = page.getByRole("button", { name: "Create Deck" });
    this.generateCardsButton = page.getByRole("button", { name: "Generate Cards" });
    this.cardsContainer = page.getByTestId("cards-container");
    this.loadingSpinner = page.getByTestId("loading-spinner");
  }

  async goto() {
    await this.page.goto("/decks");
  }

  async createNewDeck(name: string) {
    await this.createDeckButton.click();
    await this.deckNameInput.fill(name);
    await this.deckDescriptionInput.fill("This is a test deck");
    await this.saveDeckButton.click();
  }

  async generateCards() {
    await this.generateCardsButton.click();
    await this.loadingSpinner.waitFor();
    await this.loadingSpinner.waitFor({ state: "hidden" });
  }

  async expectDeckCreated(name: string) {
    await expect(this.page.getByRole("heading", { name })).toBeVisible();
  }

  async expectCardsGenerated() {
    await expect(this.cardsContainer).not.toBeEmpty();
  }
}
