import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { server } from "@/test/msw";

// Enable API mocking before tests
beforeAll(() => server.listen());

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished
afterAll(() => server.close());

describe("Example Test Suite", () => {
  it("should demonstrate basic Vitest functionality", () => {
    const sum = (a: number, b: number) => a + b;
    expect(sum(2, 3)).toBe(5);
  });

  it("should work with async code", async () => {
    const asyncFunction = async () => {
      return Promise.resolve("Hello, Vitest!");
    };

    const result = await asyncFunction();
    expect(result).toBe("Hello, Vitest!");
  });

  it("should demonstrate API mocking with MSW", async () => {
    // This test would make a real API call, but MSW intercepts it
    const response = await fetch("/api/decks");
    const data = await response.json();

    expect(response.ok).toBe(true);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty("id");
    expect(data[0]).toHaveProperty("name");
  });
});
