import { beforeEach, describe, expect, it, vi } from "vitest";

import { sendEmailViaMailgun } from "~/utils/email/mailgun";

const { mgCreateMessage } = vi.hoisted(() => ({
  mgCreateMessage: vi.fn(),
}));

vi.mock("mailgun.js", () => ({
  default: vi.fn(function (this: unknown) {
    return {
      client: vi.fn(() => ({
        messages: {
          create: mgCreateMessage,
        },
      })),
    };
  }),
}));

const { FROM_EMAIL, MAILGUN_DOMAIN } = import.meta.env;

describe("sendEmailViaMailgun", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("passes `email` argument to mailgun client", async () => {
    await sendEmailViaMailgun({
      to: ["to@example.com"],
      from: "from@example.com",
      subject: "subject",
      text: "text",
    });
    expect(mgCreateMessage).toHaveBeenCalledTimes(1);
    expect(mgCreateMessage).toHaveBeenCalledWith(MAILGUN_DOMAIN, {
      to: ["to@example.com"],
      from: "from@example.com",
      subject: "subject",
      text: "text",
    });
  });

  it("uses `env.FROM_EMAIL` when `email.from` is not provided", async () => {
    await sendEmailViaMailgun({
      to: ["to@example.com"],
      subject: "subject",
      text: "text",
    });
    expect(mgCreateMessage).toHaveBeenCalledTimes(1);
    expect(mgCreateMessage).toHaveBeenCalledWith(MAILGUN_DOMAIN, {
      from: FROM_EMAIL,
      to: ["to@example.com"],
      subject: "subject",
      text: "text",
    });
  });

  it("returns mailgun client's return value as-is", async () => {
    const mockResponse = { id: "msg-123", status: 200 };
    mgCreateMessage.mockResolvedValueOnce(mockResponse);
    expect(
      await sendEmailViaMailgun({
        to: ["to@example.com"],
        subject: "subject",
        text: "text",
      }),
    ).toBe(mockResponse);
  });
});
