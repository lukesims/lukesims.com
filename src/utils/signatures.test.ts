import { addDays, subDays } from "date-fns";
import { describe, expect, it } from "vitest";

import config from "~/config";
import { createHmac } from "~/utils/hmacs";

import {
  assertUrlIsValid,
  createSignedUrl,
  ExpiredSignatureError,
  InvalidSignatureError,
  isExpiredUrl,
  verifySignedUrl,
} from "./signatures";

const {
  signatures: { expiryParam, signatureParam },
} = config;

describe("assertUrlIsValid", () => {
  it("accepts strings or URL objects", () => {
    const url = new URL("https://example.com/foo?bar=baz");
    const signedUrl = createSignedUrl(url);
    expect(() => assertUrlIsValid(signedUrl)).not.toThrow();
    expect(() => assertUrlIsValid(signedUrl.toString())).not.toThrow();
  });

  it("does nothing if the URL is valid", () => {
    const url = new URL("https://example.com/foo?bar=baz");
    expect(() => assertUrlIsValid(createSignedUrl(url))).not.toThrow();
    expect(() => assertUrlIsValid(createSignedUrl(url, 1))).not.toThrow();
  });

  it("throws InvalidSignatureError when signature is missing", () => {
    const url = new URL("https://example.com/api/resource");
    expect(() => assertUrlIsValid(url)).toThrow(InvalidSignatureError);
  });

  it("throws InvalidSignatureError when signature is modified", () => {
    const url = new URL("https://example.com/api/resource");
    const signedUrl = createSignedUrl(url);
    const signature = signedUrl.searchParams.get(signatureParam)!;
    signedUrl.searchParams.set(signatureParam, signature.slice(0, -1) + "x");
    expect(() => assertUrlIsValid(signedUrl)).toThrow(InvalidSignatureError);
  });

  it("throws InvalidSignatureError when signature is wrong", () => {
    const url1 = createSignedUrl(new URL("https://example.com/resource1"));
    const url2 = new URL("https://example.com/resource2");
    url2.searchParams.set(
      signatureParam,
      url1.searchParams.get(signatureParam)!,
    );
    expect(() => assertUrlIsValid(url2)).toThrow(InvalidSignatureError);
  });

  it("throws InvalidSignatureError for malformed signature", () => {
    const url = new URL("https://example.com/resource?signature=not-valid-hex");
    expect(() => assertUrlIsValid(url)).toThrow(InvalidSignatureError);
  });

  it("throws ExpiredSignatureError for expired URLs", () => {
    const url = new URL("https://example.com?foo=bar");
    const signedUrl = createSignedUrl(url, -1);
    expect(() => assertUrlIsValid(signedUrl)).toThrow(ExpiredSignatureError);
    const now = new Date().getTime();
    url.searchParams.set(expiryParam, now.toString());
    url.searchParams.set(signatureParam, createHmac(url.toString()));
    expect(() => assertUrlIsValid(url)).toThrow(ExpiredSignatureError);
  });

  it("throws for invalid inputs", () => {
    const emptyError = "URL must be provided";
    expect(() => assertUrlIsValid("")).toThrow(emptyError);
    expect(() => assertUrlIsValid(undefined!)).toThrow(emptyError);
    expect(() => assertUrlIsValid(null!)).toThrow(emptyError);

    const invalidError = "Invalid URL";
    expect(() => assertUrlIsValid("foo")).toThrow(invalidError);
    expect(() => assertUrlIsValid({} as URL)).toThrow(invalidError);
    expect(() => assertUrlIsValid(1 as unknown as URL)).toThrow(invalidError);
  });
});

