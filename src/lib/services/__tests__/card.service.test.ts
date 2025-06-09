import { describe, it, expect, vi, beforeEach } from "vitest";
import { CardService } from "../card.service";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../db/database.types";

describe("CardService", () => {
  let mockSupabase: SupabaseClient<Database>;
  let cardService: CardService;

  beforeEach(() => {
    // Create a mock Supabase client
    mockSupabase = {
      from: vi.fn(),
    } as unknown as SupabaseClient<Database>;

    cardService = new CardService(mockSupabase);
  });

  describe("getCards", () => {
    it("should fetch cards with pagination and filtering", async () => {
      const mockResponse = {
        data: [
          {
            id: "1",
            deck_id: "deck-1",
            question: "Test question",
            answer: "Test answer",
            status: "pending",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
        count: 1,
        error: null,
      };

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockReturnThis();
      const mockRange = vi.fn().mockResolvedValue(mockResponse);

      (mockSupabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: (...args: unknown[]) => {
          mockSelect(...args);
          return {
            eq: (field: string, value: string) => {
              mockEq(field, value);
              return {
                order: (field: string, options: unknown) => {
                  mockOrder(field, options);
                  return {
                    range: (start: number, end: number) => {
                      mockRange(start, end);
                      return {
                        eq: (field: string, value: string) => {
                          mockEq(field, value);
                          return mockResponse;
                        },
                      };
                    },
                  };
                },
              };
            },
          };
        },
      });

      const result = await cardService.getCards("deck-1", { status: "pending" }, 1, 10);

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(mockSupabase.from).toHaveBeenCalledWith("cards");
      expect(mockSelect).toHaveBeenCalledWith("*", { count: "exact" });
      expect(mockEq).toHaveBeenCalledWith("deck_id", "deck-1");
      expect(mockOrder).toHaveBeenCalledWith("created_at", { ascending: false });
      expect(mockRange).toHaveBeenCalledWith(0, 9);
      expect(mockEq).toHaveBeenCalledWith("status", "pending");
    });
  });

  describe("createCard", () => {
    it("should create a new card", async () => {
      const mockCard = {
        id: "1",
        deck_id: "deck-1",
        question: "Test question",
        answer: "Test answer",
        status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockInsert = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({ data: mockCard, error: null });

      const mockChain = {
        insert: mockInsert,
        select: mockSelect,
        single: mockSingle,
      };

      (mockSupabase.from as ReturnType<typeof vi.fn>).mockReturnValue(mockChain);

      const result = await cardService.createCard("deck-1", {
        question: "Test question",
        answer: "Test answer",
      });

      expect(result).toEqual(mockCard);
      expect(mockSupabase.from).toHaveBeenCalledWith("cards");
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          deck_id: "deck-1",
          question: "Test question",
          answer: "Test answer",
          status: "pending",
        })
      );
    });
  });

  describe("updateCard", () => {
    it("should update an existing card", async () => {
      const mockCard = {
        id: "1",
        deck_id: "deck-1",
        question: "Updated question",
        answer: "Updated answer",
        status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({ data: mockCard, error: null });

      const mockChain = {
        update: mockUpdate,
        eq: mockEq,
        select: mockSelect,
        single: mockSingle,
      };

      (mockSupabase.from as ReturnType<typeof vi.fn>).mockReturnValue(mockChain);

      const result = await cardService.updateCard("deck-1", "1", {
        question: "Updated question",
        answer: "Updated answer",
      });

      expect(result).toEqual(mockCard);
      expect(mockSupabase.from).toHaveBeenCalledWith("cards");
      expect(mockUpdate).toHaveBeenCalledWith({
        question: "Updated question",
        answer: "Updated answer",
      });
      expect(mockEq).toHaveBeenCalledWith("deck_id", "deck-1");
      expect(mockEq).toHaveBeenCalledWith("id", "1");
    });
  });

  describe("deleteCard", () => {
    it("should delete a card", async () => {
      const mockDelete = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockFinalEq = vi.fn().mockResolvedValue({ error: null });

      const mockChain = {
        delete: mockDelete,
        eq: mockEq,
      };

      mockEq.mockImplementation((key: string) => {
        if (key === "id") {
          return { eq: mockFinalEq };
        }
        return mockChain;
      });

      (mockSupabase.from as ReturnType<typeof vi.fn>).mockReturnValue(mockChain);

      await expect(cardService.deleteCard("deck-1", "1")).resolves.not.toThrow();
      expect(mockSupabase.from).toHaveBeenCalledWith("cards");
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith("deck_id", "deck-1");
      expect(mockEq).toHaveBeenCalledWith("id", "1");
    });
  });

  describe("updateCardStatus", () => {
    it("should update card status", async () => {
      const mockCard = {
        id: "1",
        deck_id: "deck-1",
        status: "accepted",
        review_finished_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({ data: mockCard, error: null });

      const mockChain = {
        update: mockUpdate,
        eq: mockEq,
        select: mockSelect,
        single: mockSingle,
      };

      (mockSupabase.from as ReturnType<typeof vi.fn>).mockReturnValue(mockChain);

      const result = await cardService.updateCardStatus("deck-1", "1", { status: "accepted" });

      expect(result).toEqual(mockCard);
      expect(mockSupabase.from).toHaveBeenCalledWith("cards");
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "accepted",
          review_finished_at: expect.any(String),
        })
      );
      expect(mockEq).toHaveBeenCalledWith("deck_id", "deck-1");
      expect(mockEq).toHaveBeenCalledWith("id", "1");
    });
  });
});
