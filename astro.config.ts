import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import sentry from "@sentry/astro";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { loadEnv } from "vite";

const { PUBLIC_SITE_URL, SENTRY_ENABLED } = loadEnv(
  process.env.NODE_ENV || "production",
  process.cwd(),
  "",
);

// https://astro.build/config
export default defineConfig({
  site: PUBLIC_SITE_URL,
  trailingSlash: "never",

  adapter: cloudflare({
    cloudflareModules: false,
    imageService: "cloudflare",
  }),

  experimental: {
    csp: {
      scriptDirective: {
        resources: ["'self'", "https://challenges.cloudflare.com"],
      },
    },
  },

  integrations: [
    mdx(),
    react(),
    sentry({ enabled: SENTRY_ENABLED === "true" }),
    sitemap(),
  ],

  security: {
    checkOrigin: true,
  },

  server: {
    host: true,
    port: 8787,
  },

  vite: {
    plugins: [
      // @ts-expect-error types are wrong
      tailwindcss(),
    ],
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
