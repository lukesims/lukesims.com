import Mailgun from "mailgun.js";

type EmailConfig = {
  to: string;
  from?: string;
  subject: string;
  text: string;
  html?: string;
};

type EmailResponse = {
  id?: string;
  message?: string;
};

export function sendEmail(email: EmailConfig): Promise<EmailResponse> {
  return import.meta.env.MODE === "test"
    ? sendEmailViaMailpit(email)
    : sendEmailViaMailgun(email);
}

//==== Mailgun =========================

const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
  key: import.meta.env.MAILGUN_API_KEY,
  url: import.meta.env.MAILGUN_BASE_URL,
  useFetch: true,
  username: "api",
});

function sendEmailViaMailgun(email: EmailConfig) {
  return mg.messages.create(import.meta.env.MAILGUN_DOMAIN, {
    to: [email.to],
    from: email.from || import.meta.env.FROM_EMAIL,
    subject: email.subject,
    text: email.text,
    html: email.html,
  });
}

//==== Mailpit =========================

async function sendEmailViaMailpit(email: EmailConfig) {
  const res = await fetch(`${import.meta.env.MAILPIT_URL}/api/v1/send`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      To: [{ Email: email.to }],
      From: { Email: email.from || import.meta.env.FROM_EMAIL },
      Subject: email.subject,
      Text: email.text,
      HTML: email.html,
    }),
  });
  if (!res.ok || res.status !== 200) {
    throw new Error(`Mailpit API Error (${res.status}): ${await res.text()}`);
  }
  return {
    id: (await res.json()).ID,
  };
}
