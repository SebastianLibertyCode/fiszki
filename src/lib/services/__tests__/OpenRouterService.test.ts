import { describe, it, expect, vi, beforeEach, type MockInstance } from "vitest";
import {
  OpenRouterService,
  ConfigurationError,
  AuthenticationError,
  RateLimitError,
  SchemaValidationError,
} from "../OpenRouterService";
import type { Message } from "../../schemas/openrouter.schema";

describe("OpenRouterService", () => {
  const mockConfig = {
    apiKey: "test-api-key",
    defaultModel: "gpt-4",
  };

  let service: OpenRouterService;
  let fetchSpy: MockInstance;

  beforeEach(() => {
    // Mock fetch globally
    fetchSpy = vi.spyOn(globalThis, "fetch");
    // Reset fetch mock before each test
    fetchSpy.mockReset();
    // Create new service instance
    service = new OpenRouterService(mockConfig);
  });

  describe("constructor", () => {
    it("should throw ConfigurationError when apiKey is missing", () => {
      expect(() => new OpenRouterService({ ...mockConfig, apiKey: "" })).toThrow(ConfigurationError);
    });

    it("should use default baseUrl when not provided", () => {
      expect(service["baseUrl"]).toBe("https://openrouter.ai/api");
    });

    it("should use custom baseUrl when provided", () => {
      const customUrl = "https://custom.api.com";
      const customService = new OpenRouterService({ ...mockConfig, baseUrl: customUrl });
      expect(customService["baseUrl"]).toBe(customUrl);
    });
  });

  describe("sendChat", () => {
    const mockMessages: Message[] = [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "Hello!" },
    ];

    const mockResponse = {
      id: "test-id",
      object: "chat.completion",
      created: Date.now(),
      model: "gpt-4",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: "Hello! How can I help you today?",
          },
          finish_reason: "stop",
        },
      ],
      usage: {
        prompt_tokens: 10,
        completion_tokens: 8,
        total_tokens: 18,
      },
    };

    it("should send request with correct payload", async () => {
      fetchSpy.mockResolvedValueOnce(new Response(JSON.stringify(mockResponse)));

      await service.sendChat(mockMessages);

      expect(fetchSpy).toHaveBeenCalledWith(
        "https://openrouter.ai/api/v1/chat/completions",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer test-api-key",
            "Content-Type": "application/json",
          }),
          body: expect.stringContaining('"messages":'),
        })
      );
    });

    it("should throw AuthenticationError on 401", async () => {
      fetchSpy.mockResolvedValueOnce(new Response("Unauthorized", { status: 401 }));

      await expect(service.sendChat(mockMessages)).rejects.toThrow(AuthenticationError);
    });

    it("should throw RateLimitError on 429", async () => {
      fetchSpy.mockResolvedValueOnce(new Response("Too Many Requests", { status: 429 }));

      await expect(service.sendChat(mockMessages)).rejects.toThrow(RateLimitError);
    });

    it("should retry on timeout", async () => {
      const timeoutError = new Error("timeout");
      timeoutError.name = "AbortError";

      fetchSpy.mockRejectedValueOnce(timeoutError).mockResolvedValueOnce(new Response(JSON.stringify(mockResponse)));

      const result = await service.sendChat(mockMessages);

      expect(fetchSpy).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockResponse);
    });

    it("should throw SchemaValidationError on invalid message", async () => {
      const invalidMessages: { role: "system" | "user"; content: string }[] = [{ role: "system", content: "" }];

      await expect(service.sendChat(invalidMessages)).rejects.toThrow(SchemaValidationError);
    });

    it("should validate response data", async () => {
      const invalidResponse = { ...mockResponse, object: "invalid" };
      fetchSpy.mockResolvedValueOnce(new Response(JSON.stringify(invalidResponse)));

      await expect(service.sendChat(mockMessages)).rejects.toThrow(SchemaValidationError);
    });
  });
});
