import { describe, it, expect, vi, beforeEach } from "vitest";
import { DeckService } from "../deck.service";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../db/database.types";

describe("DeckService", () => {
  let mockSupabase: SupabaseClient<Database>;
  let deckService: DeckService;
  const TEST_USER_ID = "test-user-id";

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn(),
    } as unknown as SupabaseClient<Database>;

    deckService = new DeckService(mockSupabase);
  });

  describe("createDeck", () => {
    it("should successfully create a deck with valid data", async () => {
      // Arrange
      const mockDeckData = {
        name: "Test Deck",
        description: "Test Description",
        card_limit: null,
      };

      const mockDeckResponse = {
        data: { ...mockDeckData, id: "test-deck-id", user_id: TEST_USER_ID },
        error: null,
      };

      const mockCategoriesResponse = {
        data: [],
        error: null,
      };

      const mockInsert = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue(mockDeckResponse);
      const mockIn = vi.fn().mockResolvedValue(mockCategoriesResponse);

      (mockSupabase.from as ReturnType<typeof vi.fn>).mockImplementation((table) => {
        if (table === "categories") {
          return {
            select: mockSelect,
            in: mockIn,
          };
        }
        return {
          insert: mockInsert,
          select: mockSelect,
          single: mockSingle,
        };
      });

      // Act
      const result = await deckService.createDeck(mockDeckData, TEST_USER_ID);

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith("decks");
      expect(mockInsert).toHaveBeenCalledWith({
        ...mockDeckData,
        user_id: TEST_USER_ID,
      });
      expect(result).toEqual({
        ...mockDeckResponse.data,
        categories: [],
      });
    });

    it("should throw an error when deck name is empty", async () => {
      // Arrange
      const invalidDeckData = {
        name: "",
        description: "Test Description",
        card_limit: null,
      };

      // Act & Assert
      await expect(deckService.createDeck(invalidDeckData, TEST_USER_ID)).rejects.toThrow("Deck name is required");
    });

    it("should handle Supabase error gracefully", async () => {
      // Arrange
      const mockDeckData = {
        name: "Test Deck",
        description: "Test Description",
        card_limit: null,
      };

      const mockError = {
        data: null,
        error: { message: "Database error" },
      };

      const mockInsert = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue(mockError);

      (mockSupabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        insert: mockInsert,
        select: mockSelect,
        single: mockSingle,
      });

      // Act & Assert
      await expect(deckService.createDeck(mockDeckData, TEST_USER_ID)).rejects.toThrow(
        "Failed to create deck: Database error"
      );
    });
  });
});
