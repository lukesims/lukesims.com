import db from "@astrojs/db";
import node from "@astrojs/node";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, envField } from "astro/config";
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

  integrations: [db(), react()],
  vite: {
    plugins: [tailwindcss()],
  },

  experimental: {
    csp: true,
  },

  env: {
    schema: {
      SITE_URL: envField.string({
        access: "public",
        context: "client",
        optional: false,
        url: true,
      }),
      CONTACT_EMAIL: envField.string({
        access: "public",
        context: "server",
        optional: false,
      }),

      SMTP_HOST: envField.string({
        access: "public",
        context: "server",
        optional: false,
      }),
      SMTP_PORT: envField.number({
        access: "public",
        context: "server",
        optional: false,
      }),
      SMTP_USER: envField.string({
        access: "secret",
        context: "server",
        optional: true,
      }),
      SMTP_PASS: envField.string({
        access: "secret",
        context: "server",
        optional: true,
      }),
      SMTP_SECURE: envField.boolean({
        access: "public",
        context: "server",
        default: false,
        optional: true,
      }),
      SMTP_FROM: envField.string({
        access: "public",
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
