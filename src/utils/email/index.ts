import { sendEmailViaMailgun } from "~/utils/email/mailgun";
import { sendEmailViaMailpit } from "~/utils/email/mailpit";
import {
  type SendEmailConfig,
  sendEmailConfigSchema,
  type SendEmailResponse,
} from "~/utils/email/types";

export type { SendEmailConfig, SendEmailResponse };

export function sendEmail(email: SendEmailConfig) {
  const { data, error, success } = sendEmailConfigSchema.safeParse(email);

  if (!success) {
    throw new Error("Invalid email object passed to sendEmail function", {
      cause: error,
    });
  }

  return import.meta.env.MODE === "test"
    ? sendEmailViaMailpit(data)
    : sendEmailViaMailgun(data);
}
