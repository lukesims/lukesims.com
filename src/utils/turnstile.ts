import { randomUUID } from "node:crypto";

import config from "~/config";

// https://developers.cloudflare.com/turnstile/get-started/server-side-validation/#response-fields
type TurnstileResponse =
  | {
      success: true;
      challenge_ts: string;
      hostname: string;
      action: string;
      cdata: string;
    }
  | {
      success: false;
      "error-codes": (
        | "bad-request"
        | "internal-error"
        | "invalid-input-response"
        | "invalid-input-secret"
        | "missing-input-response"
        | "missing-input-secret"
        | "timeout-or-duplicate"
      )[];
    };

export async function validateTurnstile(
  token: string,
  remoteip: string,
  expectedAction?: string,
  expectedHostname?: string,
) {
  const body = new FormData();
  body.append("secret", import.meta.env.TURNSTILE_SECRET_KEY);
  body.append("response", token);
  body.append("remoteip", remoteip);
  body.append("idempotency_key", randomUUID());

  let result: TurnstileResponse = {
    success: false,
    "error-codes": ["internal-error"],
  };

  for (let attempt = 1; attempt <= config.turnstile.maxAttempts; attempt++) {
    try {
      const response = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        { body, method: "POST" },
      );
      if (response.ok || attempt === config.turnstile.maxAttempts) {
        result = await response.json();
        break;
      }
    } catch (_) {
      if (attempt === config.turnstile.maxAttempts) {
        break;
      }
    }
    await new Promise((resolve) =>
      setTimeout(
        resolve,
        Math.pow(2, attempt) * config.turnstile.timeoutFactor,
      ),
    );
  }

  if (result.success) {
    // When using Cloudflare's test keys in development/testing, the Turnstile
    // widget always generates a dummy token and it doesn't bother to track the
    // action or hostname, so these checks will always fail.
    if (
      process.env.NODE_ENV === "production" &&
      import.meta.env.MODE === "production"
    ) {
      if (expectedAction && result.action !== expectedAction) {
        throw new TurnstileError(
          "Unexpected action in Turnstile response: " +
            `expected "${expectedAction}", ` +
            `received "${result.action}."`,
          result,
          true,
        );
      }
      if (expectedHostname && result.hostname !== expectedHostname) {
        throw new TurnstileError(
          "Unexpected hostname in Turnstile response: " +
            `expected "${expectedHostname}", ` +
            `received "${result.hostname}."`,
          result,
          true,
        );
      }
    }
  } else {
    for (const code of result["error-codes"]) {
      switch (code) {
        case "bad-request":
          throw new TurnstileError("The request was malformed.", result);
        case "internal-error":
          throw new TurnstileError("An internal error occurred.", result, true);
        case "invalid-input-response":
          throw new TurnstileError(
            "The token parameter is invalid, malformed, or expired.",
            result,
            true,
          );
        case "invalid-input-secret":
          throw new TurnstileError(
            "The secret parameter is invalid or expired.",
            result,
          );
        case "missing-input-response":
          throw new TurnstileError(
            "The token parameter was not provided.",
            result,
          );
        case "missing-input-secret":
          throw new TurnstileError(
            "The secret parameter was not provided.",
            result,
          );
        case "timeout-or-duplicate":
          throw new TurnstileError(
            "The token has already been validated.",
            result,
            true,
          );
      }
    }
    throw new TurnstileError("Unknown error(s) returned by Cloudflare", result);
  }
}

export class TurnstileError extends Error {
  response: TurnstileResponse;
  shouldRetry: boolean;

  constructor(
    message: string,
    response: TurnstileResponse,
    shouldRetry = false,
  ) {
    super(message);
    this.response = response;
    this.shouldRetry = shouldRetry;
  }
}
