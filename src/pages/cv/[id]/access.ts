import type { APIRoute } from "astro";
import { getEntry } from "astro:content";
import { accessRequests, db, eq, visitors } from "astro:db";
import { SITE_URL } from "astro:env/client";
import { nanoid } from "nanoid";
import { z, ZodError } from "zod";

import { sendEmail } from "~/utils/email";
import { email, string } from "~/utils/form-validation";
import {
  internalErrorResponse,
  notFoundResponse,
  retryCaptchaResponse,
  validationErrorResponse,
} from "~/utils/http";
import { createTemporaryUrl } from "~/utils/signatures";
import { TurnstileError, validateTurnstile } from "~/utils/turnstile";

export const prerender = false;

// Schema for validating the request body
export type CvAccessRequest = z.infer<typeof cvAccessSchema>;
export const cvAccessSchema = z.object({
  name: string(),
  email: email(),
  company: z.string().optional(),
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

  const visitorResult = await db
    .select()
    .from(visitors)
    .where(eq(visitors.email, data.email))
    .limit(1);
  const [visitor] =
    Array.isArray(visitorResult) && visitorResult.length
      ? visitorResult
      : await db.insert(visitors).values(data).returning();

  const [accessRequest] = await db
    .insert(accessRequests)
    .values({
      id: nanoid(12),
      cv: cv.id,
      visitorId: visitor.id,
      requestedAt: new Date(),
    })
    .returning();

  try {
    const mailgunResponse = await sendEmail({
      to: data.email,
      subject: "Luke Sims' CV",
      text: `Access the CV here: ${createTemporaryUrl(
        new URL(`/cv/${cv.id}/view?req=${accessRequest.id}`, SITE_URL),
        7,
      )}`,
    });

    console.debug("Sent CV access email:", mailgunResponse);
  } catch (error) {
    // @todo report
    console.error(error);
    return internalErrorResponse();
  }

  return new Response();
};
