import { FROM_EMAIL, MAILPIT_URL } from "astro:env/server";

import type { SendEmailConfig, SendEmailResponse } from "~/utils/email/types";

export async function sendEmailViaMailpit(
  email: SendEmailConfig,
): Promise<SendEmailResponse> {
  const res = await fetch(`${MAILPIT_URL}/api/v1/send`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      To: email.to.map((Email) => ({ Email })),
      From: { Email: email.from || FROM_EMAIL },
      Subject: email.subject,
      Text: email.text,
      HTML: email.html,
    }),
  });
  if (!res.ok || res.status !== 200) {
    throw new Error(`Mailpit API Error (${res.status}): ${await res.text()}`);
  }
  return {
    id: ((await res.json()) as { ID: string }).ID,
    status: 200,
  };
}
