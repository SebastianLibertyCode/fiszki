import { z } from "zod";
import { MessageSchema, ChatOptionsSchema, ChatResponseSchema } from "../schemas/openrouter.schema";
import type { Message, ChatOptions, ModelParams, ChatResponse } from "../schemas/openrouter.schema";

/**
 * Custom error classes for OpenRouter service
 */
export class OpenRouterError extends Error {
  constructor(
    message: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = "OpenRouterError";
  }
}

export class ConfigurationError extends OpenRouterError {
  constructor(message: string) {
    super(message, "CONFIGURATION_ERROR");
    this.name = "ConfigurationError";
  }
}

export class AuthenticationError extends OpenRouterError {
  constructor(message: string) {
    super(message, "AUTHENTICATION_ERROR");
    this.name = "AuthenticationError";
  }
}

export class RateLimitError extends OpenRouterError {
  constructor(message: string) {
    super(message, "RATE_LIMIT_ERROR");
    this.name = "RateLimitError";
  }
}

export class TimeoutError extends OpenRouterError {
  constructor(message: string) {
    super(message, "TIMEOUT_ERROR");
    this.name = "TimeoutError";
  }
}

export class ResponseFormatError extends OpenRouterError {
  constructor(message: string) {
    super(message, "RESPONSE_FORMAT_ERROR");
    this.name = "ResponseFormatError";
  }
}

export class SchemaValidationError extends OpenRouterError {
  constructor(message: string) {
    super(message, "SCHEMA_VALIDATION_ERROR");
    this.name = "SchemaValidationError";
  }
}

/**
 * Configuration interface for OpenRouter service
 */
interface OpenRouterConfig {
  apiKey: string;
  baseUrl?: string;
  defaultModel: string;
  defaultParams?: Partial<ModelParams>;
}

/**
 * Default parameters for OpenRouter API requests
 */
const DEFAULT_PARAMS: Required<Pick<ModelParams, "temperature" | "max_tokens">> = {
  temperature: 0.7,
  max_tokens: 1024,
};

/**
 * Service for interacting with OpenRouter API
 * Provides methods for sending chat messages with precise control over:
 * - System and user messages
 * - Response format
 * - Model selection and parameters
 */
export class OpenRouterService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly defaultModel: string;
  private readonly defaultParams: Required<Pick<ModelParams, "temperature" | "max_tokens">> & Partial<ModelParams>;
  private readonly headers: Record<string, string>;

  constructor(config: OpenRouterConfig) {
    // Load API key from environment or config
    this.apiKey = config.apiKey || import.meta.env.OPENROUTER_API_KEY;
    if (!this.apiKey) {
      throw new ConfigurationError("OpenRouter API key is required");
    }

    // Set base configuration
    this.baseUrl = config.baseUrl || "https://openrouter.ai/api";
    this.defaultModel = config.defaultModel;
    this.defaultParams = { ...DEFAULT_PARAMS, ...config.defaultParams };

    // Prepare HTTP headers with authorization
    this.headers = this._buildHeaders();
  }

  /**
   * Builds the default headers for API requests
   * @private
   */
  private _buildHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": import.meta.env.SITE || "http://localhost:3000", // Required by OpenRouter
      "X-Title": "Fiszki App", // App identification
    };
  }

  /**
   * Validates input data against schema and throws SchemaValidationError if invalid
   * @private
   */
  private _validateInput<T>(data: unknown, schema: z.ZodType<T>): T {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new SchemaValidationError(`Validation failed: ${error.errors.map((e) => e.message).join(", ")}`);
      }
      throw error;
    }
  }

  /**
   * Handles API errors and throws appropriate custom errors
   * @private
   */
  private _handleError(error: unknown): never {
    if (error instanceof OpenRouterError) {
      throw error;
    }

    if (error instanceof Response) {
      switch (error.status) {
        case 401:
          throw new AuthenticationError("Invalid API key");
        case 429:
          throw new RateLimitError("Rate limit exceeded");
        case 408:
          throw new TimeoutError("Request timeout");
        default:
          throw new OpenRouterError(`API error: ${error.statusText}`, `HTTP_${error.status}`);
      }
    }

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new TimeoutError("Request timed out");
      }
      if (error.name === "TypeError" && error.message.includes("JSON")) {
        throw new ResponseFormatError("Invalid JSON response from API");
      }
      throw new OpenRouterError(error.message);
    }

    throw new OpenRouterError("Unknown error occurred");
  }

  /**
   * Implements exponential backoff retry logic for API requests
   * @private
   */
  private async _retryWithBackoff<T>(operation: () => Promise<T>, maxRetries = 3, baseDelay = 1000): Promise<T> {
    let lastError: unknown;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        // Don't retry on certain errors
        if (
          error instanceof ConfigurationError ||
          error instanceof AuthenticationError ||
          error instanceof SchemaValidationError
        ) {
          throw error;
        }

        // Only retry on potentially transient errors
        if (
          error instanceof TimeoutError ||
          error instanceof RateLimitError ||
          (error instanceof OpenRouterError && error.code?.startsWith("HTTP_5"))
        ) {
          const delay = baseDelay * Math.pow(2, attempt);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        throw error;
      }
    }

    throw lastError;
  }

  /**
   * Sends a chat request to the OpenRouter API
   * @param messages Array of system and user messages
   * @param options Optional configuration for the request
   * @returns The API response
   */
  public async sendChat(messages: Message[], options?: ChatOptions): Promise<ChatResponse> {
    // Validate input
    const validatedMessages = messages.map((msg) => this._validateInput(msg, MessageSchema));
    if (options) {
      this._validateInput(options, ChatOptionsSchema);
    }

    // Prepare request payload
    const payload = {
      model: options?.model ?? this.defaultModel,
      messages: validatedMessages,
      response_format: options?.responseFormat,
      ...this.defaultParams,
      ...options?.params,
    };

    // Send request with retry logic
    return this._retryWithBackoff(async () => {
      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw response;
      }

      const data = await response.json();
      return this._validateInput(data, ChatResponseSchema);
    });
  }
}
