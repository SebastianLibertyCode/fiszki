import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { DeckDto, CardDto, CategoryDto } from "@/types";

// Mock data
const mockDecks: DeckDto[] = [
  {
    id: "1",
    name: "Test Deck 1",
    description: "Test description",
    card_limit: 100,
    categories: [{ id: "1", name: "Programming" }],
    card_count: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Test Deck 2",
    description: "Another test description",
    card_limit: 50,
    categories: [{ id: "2", name: "Languages" }],
    card_count: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const mockCards: CardDto[] = [
  {
    id: "1",
    deck_id: "1",
    question: "What is React?",
    answer: "A JavaScript library for building user interfaces",
    status: "pending",
    source_fragment: null,
    review_started_at: null,
    review_finished_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    deck_id: "1",
    question: "What is TypeScript?",
    answer: "A typed superset of JavaScript",
    status: "pending",
    source_fragment: null,
    review_started_at: null,
    review_finished_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const mockCategories: CategoryDto[] = [
  {
    id: "1",
    name: "Programming",
  },
  {
    id: "2",
    name: "Languages",
  },
];

// MSW handlers
export const handlers = [
  // Auth endpoints
  http.post("/api/auth/login", () => {
    return HttpResponse.json({
      user: { id: "user1", email: "test@user.com" },
      session: { access_token: "mock-token" },
    });
  }),

  http.post("/api/auth/register", () => {
    return HttpResponse.json({
      user: { id: "user1", email: "test@user.com" },
      session: { access_token: "mock-token" },
    });
  }),

  http.post("/api/auth/logout", () => {
    return HttpResponse.json({ success: true });
  }),

  // Decks endpoints
  http.get("/api/decks", () => {
    return HttpResponse.json(mockDecks);
  }),

  http.get("/api/decks/:id", ({ params }) => {
    const deck = mockDecks.find((d) => d.id === params.id);
    if (!deck) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(deck);
  }),

  http.post("/api/decks", async ({ request }) => {
    const body = (await request.json()) as Partial<DeckDto>;
    const newDeck: DeckDto = {
      id: Date.now().toString(),
      name: body.name || "New Deck",
      description: body.description || "",
      card_limit: body.card_limit || 100,
      categories: body.categories || [],
      card_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return HttpResponse.json(newDeck, { status: 201 });
  }),

  http.put("/api/decks/:id", async ({ params, request }) => {
    const body = (await request.json()) as Partial<DeckDto>;
    const deckIndex = mockDecks.findIndex((d) => d.id === params.id);
    if (deckIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    const updatedDeck = {
      ...mockDecks[deckIndex],
      ...body,
      updated_at: new Date().toISOString(),
    };

    return HttpResponse.json(updatedDeck);
  }),

  http.delete("/api/decks/:id", ({ params }) => {
    const deckIndex = mockDecks.findIndex((d) => d.id === params.id);
    if (deckIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json({ success: true });
  }),

  // Cards endpoints
  http.get("/api/decks/:deckId/cards", ({ params }) => {
    const deckCards = mockCards.filter((c) => c.deck_id === params.deckId);
    return HttpResponse.json(deckCards);
  }),

  http.post("/api/decks/:deckId/cards", async ({ params, request }) => {
    const body = (await request.json()) as Partial<CardDto>;
    const newCard: CardDto = {
      id: Date.now().toString(),
      deck_id: params.deckId as string,
      question: body.question || "New Question",
      answer: body.answer || "New Answer",
      status: "pending",
      source_fragment: null,
      review_started_at: null,
      review_finished_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return HttpResponse.json(newCard, { status: 201 });
  }),

  // Categories endpoints
  http.get("/api/categories", () => {
    return HttpResponse.json(mockCategories);
  }),

  // OpenRouter AI endpoint
  http.post("https://openrouter.ai/api/v1/chat/completions", () => {
    return HttpResponse.json({
      choices: [
        {
          message: {
            content: JSON.stringify([
              {
                question: "What is AI?",
                answer: "Artificial Intelligence is the simulation of human intelligence in machines.",
                difficulty: "medium",
                tags: ["ai", "technology"],
              },
            ]),
          },
        },
      ],
    });
  }),
];

// Setup MSW server
export const server = setupServer(...handlers);

// Export utilities for tests
export { mockDecks, mockCards, mockCategories };
