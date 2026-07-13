import { HMAC_ALGO, HMAC_KEY } from "astro:env/server";
import { createHmac as nodeCreateHmac, timingSafeEqual } from "node:crypto";

export function createHmac(data: string): string {
  if (!HMAC_KEY) {
    throw new Error("HMAC_KEY must be set");
  }
  if (!data) {
    throw new Error("data must be provided");
  }
  return nodeCreateHmac(HMAC_ALGO || "sha256", HMAC_KEY)
    .update(data, "utf8")
    .digest("hex");
}

export function verifyHmac(data: string, hmac: string): boolean {
  if (!data || !hmac) {
    return false;
  }
  try {
    return timingSafeEqual(Buffer.from(createHmac(data)), Buffer.from(hmac));
  } catch (_) {
    return false;
  }
}
