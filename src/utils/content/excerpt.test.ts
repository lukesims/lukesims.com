import { describe, expect, it } from "vitest";

import { excerptFromHtml, excerptFromText } from "~/utils/content/excerpt";

describe("excerptFromText", () => {
  it("collapses whitespace and trims", () => {
    expect(excerptFromText("  hello\n\tworld  ", 50)).toBe("hello world");
  });

  it("does not truncate when shorter than maxLength", () => {
    expect(excerptFromText("Hello", 10)).toBe("Hello");
  });

  it("does not truncate when equal to maxLength", () => {
    expect(excerptFromText("Hello", 5)).toBe("Hello");
  });

  it("truncates and ends with an ellipsis", () => {
    expect(excerptFromText("Hello world", 6)).toBe("Hello…");
  });

  it("returns length exactly maxLength when truncating (ellipsis included)", () => {
    const result = excerptFromText("abcdef", 4);
    expect(result).toBe("abc…");
    expect(result.length).toBe(4);
  });

  it("handles maxLength=1", () => {
    expect(excerptFromText("Hello", 1)).toBe("…");
  });

  it("treats falsy maxLength as no truncation", () => {
    expect(excerptFromText("Hello", 0)).toBe("Hello");
    expect(excerptFromText("Hello", NaN)).toBe("Hello");
  });

  it("handles negative maxLength by truncating to abs(maxLength)", () => {
    expect(excerptFromText("Hello", -4)).toBe("Hel…");
    expect(excerptFromText("Hello", -1)).toBe("…");
  });

  it("handles empty/whitespace-only text", () => {
    expect(excerptFromText("", 10)).toBe("");
    expect(excerptFromText("   \n\t ", 10)).toBe("");
  });
});

describe("excerptFromHtml", () => {
  it("converts HTML to text", () => {
    expect(excerptFromHtml("<p>Hello <strong>world</strong></p>", 50)).toBe(
      "Hello world",
    );
  });

  it("decodes common HTML entities", () => {
    expect(excerptFromHtml("<p>Tom &amp; Jerry</p>", 50)).toBe("Tom & Jerry");
  });

  it("decodes numeric HTML entities", () => {
    expect(excerptFromHtml("<p>&#x1F30D; &#127757;</p>", 50)).toBe("🌍 🌍");
  });

  it("collapses whitespace introduced by block elements", () => {
    expect(excerptFromHtml("<p>Hello</p><p>world</p>", 50)).toBe("Hello world");
  });

  it("truncates converted text and ends with an ellipsis", () => {
    expect(excerptFromHtml("<p>Hello <strong>world</strong></p>", 6)).toBe(
      "Hello…",
    );
  });

  it("handles empty HTML", () => {
    expect(excerptFromHtml("", 50)).toBe("");
  });
});
