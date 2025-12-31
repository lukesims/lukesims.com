import { addDays } from "date-fns";

import config from "~/config";
import { createHmac, verifyHmac } from "~/utils/hmacs";

const {
  signatures: { expiryParam, signatureParam },
} = config;

export class ExpiredSignatureError extends Error {}
export class InvalidSignatureError extends Error {}

export function assertUrlIsValid(url: string | URL) {
  if (!url) throw new Error("URL must be provided");
  if (!(url instanceof URL)) url = new URL(url);
  if (!verifySignedUrl(url)) throw new InvalidSignatureError();
  if (isExpiredUrl(url)) throw new ExpiredSignatureError();
}

export function createSignedUrl(urlToSign: URL, daysToExpiry?: number): URL {
  const signedUrl = new URL(urlToSign);
  if (daysToExpiry) {
    signedUrl.searchParams.set(
      expiryParam,
      addDays(new Date(), daysToExpiry).getTime() + "",
    );
  }
  signedUrl.searchParams.set(signatureParam, createHmac(signedUrl.toString()));
  return signedUrl;
}

export function isExpiredUrl(signedUrl: URL): boolean {
  const expires = signedUrl.searchParams.get(expiryParam);
  return !!expires && new Date().getTime() >= parseInt(expires, 10);
}

export function verifySignedUrl(signedUrl: URL): boolean {
  const signature = signedUrl.searchParams.get(signatureParam);
  if (!signature) return false;

  const originalUrl = new URL(signedUrl);
  originalUrl.searchParams.delete(signatureParam);

  return verifyHmac(originalUrl.toString(), signature);
}
