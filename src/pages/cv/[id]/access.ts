import type { APIRoute } from "astro";
import { getEntry } from "astro:content";
import { SITE_URL } from "astro:env/client";
import { z, ZodError } from "zod";

import { email, string } from "~/schemas/validation";
import {
  internalErrorResponse,
  notFoundResponse,
  retryCaptchaResponse,
  validationErrorResponse,
} from "~/utils/http";
import { createTemporaryUrl } from "~/utils/signatures";
import { TurnstileError, validateTurnstile } from "~/utils/turnstile";

export const prerender = false;

export type CvAccessRequest = z.infer<typeof cvAccessSchema>;
export const cvAccessSchema = z.object({
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
  let data: CvAccessRequest;
  try {
    data = cvAccessSchema.parse(await request.json());
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error);
    }
    // @todo report
    console.error(error);
    return internalErrorResponse();
  }

  try {
    await validateTurnstile(
      data.captcha_token,
      clientAddress,
      "cv",
      site?.hostname,
    );
  } catch (error) {
    if (error instanceof TurnstileError && error.shouldRetry) {
      return retryCaptchaResponse();
    }
    // @todo report
    console.error(error);
    return internalErrorResponse();
  }

  const cv = await getEntry("cv", params.id!);
  if (!cv) return notFoundResponse();

  return new Response(
    createTemporaryUrl(new URL(`/cv/${cv.id}/view`, SITE_URL), 7).toString(),
    {
      headers: { "content-type": "text/plain" },
      status: 200,
    },
  );
};
