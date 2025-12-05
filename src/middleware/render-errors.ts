import { defineMiddleware } from "astro:middleware";
import { ZodError } from "zod";

import { TurnstileError } from "~/utils/turnstile";

/**
 * Catches any renderable errors thrown during the current request and returns
 * the appropriate response for them. All other errors are rethrown and are
 * handled by Astro.
 *
 * Must be first in the sequence of middlewares to ensure that it can handle
 * errors from other middlewares.
 */
export const renderErrors = defineMiddleware(async (context, next) => {
  let response: Response;

  try {
    // Await from the final response for the current route, including all
    // other middleware (assuming this one is placed first in the sequence).
    response = await next();
  } catch (error) {
    // Return a consistent response format for (form) validation errors
    if (error instanceof TurnstileError && error.shouldRetry) {
      return new Response(JSON.stringify({ captcha_token: ["retry"] }), {
        headers: { "content-type": "application/json" },
        status: 422,
      });
    }
    if (error instanceof ZodError) {
      return new Response(JSON.stringify(error.flatten().fieldErrors), {
        headers: { "content-type": "application/json" },
        status: 422,
      });
    }

    // All other errors can be handled by Astro rendering the 500 page
    throw error;
  }

  return response;
});
