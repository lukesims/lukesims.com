import type { APIRoute } from "astro";
import { getEntry } from "astro:content";
import { accessRequests, db, eq, visitors } from "astro:db";
import { SITE_URL } from "astro:env/client";
import { nanoid } from "nanoid";
import { z } from "zod";

import { sendEmail } from "~/utils/email";
import {
  internalErrorResponse,
  notFoundResponse,
  validationErrorResponse,
} from "~/utils/http";
import { createTemporaryUrl } from "~/utils/signatures";

export const prerender = false;

// Schema for validating the request body
export type CvAccessRequest = z.infer<typeof cvAccessSchema>;
export const cvAccessSchema = z.object({
  company: z.string().optional(),
  email: z
    .string({ message: "valueMissing" })
    .min(1, { message: "tooShort" })
    .email({ message: "typeMismatch" }),
  name: z.string({ message: "valueMissing" }).min(1, { message: "tooShort" }),
});

/**
 * Request handler for: `POST /cv/[id]/access`
 */
export const POST: APIRoute = async ({ params, request }) => {
  // Parse the request body as JSON and validate the result
  let data: CvAccessRequest;
  try {
    data = cvAccessSchema.parse(await request.json());
  } catch (error) {
    if (error instanceof z.ZodError) {
      return validationErrorResponse(error);
    }
    // @todo report
    console.error(error);
    return internalErrorResponse();
  }

  // Attempt to find the specified CV in the database
  const cv = await getEntry("cv", params.id!);
  if (!cv) return notFoundResponse();

  // Attempt to find the visitor in the database, add them if they don't exist
  const visitorResult = await db
    .select()
    .from(visitors)
    .where(eq(visitors.email, data.email))
    .limit(1);
  const [visitor] =
    Array.isArray(visitorResult) && visitorResult.length
      ? visitorResult
      : await db.insert(visitors).values(data).returning();

  // Track this request in the database
  let accessRequestData = {
    id: nanoid(12),
    cv: cv.id,
    visitorId: visitor.id,
    requestedAt: new Date(),
  };
  const [accessRequest] = await db
    .insert(accessRequests)
    .values(accessRequestData)
    .returning();

  // Send the email to the user with the CV URL
  try {
    const emailInfo = await sendEmail({
      to: data.email,
      subject: "Luke Sims' CV",
      text: `Access the CV here: ${createTemporaryUrl(
        new URL(`/cv/${cv.id}/view?req=${accessRequest.id}`, SITE_URL),
        7,
      )}`,
    });
  } catch (error) {
    // @todo report
    console.error(error);
    return internalErrorResponse();
  }

  return new Response();
};
