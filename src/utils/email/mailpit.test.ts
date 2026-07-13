import { beforeEach, describe, expect, it, vi } from "vitest";

import { sendEmailViaMailpit } from "~/utils/email/mailpit";

const mockEnv = vi.hoisted(() => ({
  FROM_EMAIL: "from_email@example.com",
  MAILPIT_URL: "http://localhost:8025",
}));

vi.mock("astro:env/server", () => mockEnv);

describe("sendEmailViaMailpit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEnv.FROM_EMAIL = "from_email@example.com";
    mockEnv.MAILPIT_URL = "http://localhost:8025";
    global.fetch = vi.fn();
  });

  it("passes modified `email` argument as JSON in request body", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      json: vi.fn().mockResolvedValue({ ID: "123" }),
      ok: true,
      status: 200,
    } as unknown as Response);

    await sendEmailViaMailpit({
      to: ["to@example.com"],
      from: "from@example.com",
      subject: "subject",
      text: "text",
      html: "<p>html</p>",
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("api/v1/send"),
      expect.objectContaining({
        body: JSON.stringify({
          To: [{ Email: "to@example.com" }],
          From: { Email: "from@example.com" },
          Subject: "subject",
          Text: "text",
          HTML: "<p>html</p>",
        }),
      }),
    );
  });

  it("uses `env.FROM_EMAIL` when `email.from` is not provided", async () => {
    mockEnv.FROM_EMAIL = "from_email@example.com";
    vi.mocked(global.fetch).mockResolvedValueOnce({
      json: vi.fn().mockResolvedValue({ ID: "123" }),
      ok: true,
      status: 200,
    } as unknown as Response);

    await sendEmailViaMailpit({
      to: ["to@example.com"],
      subject: "subject",
      text: "text",
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("api/v1/send"),
      expect.objectContaining({
        body: JSON.stringify({
          To: [{ Email: "to@example.com" }],
          From: { Email: "from_email@example.com" },
          Subject: "subject",
          Text: "text",
        }),
      }),
    );
  });

  it("returns mailpit response, modified to match mailgun", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      json: vi.fn().mockResolvedValue({ ID: "123" }),
      ok: true,
      status: 200,
    } as unknown as Response);

    const result = await sendEmailViaMailpit({
      to: ["to@example.com"],
      subject: "subject",
      text: "text",
    });

    expect(result).toEqual({ id: "123", status: 200 });
  });

  it("throws if request is not successful", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: vi.fn(),
    } as unknown as Response);

    await expect(() =>
      sendEmailViaMailpit({
        to: ["to@example.com"],
        subject: "subject",
        text: "text",
      }),
    ).rejects.toThrow();
  });
});
