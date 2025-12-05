import {
  FROM_EMAIL,
  MAILGUN_API_KEY,
  MAILGUN_BASE_URL,
  MAILGUN_DOMAIN,
} from "astro:env/server";
import Mailgun from "mailgun.js";

const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
  key: MAILGUN_API_KEY,
  url: MAILGUN_BASE_URL,
  useFetch: true,
  username: "api",
});

export function sendEmail(email: {
  to: string;
  from?: string;
  subject: string;
  text: string;
  html?: string;
}) {
  return mg.messages.create(MAILGUN_DOMAIN, {
    to: [email.to],
    from: email.from || FROM_EMAIL,
    subject: email.subject,
    text: email.text,
    html: email.html,
  });
}
