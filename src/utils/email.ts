import Mailgun from "mailgun.js";

const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
  key: import.meta.env.MAILGUN_API_KEY,
  url: import.meta.env.MAILGUN_BASE_URL,
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
  return mg.messages.create(import.meta.env.MAILGUN_DOMAIN, {
    to: [email.to],
    from: email.from || import.meta.env.FROM_EMAIL,
    subject: email.subject,
    text: email.text,
    html: email.html,
  });
}
