import type { APIRoute } from "astro";
import { SITE_URL } from "astro:env/client";
import { CONTACT_EMAIL } from "astro:env/server";
// import type { SentMessageInfo } from "nodemailer";
import { z, ZodError } from "zod";

import { sendEmail } from "~/utils/email";
import { internalErrorResponse, validationErrorResponse } from "~/utils/http";

export const prerender = false;

export const contactEndpointSchema = z.object({
  name: z.string({ message: "valueMissing" }).min(1, { message: "tooShort" }),
  email: z
    .string({ message: "valueMissing" })
    .min(1, { message: "tooShort" })
    .email({ message: "typeMismatch" }),
  phone: z.string().optional(),
  message: z
    .string({ message: "valueMissing" })
    .min(1, { message: "tooShort" }),
});

export type ContactEndpointRequest = z.infer<typeof contactEndpointSchema>;

export const POST: APIRoute = async ({ request }) => {
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