describe("createSignedUrl", () => {
  it("returns a URL object with signature parameter", () => {
    const url = new URL("https://example.com/api/resource");
    const signedUrl = createSignedUrl(url);
    expect(signedUrl).toBeInstanceOf(URL);
    expect(signedUrl.searchParams.has(signatureParam)).toBe(true);
  });

  it("creates a valid signature that verifies", () => {
    const url = new URL("https://example.com/api/resource");
    const signedUrl = createSignedUrl(url);
    expect(verifySignedUrl(signedUrl)).toBe(true);
  });

  it("preserves original URL path and query parameters", () => {
    const url = new URL("https://example.com/api/resource?param=value&foo=bar");
    const signedUrl = createSignedUrl(url);
    expect(signedUrl.pathname).toBe("/api/resource");
    expect(signedUrl.searchParams.get("param")).toBe("value");
    expect(signedUrl.searchParams.get("foo")).toBe("bar");
  });

  it("does not modify the urlToSign object", () => {
    const url = new URL("https://example.com?foo=bar");
    const signedUrl = createSignedUrl(url, 14);
    expect(url.searchParams.has(signatureParam)).toBe(false);
    expect(url.searchParams.has(expiryParam)).toBe(false);
    expect(signedUrl).not.toBe(url);
  });

  it("generates signatures in hex format", () => {
    const url = new URL("https://example.com/api/resource");
    const signedUrl = createSignedUrl(url);
    expect(signedUrl.searchParams.get(signatureParam)).toMatch(/^[0-9a-f]+$/);
  });

  it("sets expires parameter when daysToExpiry is provided", () => {
    const url = new URL("https://example.com/api/resource");
    const signedUrl = createSignedUrl(url, 7);
    expect(signedUrl.searchParams.has(expiryParam)).toBe(true);
  });

  it("does not set expires parameter when daysToExpiry is undefined", () => {
    const url = new URL("https://example.com/api/resource");
    const signedUrl = createSignedUrl(url);
    expect(signedUrl.searchParams.has(expiryParam)).toBe(false);
  });

  it("includes the expiry date in the signed data", () => {
    const url = new URL("https://example.com?foo=bar");
    const tempUrl = createSignedUrl(url, 7);
    const signedUrl = createSignedUrl(url);
    expect(tempUrl.searchParams.get(signatureParam)).not.toBeNull();
    expect(tempUrl.searchParams.get(expiryParam)).not.toBeNull();
    expect(signedUrl.searchParams.get(signatureParam)).not.toBeNull();
    expect(signedUrl.searchParams.get(expiryParam)).toBeNull();
    expect(tempUrl.searchParams.get(signatureParam)).not.toMatch(
      signedUrl.searchParams.get(signatureParam)!,
    );
  });

  it("handles special characters in query parameters", () => {
    const signedUrl = createSignedUrl(
      new URL("https://example.com/foo?param=hello+world&special=%21%40%23"),
    );
    expect(signedUrl.searchParams.get("param")).toBe("hello world");
    expect(signedUrl.searchParams.get("special")).toBe("!@#");
    expect(verifySignedUrl(signedUrl)).toBe(true);
  });

  it("produces consistent signature for same URLs", () => {
    const url = new URL("https://example.com/path");
    const urlA = createSignedUrl(url);
    const urlB = createSignedUrl(url);
    expect(urlA.searchParams.get(signatureParam)).toMatch(
      urlB.searchParams.get(signatureParam)!,
    );
  });

  it("produces different signatures for different URLs", () => {
    const urlA = createSignedUrl(new URL("https://example.com/path1"));
    const urlB = createSignedUrl(new URL("https://example.com/path2"));
    expect(urlA.searchParams.get(signatureParam)).not.toMatch(
      urlB.searchParams.get(signatureParam)!,
    );
  });
});

