import { beforeEach, describe, expect, it, vi } from "vitest";

import { sendEmail } from "./email";

const { mockCreate } = vi.hoisted(() => {
  return { mockCreate: vi.fn() };
});

vi.mock("mailgun.js", () => {
  const MockMailgun = vi.fn(function (this: unknown) {
    return {
      client: vi.fn(() => ({
        messages: {
          create: mockCreate,
        },
      })),
    };
  });
  return {
    default: MockMailgun,
  };
});

describe("sendEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends emails with required fields", async () => {
    const email = {
      to: "user@example.com",
      subject: "Test Subject",
      text: "Test content",
    };
    await sendEmail(email);
    expect(mockCreate).toHaveBeenCalledWith(import.meta.env.MAILGUN_DOMAIN, {
      to: [email.to],
      from: import.meta.env.FROM_EMAIL,
      subject: email.subject,
      text: email.text,
      html: undefined,
    });
  });

  it("sends emails with all fields", async () => {
    const email = {
      to: "user@example.com",
      from: "custom@example.com",
      subject: "Test Subject",
      text: "Test content",
      html: "<p>Test content</p>",
    };
    await sendEmail(email);
    expect(mockCreate).toHaveBeenCalledWith(import.meta.env.MAILGUN_DOMAIN, {
      to: [email.to],
      from: email.from,
      subject: email.subject,
      text: email.text,
      html: email.html,
    });
  });

  it("returns the value returned by MailgunClient.messages.create()", async () => {
    const mockResponse = { id: "msg-123", status: 200 };
    mockCreate.mockResolvedValueOnce(mockResponse);

    expect(
      await sendEmail({
        to: "user@example.com",
        subject: "Test",
        text: "Test",
      }),
    ).toEqual(mockResponse);
  });
});
