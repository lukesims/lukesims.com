import type { APIRoute } from "astro";
import { SITE_URL } from "astro:env/client";
import { CONTACT_EMAIL } from "astro:env/server";
// import type { SentMessageInfo } from "nodemailer";
import { z, ZodError } from "zod";

import { sendEmail } from "~/utils/email";
import { email, string } from "~/utils/form-validation";
import {
  internalErrorResponse,
  retryCaptchaResponse,
  validationErrorResponse,
} from "~/utils/http";
import { TurnstileError, validateTurnstile } from "~/utils/turnstile";

export const prerender = false;

// Schema for validating the request body
export type ContactEndpointRequest = z.infer<typeof contactEndpointSchema>;
export const contactEndpointSchema = z.object({
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
  const data: Record<string, string> = {};
  (await request.formData()).forEach(
    (value, key) => (data[key] = value.toString()),
  );

  let validated: ContactEndpointRequest;
  try {
    validated = contactEndpointSchema.parse(data);
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
      validated.captcha_token,
      clientAddress,
      "contact",
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

  // let emailInfo: SentMessageInfo;
  try {
    /* emailInfo = */ await sendEmail({
      to: CONTACT_EMAIL,
      subject: `Contact form submission from ${validated.name}`,
      text:
        "Message received via the " +
        SITE_URL +
        " contact form:\n\n Name:  " +
        validated.name +
        "\nEmail:  " +
        validated.email +
        "\nPhone:  " +
        validated.phone +
        "\n\n------ Message ------\n\n" +
        validated.message,
    });
  } catch (error) {
    // @todo report
    console.error(error);
    return internalErrorResponse();
  }

  return new Response();
};
