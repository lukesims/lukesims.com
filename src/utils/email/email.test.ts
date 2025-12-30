import { beforeEach, describe, expect, it, vi } from "vitest";

import { sendEmail, type SendEmailConfig } from "~/utils/email";

const { sendEmailViaMailgun, sendEmailViaMailpit } = vi.hoisted(() => ({
  sendEmailViaMailgun: vi.fn(),
  sendEmailViaMailpit: vi.fn(),
}));

vi.mock(import("~/utils/email/mailgun"), () => ({ sendEmailViaMailgun }));
vi.mock(import("~/utils/email/mailpit"), () => ({ sendEmailViaMailpit }));

const emailData: SendEmailConfig = {
  from: "from@example.com",
  to: ["to@example.com"],
  subject: "subject",
  text: "text",
  html: "<p>html</p>",
};

describe("sendEmail", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("uses mailgun by default & mailpit during tests", async () => {
    vi.mocked(sendEmailViaMailgun).mockResolvedValue({ id: "MAILGUN" });
    vi.mocked(sendEmailViaMailpit).mockResolvedValue({ id: "MAILPIT" });

    vi.stubEnv("MODE", "production");
    let result = await sendEmail(emailData);
    expect(result.id).toBe("MAILGUN");
    expect(sendEmailViaMailgun).toHaveBeenCalledTimes(1);
    expect(sendEmailViaMailpit).toHaveBeenCalledTimes(0);

    vi.stubEnv("MODE", "development");
    result = await sendEmail(emailData);
    expect(result.id).toBe("MAILGUN");
    expect(sendEmailViaMailgun).toHaveBeenCalledTimes(2);
    expect(sendEmailViaMailpit).toHaveBeenCalledTimes(0);

    vi.stubEnv("MODE", "somethingelse");
    result = await sendEmail(emailData);
    expect(result.id).toBe("MAILGUN");
    expect(sendEmailViaMailgun).toHaveBeenCalledTimes(3);
    expect(sendEmailViaMailpit).toHaveBeenCalledTimes(0);

    vi.stubEnv("MODE", "test");
    result = await sendEmail(emailData);
    expect(result.id).toBe("MAILPIT");
    expect(sendEmailViaMailgun).toHaveBeenCalledTimes(3);
    expect(sendEmailViaMailpit).toHaveBeenCalledTimes(1);
  });

  it("passes on `email` argument as-is", async () => {
    vi.stubEnv("MODE", "test");
    await sendEmail(emailData);
    expect(sendEmailViaMailpit).toHaveBeenCalledWith(emailData);
    expect(sendEmailViaMailgun).toHaveBeenCalledTimes(0);
    expect(sendEmailViaMailpit).toHaveBeenCalledTimes(1);

    vi.stubEnv("MODE", "somethingelse");
    await sendEmail(emailData);
    expect(sendEmailViaMailgun).toHaveBeenCalledWith(emailData);
    expect(sendEmailViaMailgun).toHaveBeenCalledTimes(1);
    expect(sendEmailViaMailpit).toHaveBeenCalledTimes(1);
  });

  it("throws if `email` argument is missing any required options", () => {
    const { subject, ...noSubject } = emailData;
    const { text, ...noText } = emailData;
    const { to, ...noTo } = emailData;
    expect(() => sendEmail(noSubject as SendEmailConfig)).toThrow();
    expect(() => sendEmail(noText as SendEmailConfig)).toThrow();
    expect(() => sendEmail(noTo as SendEmailConfig)).toThrow();
    expect(() => sendEmail({} as SendEmailConfig)).toThrow();
  });

  it("throws if `email` argument is the wrong type", () => {
    for (const value of [
      null,
      undefined,
      NaN,
      1,
      1n,
      "foo",
      true,
      Symbol("foo"),
      function () {},
      () => {},
    ]) {
      expect(() => sendEmail(value as unknown as SendEmailConfig)).toThrow();
    }
  });
});
