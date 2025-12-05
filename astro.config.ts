import node from "@astrojs/node";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, envField, fontProviders } from "astro/config";
import { loadEnv } from "vite";

const { SITE_URL } = loadEnv(
  process.env.NODE_ENV || "production",
  process.cwd(),
  "",
);

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  trailingSlash: "never",

  adapter: node({
    mode: "standalone",
  }),

  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },

  experimental: {
    csp: {
      scriptDirective: {
        resources: ["'self'", "https://challenges.cloudflare.com"],
      },
    },
    fonts: [
      {
        cssVariable: "--font-bricolage-grotesque",
        name: "Bricolage Grotesque",
        provider: fontProviders.google(),
        weights: [400, 500, 600, 700, 800],
      },
      {
        cssVariable: "--font-public-sans",
        name: "Public Sans",
        provider: fontProviders.google(),
        weights: [400, 500, 600, 700],
      },
    ],
  },

  env: {
    schema: {
      SITE_URL: envField.string({
        access: "public",
        context: "client",
        optional: false,
        url: true,
      }),

      HMAC_KEY: envField.string({
        access: "secret",
        context: "server",
        optional: false,
      }),
      HMAC_ALGO: envField.string({
        access: "public",
        context: "server",
        optional: false,
      }),

      MAILGUN_API_KEY: envField.string({
        access: "secret",
        context: "server",
        optional: false,
      }),
      MAILGUN_BASE_URL: envField.string({
        access: "secret",
        context: "server",
        optional: false,
      }),
      MAILGUN_DOMAIN: envField.string({
        access: "secret",
        context: "server",
        optional: false,
      }),

      CONTACT_EMAIL: envField.string({
        access: "secret",
        context: "server",
        optional: false,
      }),
      FROM_EMAIL: envField.string({
        access: "secret",
        context: "server",
        optional: false,
      }),

      STORAGE_PATH: envField.string({
        access: "public",
        context: "server",
        optional: false,
      }),

      TURNSTILE_SITE_KEY: envField.string({
        access: "public",
        context: "client",
        optional: false,
      }),
      TURNSTILE_SECRET_KEY: envField.string({
        access: "secret",
        context: "server",
        optional: false,
      }),
    },
  },
});
