import type { APIRoute } from "astro";
import { z } from "zod";

import { email, string } from "~/schemas/validation";
import { sendEmail } from "~/utils/email";
import { validateTurnstile } from "~/utils/turnstile";

export const prerender = false;

const requestSchema = z.object({
  name: string(),
  email: email(),
  phone: z.string().optional(),
  message: string(),
  captcha_token: string(),
});

/**
 * Request handler for: `POST /contact/send`
 */
export const POST: APIRoute = async ({ clientAddress, request, site }) => {
  const data = await request.json();
  const validated = requestSchema.parse(data);

  await validateTurnstile(
    validated.captcha_token,
    clientAddress,
    "contact",
    site?.hostname,
  );

  const mailgunResponse = await sendEmail({
    to: import.meta.env.CONTACT_EMAIL,
    subject: `Contact form submission from ${validated.name}`,
    text:
      `Message received via the ${import.meta.env.PUBLIC_SITE_URL} contact form:\n\n` +
      `Name:  ${validated.name}\n` +
      `Email:  ${validated.email}\n` +
      `Phone:  ${validated.phone}\n\n` +
      `------ Message ------\n\n` +
      validated.message,
  });

  console.debug("Sent contact form email:", mailgunResponse);

  return new Response("", { status: 200 });
};
