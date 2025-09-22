import { defineMiddleware } from "astro:middleware";

/**
 * Attempts to render an error page when the current route or another
 * middleware returns a `Response` with a HTTP error code (4xx/5xx).
 *
 * If the request is for an API route, the response is passed through without
 * modification since those endpoints are not expected to return HTML.
 *
 * Must be first in the sequence of middlewares to ensure
 * that it can handle errors from other middlewares.
 */
export const renderHttpErrors = defineMiddleware(async (context, next) => {
  // If the request is for an API route, skip this middleware.
  if (context.url.pathname.startsWith("/api/")) return next();

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