describe("isExpiredUrl", () => {
  it("returns true for URLs expiring now", () => {
    const url = new URL("https://example.com/api/resource");
    const now = new Date().getTime();
    url.searchParams.set(expiryParam, now.toString());
    expect(isExpiredUrl(url)).toBe(true);
  });

  it("returns true for URLs with past expiry date", () => {
    const url = new URL("https://example.com/api/resource");
    const now = new Date();
    // 1ms in the past
    url.searchParams.set(expiryParam, now.getTime() - 1 + "");
    expect(isExpiredUrl(url)).toBe(true);
    // 1 year in the past
    url.searchParams.set(expiryParam, subDays(now, 365).getTime() + "");
    expect(isExpiredUrl(url)).toBe(true);
  });

  it("returns true for expiry at epoch (0)", () => {
    const url = new URL("https://example.com/api/resource");
    url.searchParams.set(expiryParam, "0");
    expect(isExpiredUrl(url)).toBe(true);
  });

  it("returns false for URLs without expiry parameter", () => {
    const url = new URL("https://example.com/api/resource");
    const signedUrl = createSignedUrl(url);
    expect(isExpiredUrl(signedUrl)).toBe(false);
  });

  it("returns false for URLs with future expiry date", () => {
    const url = new URL("https://example.com/api/resource");
    const now = new Date();
    // 1ms in the future
    url.searchParams.set(expiryParam, now.getTime() + 1 + "");
    expect(isExpiredUrl(url)).toBe(false);
    // 1 year in the future
    url.searchParams.set(expiryParam, addDays(now, 365).getTime() + "");
    expect(isExpiredUrl(url)).toBe(false);
  });

  it("returns false for empty expiry parameter", () => {
    const url = new URL("https://example.com/api/resource");
    url.searchParams.set(expiryParam, "");
    expect(isExpiredUrl(url)).toBe(false);
  });

  it("handles invalid expiry format gracefully", () => {
    const url = new URL("https://example.com/api/resource");
    url.searchParams.set(expiryParam, "not-a-number");
    expect(isExpiredUrl(url)).toBe(false);
  });

  it("does not check the signature presence or validity", () => {
    const url = new URL("https://example.com/api/resource");
    const signedUrl = createSignedUrl(url, 7);
    // Invalid signature
    signedUrl.searchParams.set(signatureParam, "invalid-signature");
    expect(isExpiredUrl(signedUrl)).toBe(false);
    // Missing signature
    signedUrl.searchParams.delete(signatureParam);
    expect(isExpiredUrl(signedUrl)).toBe(false);
  });
});

describe("verifySignedUrl", () => {
  it("verifies a properly signed URL", () => {
    const url = new URL("https://example.com/path?param=value");
    const signedUrl = createSignedUrl(url);
    expect(verifySignedUrl(signedUrl)).toBe(true);
  });

  it("returns false for URLs without the signature parameter", () => {
    const url = new URL("https://example.com/api/resource");
    expect(verifySignedUrl(url)).toBe(false);
  });

  it("returns false for tampered signature", () => {
    const url = new URL("https://example.com/api/resource");
    const signedUrl = createSignedUrl(url);
    signedUrl.searchParams.set(
      signatureParam,
      signedUrl.searchParams.get(signatureParam)!.slice(0, -1) + "x",
    );
    expect(verifySignedUrl(signedUrl)).toBe(false);
  });

  it("returns false for signature from a different URL", () => {
    const validUrl = createSignedUrl(new URL("https://example.com/resource1"));
    const signature = validUrl.searchParams.get(signatureParam);
    const invalidUrl = new URL("https://example.com/resource2");
    invalidUrl.searchParams.set(signatureParam, signature!);
    expect(verifySignedUrl(invalidUrl)).toBe(false);
  });

  it("returns false if path is modified after signing", () => {
    const url = new URL("https://example.com/api/resource");
    const signedUrl = createSignedUrl(url);
    signedUrl.pathname = "/api/different";
    expect(verifySignedUrl(signedUrl)).toBe(false);
  });

  it("returns false if query params are modified after signing", () => {
    const url = new URL("https://example.com/api/resource?param=value");
    const signedUrl = createSignedUrl(url);
    signedUrl.searchParams.set("param", "different");
    expect(verifySignedUrl(signedUrl)).toBe(false);
  });

  it("returns false if protocol is modified after signing", () => {
    const url = new URL("https://example.com/api/resource");
    const signedUrl = createSignedUrl(url);
    signedUrl.protocol = "http:";
    expect(verifySignedUrl(signedUrl)).toBe(false);
  });

  it("returns false if hostname is modified after signing", () => {
    const url = new URL("https://example.com/api/resource");
    const signedUrl = createSignedUrl(url);
    signedUrl.hostname = "different.com";
    expect(verifySignedUrl(signedUrl)).toBe(false);
  });

  it("handles URLs with only signature parameter", () => {
    const url = new URL("https://example.com");
    const signedUrl = createSignedUrl(url);
    expect(signedUrl.searchParams.size).toBe(1);
    expect(verifySignedUrl(signedUrl)).toBe(true);
  });

  it("handles multiple query parameters", () => {
    const url = new URL("https://example.com?a=1&b=2&c=3");
    const signedUrl = createSignedUrl(url);
    expect(verifySignedUrl(signedUrl)).toBe(true);
  });

  it("does not check if the URL has expired", () => {
    const url = new URL("https://example.com?a=1&b=2&c=3");
    const expiredUrl = createSignedUrl(url, -1);
    expect(verifySignedUrl(expiredUrl)).toBe(true);
  });
});
