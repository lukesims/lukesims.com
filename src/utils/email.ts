import {
  SMTP_FROM,
  SMTP_HOST,
  SMTP_PASS,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
} from "astro:env/server";
import { createTransport } from "nodemailer";

const transport = createTransport({
  debug: import.meta.env.DEV === true,
  logger: import.meta.env.DEV === true,

  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,

  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

type SendEmailOptions = {
  from?: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export function sendEmail({ from, ...options }: SendEmailOptions) {
  return transport.sendMail({ from: from || SMTP_FROM, ...options });
}
