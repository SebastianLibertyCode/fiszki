import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCards } from "../useCards";

describe("useCards", () => {
  const mockDeckId = "test-deck-id";

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("should load cards for a deck", async () => {
    // Arrange
    const mockCards = [
      { id: "1", question: "Test Q1", answer: "Test A1", deck_id: mockDeckId },
      { id: "2", question: "Test Q2", answer: "Test A2", deck_id: mockDeckId },
    ];

    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        data: mockCards,
        error: null,
      }),
    };

    global.fetch = vi.fn().mockResolvedValue(mockResponse);

    // Act
    const { result } = renderHook(() => useCards(mockDeckId));
    await act(async () => {
      await result.current.refetch();
    });

    // Assert
    expect(global.fetch).toHaveBeenCalledWith(`/api/decks/${mockDeckId}/cards?page=1&limit=50`);
    expect(result.current.cards).toEqual(mockCards);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should handle card creation", async () => {
    // Arrange
    const newCard = {
      question: "New Question",
      answer: "New Answer",
    };

    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        data: { ...newCard, id: "new-card-id", deck_id: mockDeckId },
        error: null,
      }),
    };

    global.fetch = vi.fn().mockResolvedValue(mockResponse);

    // Act
    const { result } = renderHook(() => useCards(mockDeckId));
    await act(async () => {
      await result.current.addCard(newCard);
    });

    // Assert
    expect(global.fetch).toHaveBeenCalledWith(
      `/api/decks/${mockDeckId}/cards`,
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCard),
      })
    );
  });

  it("should handle errors during card loading", async () => {
    // Arrange
    const mockError = {
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: vi.fn().mockResolvedValue({
        error: { message: "Failed to fetch cards" },
      }),
    };

    global.fetch = vi.fn().mockResolvedValue(mockError);

    // Act
    const { result } = renderHook(() => useCards(mockDeckId));
    await act(async () => {
      await result.current.refetch();
    });

    // Assert
    expect(result.current.error).toEqual(new Error("Failed to fetch cards: Internal Server Error"));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.cards).toEqual([]);
  });
});
