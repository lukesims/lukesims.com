import type { APIRoute } from "astro";
import { getEntry } from "astro:content";
import { open } from "node:fs/promises";
import { z } from "zod";

import {
  expiredSignatureResponse,
  internalErrorResponse,
  invalidSignatureResponse,
  notFoundResponse,
  response,
} from "~/utils/http";
import { storagePath } from "~/utils/paths";
import { generateCvPdf } from "~/utils/pdf";
import {
  assertUrlIsValid,
  ExpiredSignatureError,
  InvalidSignatureError,
} from "~/utils/signatures";
import { exists } from "~/utils/storage";

export const prerender = false;

// Schema for validating the search params
export type CvDownloadRequest = z.infer<typeof cvDownloadSchema>;
export const cvDownloadSchema = z.object({
  url: z.string().url(),
});

/**
 * Request handler for: `GET /cv/[id]/download`
 */
export const GET: APIRoute = async (context) => {
  const { id } = context.params;

  let url: string;
  try {
    url = z.string().url().parse(context.url.searchParams.get("url"));
  } catch (error) {
    return response(400, { error: "Bad Request" });
  }

  try {
    assertUrlIsValid(url);
  } catch (error) {
    if (error instanceof InvalidSignatureError)
      return invalidSignatureResponse();
    if (error instanceof ExpiredSignatureError)
      return expiredSignatureResponse();
    // @todo capture
    console.error(error);
    return internalErrorResponse();
  }

  const cv = await getEntry("cv", id!);
  if (!cv) return notFoundResponse();

  let pdfTimestamp = cv.data.updated ?? cv.data.published;
  if (import.meta.env.DEV) pdfTimestamp = new Date();

  const pdfPath = storagePath(`cv/${id}_${pdfTimestamp.getTime()}.pdf`);
  if (!(await exists(pdfPath))) await generateCvPdf(url, pdfPath);

  return new Response(
    (await open(pdfPath)).readableWebStream({
      autoClose: true,
    }) as ReadableStream,
  );
};
