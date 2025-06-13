import { describe, it, expect, vi, beforeEach } from "vitest";
import { OpenRouterService } from "../OpenRouterService";

// Mock import.meta.env
vi.mock("../../../env", () => ({
  default: {
    OPENROUTER_API_KEY: "test-api-key",
  },
}));

describe("OpenRouterService", () => {
  let service: OpenRouterService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new OpenRouterService({
      apiKey: "test-api-key",
      defaultModel: "gpt-4",
    });

    // Reset fetch mock
    global.fetch = vi.fn();
  });

  describe("generateCard", () => {
    it("should successfully generate a card from a topic", async () => {
      // Arrange
      const mockGeneratedCard = {
        question: "What is TypeScript?",
        answer: "TypeScript is a strongly typed programming language that builds on JavaScript.",
        tags: ["programming", "typescript"],
      };

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          id: "test-id",
          object: "chat.completion",
          created: Date.now(),
          model: "gpt-4",
          choices: [
            {
              index: 0,
              message: {
                role: "assistant",
                content: JSON.stringify(mockGeneratedCard),
              },
              finish_reason: "stop",
            },
          ],
          usage: {
            prompt_tokens: 10,
            completion_tokens: 8,
            total_tokens: 18,
          },
        }),
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const command = {
        topic: "TypeScript basics",
        language: "en",
      };

      // Act
      const result = await service.generateCard(command);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        "https://openrouter.ai/api/v1/chat/completions",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer test-api-key",
            "Content-Type": "application/json",
          }),
          body: expect.any(String),
        })
      );

      const mockFetch = global.fetch as unknown as { mock: { calls: [string, { body: string }][] } };
      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(requestBody).toEqual(
        expect.objectContaining({
          messages: [
            {
              role: "system",
              content: expect.stringContaining("Create a single flashcard"),
            },
            {
              role: "user",
              content: command.topic,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: expect.objectContaining({
              name: "FlashcardSchema",
              strict: true,
              schema: expect.objectContaining({
                properties: {
                  question: { type: "string" },
                  answer: { type: "string" },
                  tags: {
                    type: "array",
                    items: { type: "string" },
                  },
                },
                required: ["question", "answer"],
              }),
            }),
          },
        })
      );

      expect(result).toEqual(mockGeneratedCard);
    });

    it("should handle API errors gracefully", async () => {
      // Arrange
      const mockErrorResponse = {
        ok: false,
        status: 429,
        statusText: "Too Many Requests",
      };

      global.fetch = vi.fn().mockResolvedValue(mockErrorResponse);

      const command = {
        topic: "TypeScript basics",
        language: "en",
      };

      // Act & Assert
      await expect(service.generateCard(command)).rejects.toThrow();
    });

    it("should handle malformed API responses", async () => {
      // Arrange
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          id: "test-id",
          object: "chat.completion",
          created: Date.now(),
          model: "gpt-4",
          choices: [
            {
              index: 0,
              message: {
                role: "assistant",
                content: "Invalid JSON",
              },
              finish_reason: "stop",
            },
          ],
          usage: {
            prompt_tokens: 10,
            completion_tokens: 8,
            total_tokens: 18,
          },
        }),
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const command = {
        topic: "TypeScript basics",
        language: "en",
      };

      // Act & Assert
      await expect(service.generateCard(command)).rejects.toThrow("Failed to parse AI response");
    });

    it("should handle empty API responses", async () => {
      // Arrange
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          id: "test-id",
          object: "chat.completion",
          created: Date.now(),
          model: "gpt-4",
          choices: [],
          usage: {
            prompt_tokens: 10,
            completion_tokens: 8,
            total_tokens: 18,
          },
        }),
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const command = {
        topic: "TypeScript basics",
        language: "en",
      };

      // Act & Assert
      await expect(service.generateCard(command)).rejects.toThrow("No response from AI");
    });
  });
});
