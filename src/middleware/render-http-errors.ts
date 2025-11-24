import type { APIContext } from "astro";
import { defineMiddleware } from "astro:middleware";

/**
 * List of regexes defining the routes that do not require this middleware.
 */
const ignoredRoutes = [/^\/contact\/send$/, /^\/cv\/[A-Za-z0-9]+\/access$/];

/**
 * Attempts to render an error page when the current route or another
 * middleware returns a `Response` with a HTTP error code (4xx/5xx).
 *
 * Must be first in the sequence of middlewares to ensure
 * that it can handle errors from other middlewares.
 */
export const renderHttpErrors = defineMiddleware(async (context, next) => {
  if (!shouldApply(context)) return next();

  // Await the final response and if it's not an error or it's a 404
  // (handled by Astro), do nothing and return the response as-is.
  const res = await next();
  if (res.status < 400 || res.status > 599 || res.status === 404) return res;

  // Override the response and render the error page instead.
  const body = res.body ? await res.json() : "";
  return next(
    "/500?" +
      new URLSearchParams([
        ["status", res.status + ""],
        ["error", body.error ?? ""],
        ["message", body.message ?? ""],
      ]).toString(),
  );
});

/**
 * Determines whether the middleware should apply to the
 * current context, based on the path that is being accessed.
 *
 * @param context - The Astro API context object.
 * @return `true` if the middleware should apply, `false` otherwise.
 */
function shouldApply(context: APIContext): boolean {
  for (const route of ignoredRoutes) {
    if (context.url.pathname.match(route)) {
      return false;
    }
  }
  return true;
}
