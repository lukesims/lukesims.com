import { addDays } from "date-fns";
import {
  type BinaryToTextEncoding,
  createSign,
  createVerify,
} from "node:crypto";
import { readFileSync } from "node:fs";

import { storagePath } from "~/utils/paths";

const privateKey = readFileSync(storagePath("keys/private-key.pem"), "utf-8");
const publicKey = readFileSync(storagePath("keys/public-key.pem"), "utf-8");

export const SIGN_ALGO = "RSA-SHA256";
export const SIGN_FORMAT: BinaryToTextEncoding = "base64";
export const SIGN_PARAM = "_signature";
export const SIGN_EXP_PARAM = "_expires";

export class ExpiredSignatureError extends Error {}
export class InvalidSignatureError extends Error {}

/**
 * @todo
 */
export function assertUrlIsValid(url: string | URL) {
  if (typeof url === "string") url = new URL(url);
  if (!verifySignedUrl(url)) throw new InvalidSignatureError();
  if (isExpiredUrl(url)) throw new ExpiredSignatureError();
}

/**
 * Creates a signature for the given data using our private key.
 *
 * @param data - The data to sign.
 * @returns The signature in base64 format.
 */
export function createSignature(data: string): string {
  return createSign(SIGN_ALGO).update(data).sign(privateKey, SIGN_FORMAT);
}

/**
 * Adds a signature to the given URL.
 *
 * @param urlToSign - The URL to sign.
 * @returns A new URL object with the signature added as a query parameter.
 */
export function createSignedUrl(urlToSign: URL): URL {
  const signedUrl = new URL(urlToSign);
  signedUrl.searchParams.set(SIGN_PARAM, createSignature(urlToSign.toString()));
  return signedUrl;
}

/**
 * Creates a temporary signed URL that expires after a specified number of days.
 *
 * @param urlToSign - The URL to sign.
 * @param daysToExpiry - The number of days until the URL expires.
 * @returns A new URL object with the signature and expiry time added as query parameters.
 */
export function createTemporaryUrl(urlToSign: URL, daysToExpiry: number): URL {
  const tempUrl = new URL(urlToSign);
  const expiryTime = addDays(new Date(), daysToExpiry).getTime();
  tempUrl.searchParams.set(SIGN_EXP_PARAM, expiryTime + "");
  return createSignedUrl(tempUrl);
}

/**
 * Checks if the given URL has expired (the timestamp in the URL is
 * in the past). Does not check the signature, only the expiration time.
 *
 * @param signedUrl - The URL to check for expiration.
 * @returns `true` if the URL has expired, `false` otherwise.
 */
export function isExpiredUrl(signedUrl: URL): boolean {
  const expires = signedUrl.searchParams.get(SIGN_EXP_PARAM);
  return !!expires && new Date().getTime() >= parseInt(expires, 10);
}

/**
 * Verifies the signature of the given data using our public key.
 *
 * @param data - The data to verify against.
 * @param signature - The signature to verify.
 * @returns `true` if the signature is valid, `false` otherwise.
 */
export function verifySignature(data: string, signature: string): boolean {
  return createVerify(SIGN_ALGO)
    .update(data)
    .verify(publicKey, signature, SIGN_FORMAT);
}

/**
 * Verifies the signature of a signed URL.
 *
 * @param signedUrl - The signed URL to verify.
 * @returns `true` if the signature is valid, `false` otherwise.
 */
export function verifySignedUrl(signedUrl: URL): boolean {
  const signature = signedUrl.searchParams.get(SIGN_PARAM);
  if (!signature) return false;
  const urlWithoutSignature = new URL(signedUrl);
  urlWithoutSignature.searchParams.delete(SIGN_PARAM);
  return verifySignature(urlWithoutSignature.toString(), signature);
}
