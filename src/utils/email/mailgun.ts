import {
  FROM_EMAIL,
  MAILGUN_API_KEY,
  MAILGUN_BASE_URL,
  MAILGUN_DOMAIN,
} from "astro:env/server";
import Mailgun from "mailgun.js";

import type { SendEmailConfig, SendEmailResponse } from "~/utils/email/types";

const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
  key: MAILGUN_API_KEY,
  url: MAILGUN_BASE_URL,
  useFetch: true,
  username: "api",
});

export function sendEmailViaMailgun(
  email: SendEmailConfig,
): Promise<SendEmailResponse> {
  return mg.messages.create(MAILGUN_DOMAIN, {
    ...email,
    from: email.from || FROM_EMAIL,
  });
}
