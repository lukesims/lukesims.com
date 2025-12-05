import type { APIRoute } from "astro";
import { getEntry } from "astro:content";
import { SITE_URL } from "astro:env/client";
import { z } from "zod";

import { string } from "~/schemas/validation";
import { createSignedUrl } from "~/utils/signatures";
import { validateTurnstile } from "~/utils/turnstile";

export const prerender = false;

const requestSchema = z.object({
  captcha_token: string(),
});

/**
 * Request handler for: `POST /cv/[id]/access`
 */
export const POST: APIRoute = async ({
  clientAddress,
  params,
  request,
  site,
}) => {
  const data = await request.json();
  const validated = requestSchema.parse(data);

  await validateTurnstile(
    validated.captcha_token,
    clientAddress,
    "cv",
    site?.hostname,
  );

  const cv = await getEntry("cv", params.id!);

  if (!cv) {
    return new Response("Not Found", { status: 404 });
  }

  return new Response(
    createSignedUrl(new URL(`/cv/${cv.id}/view`, SITE_URL), 7).toString(),
    { status: 200 },
  );
};
