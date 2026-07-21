import { captureMessage } from "@sentry/astro";
import type { APIRoute } from "astro";
import { z } from "astro/zod";
import { PUBLIC_SITE_URL } from "astro:env/client";
import { CONTACT_EMAIL } from "astro:env/server";
import { env } from "cloudflare:workers";

import { email, string } from "~/schemas/validation";
import { sendEmail } from "~/utils/email";
import { validateTurnstile } from "~/utils/turnstile";

export const prerender = false;

const requestSchema = z.object({
  name: string(),
  email: email(),
  phone: z.string().trim().optional(),
  subject: z.string().optional(),
  message: string(),
  captcha_token: string(),
});

/**
 * Request handler for: `POST /contact/send`
 */
export const POST: APIRoute = async ({ clientAddress, request, site, url }) => {
  const contentType = request.headers.get("content-type");
  if (!contentType || !/^multipart\/form-data(?:;.*)?$/.test(contentType)) {
    return new Response("Bad Request", { status: 400 });
  }

  // The method used for converting FormData to a POJO will need
  // updating if any multiple/array fields are added to the form
  const formData = Object.fromEntries(await request.formData());
  const validated = requestSchema.parse(formData);

  // Honeypot field was filled in
  if (validated.subject) {
    return new Response(null, { status: 200 });
  }

  await validateTurnstile(
    validated.captcha_token,
    clientAddress,
    "contact",
    site?.hostname,
  );

  if (import.meta.env.MODE !== "test") {
    if (!env.EMAIL_RATE_LIMITER) {
      const msg = "EMAIL_RATE_LIMITER binding not available";
      console.error(msg);
      captureMessage(msg);
      return new Response("Internal Server Error", { status: 500 });
    }
    const { success } = await env.EMAIL_RATE_LIMITER.limit({
      key: clientAddress + url.pathname,
    });
    if (!success) {
      return new Response("Too Many Requests", { status: 429 });
    }
  }

  const sendEmailResponse = await sendEmail({
    to: [CONTACT_EMAIL],
    subject: `Contact form submission from ${validated.name}`,
    text:
      `Message received via the ${PUBLIC_SITE_URL} contact form:\n\n` +
      `Name:  ${validated.name}\n` +
      `Email:  ${validated.email}\n` +
      `Phone:  ${validated.phone}\n\n` +
      `------ Message ------\n\n` +
      validated.message,
  });

  console.debug("Sent contact form email:", sendEmailResponse);

  return new Response(null, { status: 200 });
};
