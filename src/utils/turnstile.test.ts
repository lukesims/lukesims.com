import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import config from "~/config";

import { TurnstileError, validateTurnstile } from "./turnstile";

vi.mock("node:crypto", () => ({
  randomUUID: vi.fn(() => "test-uuid-1234"),
}));

vi.mock(import("~/config"), async (importOriginal) => {
  const original = await importOriginal();
  return {
    default: {
      ...original.default,
      turnstile: {
        ...original.default.turnstile,
        timeoutFactor: 1,
      },
    },
  };
});

describe("validateTurnstile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("TURNSTILE_SECRET_KEY", "test-secret-key");
    vi.stubEnv("NODE_ENV", "development");
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("validates successfully with valid token", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValue({
        success: true,
        challenge_ts: "2025-12-17T10:00:00Z",
        hostname: "example.com",
        action: "login",
        cdata: "test-cdata",
      }),
    } as unknown as Response);

    await expect(
      validateTurnstile("test-token", "192.168.1.1"),
    ).resolves.not.toThrow();
  });

  it("passes with matching action in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValue({
        success: true,
        challenge_ts: "2025-12-17T10:00:00Z",
        hostname: "example.com",
        action: "login",
        cdata: "test-cdata",
      }),
    } as unknown as Response);

    await expect(
      validateTurnstile("test-token", "192.168.1.1", "login"),
    ).resolves.not.toThrow();
  });

  it("passes with matching hostname in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValue({
        success: true,
        challenge_ts: "2025-12-17T10:00:00Z",
        hostname: "example.com",
        action: "login",
        cdata: "test-cdata",
      }),
    } as unknown as Response);

    await expect(
      validateTurnstile("test-token", "192.168.1.1", undefined, "example.com"),
    ).resolves.not.toThrow();
  });

  it("passes with both matching action and hostname in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValue({
        success: true,
        challenge_ts: "2025-12-17T10:00:00Z",
        hostname: "example.com",
        action: "login",
        cdata: "test-cdata",
      }),
    } as unknown as Response);

    await expect(
      validateTurnstile("test-token", "192.168.1.1", "login", "example.com"),
    ).resolves.not.toThrow();
  });

  it("skips action validation in development mode", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValue({
        success: true,
        challenge_ts: "2025-12-17T10:00:00Z",
        hostname: "example.com",
        action: "different-action",
        cdata: "test-cdata",
      }),
    } as unknown as Response);

    await expect(
      validateTurnstile("test-token", "192.168.1.1", "login"),
    ).resolves.not.toThrow();
  });

  it("skips hostname validation in development mode", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValue({
        success: true,
        challenge_ts: "2025-12-17T10:00:00Z",
        hostname: "different.com",
        action: "login",
        cdata: "test-cdata",
      }),
    } as unknown as Response);

    await expect(
      validateTurnstile("test-token", "192.168.1.1", undefined, "example.com"),
    ).resolves.not.toThrow();
  });

  it("throws TurnstileError for bad-request", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValue({
        success: false,
        "error-codes": ["bad-request"],
      }),
    } as unknown as Response);

    try {
      await validateTurnstile("test-token", "192.168.1.1");
      expect.fail("Should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(TurnstileError);
      const err = error as TurnstileError;
      expect(err.message).toContain("request was malformed");
      expect(err.shouldRetry).toBe(false);
    }
  });

  it("throws TurnstileError for internal-error with shouldRetry", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValue({
        success: false,
        "error-codes": ["internal-error"],
      }),
    } as unknown as Response);

    try {
      await validateTurnstile("test-token", "192.168.1.1");
      expect.fail("Should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(TurnstileError);
      const err = error as TurnstileError;
      expect(err.message).toContain("internal error occurred");
      expect(err.shouldRetry).toBe(true);
    }
  });

  it("throws TurnstileError for invalid-input-response with shouldRetry", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValue({
        success: false,
        "error-codes": ["invalid-input-response"],
      }),
    } as unknown as Response);

    try {
      await validateTurnstile("test-token", "192.168.1.1");
      expect.fail("Should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(TurnstileError);
      const err = error as TurnstileError;
      expect(err.message).toContain("token parameter is invalid");
      expect(err.shouldRetry).toBe(true);
    }
  });

  it("throws TurnstileError for invalid-input-secret", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValue({
        success: false,
        "error-codes": ["invalid-input-secret"],
      }),
    } as unknown as Response);

    try {
      await validateTurnstile("test-token", "192.168.1.1");
      expect.fail("Should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(TurnstileError);
      const err = error as TurnstileError;
      expect(err.message).toContain("secret parameter is invalid");
      expect(err.shouldRetry).toBe(false);
    }
  });

  it("throws TurnstileError for missing-input-response", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValue({
        success: false,
        "error-codes": ["missing-input-response"],
      }),
    } as unknown as Response);

    try {
      await validateTurnstile("test-token", "192.168.1.1");
      expect.fail("Should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(TurnstileError);
      const err = error as TurnstileError;
      expect(err.message).toContain("token parameter was not provided");
      expect(err.shouldRetry).toBe(false);
    }
  });

  it("throws TurnstileError for missing-input-secret", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValue({
        success: false,
        "error-codes": ["missing-input-secret"],
      }),
    } as unknown as Response);

    try {
      await validateTurnstile("test-token", "192.168.1.1");
      expect.fail("Should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(TurnstileError);
      const err = error as TurnstileError;
      expect(err.message).toContain("secret parameter was not provided");
      expect(err.shouldRetry).toBe(false);
    }
  });

  it("throws TurnstileError for timeout-or-duplicate with shouldRetry", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValue({
        success: false,
        "error-codes": ["timeout-or-duplicate"],
      }),
    } as unknown as Response);

    try {
      await validateTurnstile("test-token", "192.168.1.1");
      expect.fail("Should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(TurnstileError);
      const err = error as TurnstileError;
      expect(err.message).toContain("token has already been validated");
      expect(err.shouldRetry).toBe(true);
    }
  });

  it("throws error for first error code when multiple present", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValue({
        success: false,
        "error-codes": ["bad-request", "internal-error"],
      }),
    } as unknown as Response);

    try {
      await validateTurnstile("test-token", "192.168.1.1");
      expect.fail("Should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(TurnstileError);
      const err = error as TurnstileError;
      expect(err.message).toContain("request was malformed");
      expect(err.shouldRetry).toBe(false);
    }
  });

  it("throws error when action doesn't match in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("MODE", "production");
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValue({
        success: true,
        challenge_ts: "2025-12-17T10:00:00Z",
        hostname: "example.com",
        action: "logout",
        cdata: "test-cdata",
      }),
    } as unknown as Response);

    try {
      await validateTurnstile("test-token", "192.168.1.1", "login");
      expect.fail("Should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(TurnstileError);
      const err = error as TurnstileError;
      expect(err.message).toContain("Unexpected action in Turnstile response");
      expect(err.shouldRetry).toBe(true);
    }
  });

  it("throws error when hostname doesn't match in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("MODE", "production");
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValue({
        success: true,
        challenge_ts: "2025-12-17T10:00:00Z",
        hostname: "different.com",
        action: "login",
        cdata: "test-cdata",
      }),
    } as unknown as Response);

    try {
      await validateTurnstile("token", "192.168.1.1", "login", "example.com");
      expect.fail("Should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(TurnstileError);
      const err = error as TurnstileError;
      expect(err.message).toContain(
        "Unexpected hostname in Turnstile response",
      );
      expect(err.shouldRetry).toBe(true);
    }
  });

  it("retries on network error", async () => {
    vi.useFakeTimers();
    vi.mocked(global.fetch)
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          success: true,
          challenge_ts: "2025-12-17T10:00:00Z",
          hostname: "example.com",
          action: "login",
          cdata: "test-cdata",
        }),
      } as unknown as Response);

    const promise = validateTurnstile("test-token", "192.168.1.1");
    await vi.runAllTimersAsync();
    await expect(promise).resolves.not.toThrow();
    expect(global.fetch).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it("retries on non-ok response", async () => {
    vi.useFakeTimers();
    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: false,
        json: vi.fn(),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          success: true,
          challenge_ts: "2025-12-17T10:00:00Z",
          hostname: "example.com",
          action: "login",
          cdata: "test-cdata",
        }),
      } as unknown as Response);

    const promise = validateTurnstile("test-token", "192.168.1.1");
    await vi.runAllTimersAsync();
    await expect(promise).resolves.not.toThrow();
    expect(global.fetch).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it("doesn't retry for successful response", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValue({
        success: true,
        challenge_ts: "2025-12-17T10:00:00Z",
        hostname: "example.com",
        action: "login",
        cdata: "test-cdata",
      }),
    } as unknown as Response);

    await validateTurnstile("test-token", "192.168.1.1");
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("throws final result after max attempts", async () => {
    vi.mocked(global.fetch)
      .mockRejectedValueOnce(new Error("Network error 1"))
      .mockRejectedValueOnce(new Error("Network error 2"))
      .mockRejectedValueOnce(new Error("Network error 3"));

    await expect(
      validateTurnstile("test-token", "192.168.1.1"),
    ).rejects.toThrow();
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  it("uses exponential backoff timing", async () => {
    const setTimeoutSpy = vi.spyOn(global, "setTimeout");
    vi.mocked(global.fetch).mockRejectedValue(new Error("Network error"));
    await expect(validateTurnstile("test", "192.168.1.1")).rejects.toThrow();
    const setTimeoutCalls = setTimeoutSpy.mock.calls;
    expect(setTimeoutCalls.length).toBe(2);
    expect(setTimeoutCalls[0][1]).toBe(2 * config.turnstile.timeoutFactor);
    expect(setTimeoutCalls[1][1]).toBe(4 * config.turnstile.timeoutFactor);
  });

  it("includes response property in TurnstileError", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValue({
        success: false,
        "error-codes": ["bad-request"],
      }),
    } as unknown as Response);

    try {
      await validateTurnstile("test-token", "192.168.1.1");
    } catch (error) {
      expect(error).toBeInstanceOf(TurnstileError);
      const err = error as TurnstileError;
      expect(err.response).toBeDefined();
      expect(err.response.success).toBe(false);
    }
  });
});
