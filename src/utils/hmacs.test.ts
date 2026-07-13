import { randomBytes } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createHmac, verifyHmac } from "./hmacs";

const mockEnv = vi.hoisted(() => ({
  HMAC_KEY: "test-key",
  HMAC_ALGO: "sha256",
}));

vi.mock("astro:env/server", () => mockEnv);

describe("createHmac", () => {
  beforeEach(() => {
    mockEnv.HMAC_KEY = "test-key";
    mockEnv.HMAC_ALGO = "sha256";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns HMACs as hexadecimal strings", () => {
    const result = createHmac("test data");
    expect(typeof result).toBe("string");
    expect(result).toMatch(/^[a-f0-9]+$/i);
  });

  it("returns the same HMAC for the same input", () => {
    const hmacs = Array.from({ length: 10 }, () => createHmac("foo"));
    const uniqueHmacs = [...new Set(hmacs)];
    expect(hmacs.length).toBe(10);
    expect(uniqueHmacs.length).toBe(1);
  });

  it("returns different HMACs for different inputs", () => {
    const hmacs = Array.from({ length: 10 }, () =>
      createHmac(randomBytes(8).toString()),
    );
    const uniqueHmacs = [...new Set(hmacs)];
    expect(uniqueHmacs.length).toBe(10);
  });

  it("handles very long input strings", () => {
    const result = createHmac("x".repeat(10000));
    expect(result).toBeDefined();
    expect(result).toMatch(/^[0-9a-f]{64}$/);
  });

  it("handles special characters", () => {
    const result = createHmac("!@#$%^&*()_+-=[]{}|;:',.<>?/~`\"");
    expect(result).toBeDefined();
    expect(result).toMatch(/^[0-9a-f]{64}$/);
  });

  it("handles unicode characters", () => {
    const result = createHmac("Hello 世界 🌍 مرحبا мир");
    expect(result).toBeDefined();
    expect(result).toMatch(/^[0-9a-f]{64}$/);
  });

  it("handles numeric strings as strings not values", () => {
    const hmac1 = createHmac("123");
    const hmac2 = createHmac("0123");
    expect(hmac1).not.toMatch(hmac2);
  });

  it("handles whitespace characters", () => {
    const result = createHmac("line1\nline2\ttab\rcarriage");
    expect(result).toBeDefined();
    expect(result).toMatch(/^[0-9a-f]{64}$/);
  });

  it("uses HMAC_ALGO as the digest algorithm when defined", () => {
    mockEnv.HMAC_ALGO = "md5";
    expect(createHmac("foo").length).toBe(32);
    mockEnv.HMAC_ALGO = "sha1";
    expect(createHmac("foo").length).toBe(40);
    mockEnv.HMAC_ALGO = "sha256";
    expect(createHmac("foo").length).toBe(64);
  });

  it("uses sha256 as the default digest algorithm", () => {
    const defaultHmac = createHmac("foo");
    mockEnv.HMAC_ALGO = "sha256";
    const sha256Hmac = createHmac("foo");
    expect(defaultHmac).toBe(sha256Hmac);
  });

  it("uses HMAC_KEY as the secret key", () => {
    const hmacs = Array.from({ length: 10 }, () => {
      mockEnv.HMAC_KEY = randomBytes(4).toString("hex");
      return createHmac("foo");
    });
    const uniqueHmacs = [...new Set(hmacs)];
    expect(uniqueHmacs.length).toBe(hmacs.length);
  });

  it("does not expose the key or data in the output", () => {
    for (let i = 0; i < 10; i++) {
      const key = randomBytes(4).toString("hex");
      const data = randomBytes(4).toString("hex");
      mockEnv.HMAC_KEY = key;
      const hmac = createHmac(data);
      expect(hmac).not.toContain(key);
      expect(hmac).not.toContain(data);
    }
  });

  it("throws when HMAC_KEY is not set", () => {
    mockEnv.HMAC_KEY = "";
    expect(() => createHmac("test")).toThrow("HMAC_KEY must be set");
    mockEnv.HMAC_KEY = undefined as unknown as string;
    expect(() => createHmac("test")).toThrow("HMAC_KEY must be set");
  });

  it("throws for empty inputs", () => {
    const err = "data must be provided";
    expect(() => createHmac("")).toThrow(err);
    expect(() => createHmac(null as unknown as string)).toThrow(err);
    expect(() => createHmac(undefined as unknown as string)).toThrow(err);
  });
});

describe("verifyHmac", () => {
  it("returns true for correct data and matching HMAC", () => {
    const data = "test data";
    expect(verifyHmac(data, createHmac(data))).toBe(true);
  });

  it("returns false when data differs from original", () => {
    expect(verifyHmac("foo", createHmac("bar"))).toBe(false);
  });

  it("returns false when HMAC is modified", () => {
    const data = "test data";
    const hmac = createHmac(data);
    expect(verifyHmac(data, hmac.slice(32) + hmac.slice(0, 32))).toBe(false);
  });

  it("returns false for invalid HMAC", () => {
    expect(verifyHmac("test data", "not-a-valid-hex-string")).toBe(false);
  });

  it("returns false if any of the inputs are empty", () => {
    const hmac = createHmac("data");
    const emptyValues = ["", undefined, null] as string[];
    emptyValues.forEach((emptyValue) => {
      expect(verifyHmac(emptyValue, hmac)).toBe(false);
      expect(verifyHmac("data", emptyValue)).toBe(false);
      emptyValues.forEach((emptyValue2) => {
        expect(verifyHmac(emptyValue, emptyValue2)).toBe(false);
      });
    });
  });

  it("is case-sensitive", () => {
    expect(verifyHmac("testdata", createHmac("TestData"))).toBe(false);
  });

  it("is whitespace-sensitive", () => {
    const hmac = createHmac("test data");
    expect(verifyHmac("test  data", hmac)).toBe(false);
    expect(verifyHmac(" test data", hmac)).toBe(false);
    expect(verifyHmac("test data ", hmac)).toBe(false);
  });

  it("handles very long data strings", () => {
    const longData = "x".repeat(10000);
    expect(verifyHmac(longData, createHmac(longData))).toBe(true);
  });

  it("handles special characters", () => {
    const data = "test!@#$%^&*()_+-=[]{}|;:',.<>?/~`\"";
    expect(verifyHmac(data, createHmac(data))).toBe(true);
  });

  it("handles unicode characters", () => {
    const unicodeData = "Hello 世界 🌍 مرحبا мир";
    const hmac = createHmac(unicodeData);
    expect(verifyHmac(unicodeData, hmac)).toBe(true);
    expect(verifyHmac("Hello 世界 مرحبا мир", hmac)).toBe(false);
  });

  it("handles whitespace characters", () => {
    const dataWithNewlines = "line1\nline2\ttab\rcarriage";
    const hmac = createHmac(dataWithNewlines);
    expect(verifyHmac(dataWithNewlines, hmac)).toBe(true);
    expect(verifyHmac("line1line2tabtab", hmac)).toBe(false);
  });

  it("gracefully handles errors from timingSafeEqual", () => {
    const data = "test data";
    // Different input lengths would ordinarily cause timingSafeEqual to throw
    expect(() => verifyHmac(data, "x")).not.toThrow();
    expect(verifyHmac(data, "x")).toBe(false);
  });
});
