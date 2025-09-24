import puppeteer, { type PDFOptions } from "puppeteer";

import appCss from "~/styles/app.css?inline";
import { css as fontsCss } from "~/styles/fonts";
import { storagePath } from "~/utils/paths";

const userDataDir = storagePath("puppeteer/data");

const wrapHeaderFooter = (html: string) => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width" />
      <style>
        ${fontsCss}
        ${appCss}
        html, body {
          background: none;
          font-size: 16px;
        }
      </style>
    </head>
    <body>
      ${html}
    </body>
  </html>
`;

export async function generateCvPdf(url: string, path: string) {
  const browser = await puppeteer.launch({ userDataDir });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });

  const [footerTemplate, headerTemplate] = await page.evaluate(() => {
    document.querySelectorAll(".print\\:hidden").forEach((el) => el.remove());

    const footerElem = document.getElementById("page-footer");
    const footerHtml = footerElem?.outerHTML;
    footerElem?.remove();

    const headerElem = document.getElementById("page-header");
    const headerHtml = headerElem?.outerHTML;
    headerElem?.remove();

    return [footerHtml, headerHtml];
  });

  const pdfOptions: PDFOptions = {
    format: "A4",
    margin: { bottom: "118px", left: 0, right: 0, top: "110px" },
    omitBackground: true,
    outline: false,
    path,
    printBackground: true,
    scale: 1,
    tagged: false,
    timeout: 10_000,
    waitForFonts: true,
  };
  if (headerTemplate) {
    pdfOptions.displayHeaderFooter = true;
    pdfOptions.headerTemplate = wrapHeaderFooter(headerTemplate);
  }
  if (footerTemplate) {
    pdfOptions.displayHeaderFooter = true;
    pdfOptions.footerTemplate = wrapHeaderFooter(footerTemplate);
  }

  await page.pdf(pdfOptions);
  await browser.close();
}
