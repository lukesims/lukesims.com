import type { APIRoute } from "astro";
import { z } from "astro/zod";
import { getEntry } from "astro:content";

import { string } from "~/schemas/validation";
import { createSignedUrl } from "~/utils/signatures";
import { validateTurnstile } from "~/utils/turnstile";

export const prerender = false;

const requestSchema = z.object({
  email: z.string().optional(),
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
  const contentType = request.headers.get("content-type");
  if (!contentType || !/^multipart\/form-data(?:;.*)?$/.test(contentType)) {
    return new Response(null, { status: 400 });
  }

  // The method used for converting FormData to a POJO will need
  // updating if any multiple/array fields are added to the form
  const formData = Object.fromEntries(await request.formData());
  const validated = requestSchema.parse(formData);

  // Honeypot field was filled in
  if (validated.email) {
    return new Response(null, { status: 200 });
  }

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
    createSignedUrl(
      new URL(`/cv/${cv.id}/view`, import.meta.env.PUBLIC_SITE_URL),
      7,
    ).toString(),
    { status: 200 },
  );
};
