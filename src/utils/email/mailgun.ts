import Mailgun from "mailgun.js";

import type { SendEmailConfig, SendEmailResponse } from "~/utils/email/types";

const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
  key: import.meta.env.MAILGUN_API_KEY,
  url: import.meta.env.MAILGUN_BASE_URL,
  useFetch: true,
  username: "api",
});

export function sendEmailViaMailgun(
  email: SendEmailConfig,
): Promise<SendEmailResponse> {
  return mg.messages.create(import.meta.env.MAILGUN_DOMAIN, {
    ...email,
    from: email.from || import.meta.env.FROM_EMAIL,
  });
}
