import type { APIRoute } from "astro";

// Have a look in this file ⬇ for an explanation of why this endpoint exists
import { css } from "~/styles/fonts";

/**
 * Request handler for: `GET /fonts.css`
 */
export const GET: APIRoute = async (context) => {
  return new Response(css, { headers: { "content-type": "text/css" } });
};
