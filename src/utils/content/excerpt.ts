import { htmlToText } from "html-to-text";

export function excerptFromText(text: string, maxLength: number) {
  const collapsed = text.replace(/\s+/g, " ").trim();
  if (!maxLength || collapsed.length <= maxLength) return collapsed;
  return collapsed.slice(0, Math.abs(maxLength) - 1) + "…";
}

export function excerptFromHtml(html: string, maxLength: number) {
  return excerptFromText(
    htmlToText(html, {
      wordwrap: false,
      selectors: [
        { selector: "a", options: { ignoreHref: true } },
        { selector: "script", format: "skip" },
        { selector: "style", format: "skip" },
      ],
    }),
    maxLength,
  );
}
