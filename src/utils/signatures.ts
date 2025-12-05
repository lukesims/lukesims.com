import { HMAC_ALGO, HMAC_KEY } from "astro:env/server";
import { addDays } from "date-fns";
import { createHmac as nodeCreateHmac, timingSafeEqual } from "node:crypto";

const SIGN_PARAM = "signature";
const SIGN_EXP_PARAM = "expires";

export class ExpiredSignatureError extends Error {}
export class InvalidSignatureError extends Error {}

export function assertUrlIsValid(url: string | URL) {
  if (typeof url === "string") url = new URL(url);
  if (!verifySignedUrl(url)) throw new InvalidSignatureError();
  if (isExpiredUrl(url)) throw new ExpiredSignatureError();
}

export function createHmac(data: string): string {
  return nodeCreateHmac(HMAC_ALGO, HMAC_KEY).update(data, "utf8").digest("hex");
}

export function createSignedUrl(urlToSign: URL, daysToExpiry?: number): URL {
  const signedUrl = new URL(urlToSign);
  if (daysToExpiry) {
    signedUrl.searchParams.set(
      SIGN_EXP_PARAM,
      addDays(new Date(), daysToExpiry).getTime() + "",
    );
  }
  signedUrl.searchParams.set(SIGN_PARAM, createHmac(signedUrl.toString()));
  return signedUrl;
}

export function isExpiredUrl(signedUrl: URL): boolean {
  const expires = signedUrl.searchParams.get(SIGN_EXP_PARAM);
  return !!expires && new Date().getTime() >= parseInt(expires, 10);
}

export function verifyHmac(data: string, hmac: string): boolean {
  return data && hmac
    ? timingSafeEqual(Buffer.from(createHmac(data)), Buffer.from(hmac))
    : false;
}

export function verifySignedUrl(signedUrl: URL): boolean {
  const signature = signedUrl.searchParams.get(SIGN_PARAM);
  if (!signature) return false;

  const originalUrl = new URL(signedUrl);
  originalUrl.searchParams.delete(SIGN_PARAM);

  return verifyHmac(originalUrl.toString(), signature);
}
