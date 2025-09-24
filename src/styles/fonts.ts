import bricolageGrotesqueRaw from "@fontsource-variable/bricolage-grotesque/index.css?raw";
import publicSansRaw from "@fontsource-variable/public-sans/index.css?raw";
import { join } from "node:path";

/**
 * Here we load the fontsource font files and their accompanying CSS files, then
 * replace all references to the font paths in the CSS with base64 data URIs to
 * inline the fonts. This is because we use Puppeteer to generate PDFs of some
 * of the site's pages and we insert custom a header and footer into those PDFs.
 *
 * For us to use custom fonts in the PDF header/footer, they must be inlined and
 * the implementation must match that of the main page, so we use inline fonts
 * for the main site too.
 *
 * @see https://github.com/puppeteer/puppeteer/issues/10407
 * @see https://github.com/puppeteer/puppeteer/issues/10407#issuecomment-1673150760
 * @see https://github.com/puppeteer/puppeteer/issues/1853
 *
 * In the future if there is better support for the CSS element() function,
 * we'll be able to create our headers/footers in the CSS and can eliminate the
 * need for a custom header/footer in Puppeteer, so we'll no longer need to do
 * all this with the fonts.
 *
 * @see https://caniuse.com/css-element-function
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/element
 * @see https://www.w3.org/TR/css-gcpm-3/#running-elements
 * @see https://stackoverflow.com/a/9742295
 *
 * @todo Eliminate unused fonts from the generated CSS string
 */

const fonts = [
  {
    name: "bricolage-grotesque",
    raw: bricolageGrotesqueRaw,
    files: import.meta.glob(
      "../../node_modules/@fontsource-variable/bricolage-grotesque/files/*.woff2",
      { import: "default", query: "?inline" },
    ),
  },
  {
    name: "public-sans",
    raw: publicSansRaw,
    files: import.meta.glob(
      "../../node_modules/@fontsource-variable/public-sans/files/*.woff2",
      { import: "default", query: "?inline" },
    ),
  },
];

let css = "";

for (const { files, name, raw } of fonts) {
  let fontCss = raw;
  let fontUrls = fontCss.matchAll(/url\(([^)]+)\)/g);

  for (const match of fontUrls) {
    const key = join("../../node_modules/@fontsource-variable", name, match[1]);
    const base64 = (await files[key]()) as string;
    fontCss = fontCss.replace(match[1], base64);
  }

  css += fontCss + "\n";
}

export { css };
