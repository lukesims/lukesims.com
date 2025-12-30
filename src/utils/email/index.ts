import { sendEmailViaMailgun } from "~/utils/email/mailgun";
import { sendEmailViaMailpit } from "~/utils/email/mailpit";
import {
  type SendEmailConfig,
  sendEmailConfigSchema,
  type SendEmailResponse,
} from "~/utils/email/types";

export type { SendEmailConfig, SendEmailResponse };

export function sendEmail(email: SendEmailConfig) {
  sendEmailConfigSchema.parse(email);

  return import.meta.env.MODE === "test"
    ? sendEmailViaMailpit(email)
    : sendEmailViaMailgun(email);
}
