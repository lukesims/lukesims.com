import type { APIContext } from "astro";
import { defineMiddleware } from "astro:middleware";

import { errorResponse } from "~/utils/http";
import {
  assertUrlIsValid,
  ExpiredSignatureError,
  InvalidSignatureError,
} from "~/utils/signatures";

/**
 * List of regexes defining the routes that require signature verification.
 */
const signedRoutes = [/^\/cv\/[A-Za-z0-9]+\/view$/];

/**
 * Verifies URL signatures for the routes and actions that use them.
 */
export const verifySignature = defineMiddleware(async (context, next) => {
  if (!shouldApply(context)) {
    return next();
  }

  try {
    assertUrlIsValid(context.url);
  } catch (error) {
    if (error instanceof InvalidSignatureError) {
      return errorResponse(403, {
        error: "Invalid Signature",
        message: "Lorem ipsum dolor sit amet.", // @todo
      });
    }
    if (error instanceof ExpiredSignatureError) {
      return errorResponse(410, {
        error: "Page Expired",
        message: "Lorem ipsum dolor sit amet.", // @todo
      });
    }
    // @todo capture
    console.error(error);
    return errorResponse(500, {
      error: "Internal Server Error",
      message: "Please try again later.",
    });
  }

  return next();
});

/**
 * Determines whether the middleware should apply to the
 * current context, based on the path that is being accessed.
 *
 * @param context - The Astro API context object.
 * @return `true` if the middleware should apply, `false` otherwise.
 */
function shouldApply(context: APIContext): boolean {
  for (const route of signedRoutes) {
    if (context.url.pathname.match(route)) {
      return true;
    }
  }
  return false;
}
