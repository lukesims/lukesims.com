import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import sentry from "@sentry/astro";
import {
  transformerNotationDiff,
  transformerNotationHighlight,
} from "@shikijs/transformers";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, envField } from "astro/config";
import { loadEnv } from "vite";

import { transformerMetaTitle } from "./src/utils/shiki";

const { ALLOWED_DOMAINS, PUBLIC_SITE_URL, SENTRY_ENABLED } = loadEnv(
  process.env.NODE_ENV || "production",
  process.cwd(),
  "",
);

// https://astro.build/config
export default defineConfig({
  site: PUBLIC_SITE_URL,
  trailingSlash: "never",

  adapter:
    process.env.NODE_ENV === "test"
      ? undefined // Disabled for vitest
      : cloudflare({
          imageService: "cloudflare-binding",
          prerenderEnvironment: "node",
        }),

  env: {
    schema: {
      CONTACT_EMAIL: envField.string({ context: "server", access: "secret" }),
      FROM_EMAIL: envField.string({ context: "server", access: "secret" }),
      HMAC_ALGO: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      HMAC_KEY: envField.string({ context: "server", access: "secret" }),
      MAILGUN_API_KEY: envField.string({ context: "server", access: "secret" }),
      MAILGUN_BASE_URL: envField.string({
        context: "server",
        access: "secret",
      }),
      MAILGUN_DOMAIN: envField.string({ context: "server", access: "secret" }),
      MAILPIT_URL: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      TURNSTILE_SECRET_KEY: envField.string({
        context: "server",
        access: "secret",
      }),
    },
  },

  integrations: [
    mdx({
      shikiConfig: {
        transformers: [
          transformerMetaTitle,
          transformerNotationDiff(),
          transformerNotationHighlight(),
        ],
      },
    }),
    react(),
    sentry({ enabled: SENTRY_ENABLED === "true" }),
    sitemap(),
  ],

  markdown: {
    shikiConfig: {
      theme: "plastic",
      wrap: true,
    },
  },

  security: {
    checkOrigin: true,
    allowedDomains: ALLOWED_DOMAINS
      ? ALLOWED_DOMAINS.split(",").map((d) => {
          const url = new URL(d);
          return {
            hostname: url.hostname,
            protocol: url.protocol.replace(":", ""),
            port: url.port || (url.protocol === "https:" ? "443" : "80"),
          };
        })
      : undefined,
    // TODO: Move away from Shiki or find a CSP workaround
    // csp: {
    //   directives: [
    //     "base-uri 'self'",
    //     `connect-src 'self' ${PUBLIC_SENTRY_DSN ? new URL(PUBLIC_SENTRY_DSN).origin : ""}`,
    //     "form-action 'self'",
    //     "frame-src 'self' https://challenges.cloudflare.com",
    //     "object-src 'none'",
    //   ],
    //   scriptDirective: {
    //     resources: ["'self'", "https://challenges.cloudflare.com"],
    //   },
    // },
  },

  server: {
    host: true,
    port: 8787,
  },

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: ["astro/env/runtime", "zod"],
    },
    ssr: {
      external: [
        "node:buffer",
        "node:crypto",
        "node:fs/promises",
        "node:path",
        "node:url",
      ],
    },
  },
});
