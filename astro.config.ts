import db from "@astrojs/db";
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

  integrations: [db(), react()],
  vite: {
    plugins: [tailwindcss()],
  },

  env: {
    schema: {
      SITE_URL: envField.string({
        access: "public",
        context: "client",
        optional: false,
      }),
      CONTACT_EMAIL: envField.string({
        access: "public",
        context: "server",
        optional: false,
      }),

      SMTP_FROM: envField.string({
        access: "public",
        context: "server",
        default: "Luke Sims <do-not-reply@lukesims.com>",
        optional: true,
      }),
      SMTP_HOST: envField.string({
        access: "public",
        context: "server",
        optional: false,
      }),
      SMTP_PASS: envField.string({
        access: "secret",
        context: "server",
        optional: true,
      }),
      SMTP_PORT: envField.number({
        access: "public",
        context: "server",
        optional: false,
      }),
      SMTP_SECURE: envField.boolean({
        access: "public",
        context: "server",
        default: false,
        optional: true,
      }),
      SMTP_USER: envField.string({
        access: "secret",
        context: "server",
        optional: true,
      }),

      STORAGE_PATH: envField.string({
        access: "public",
        context: "server",
        optional: false,
      }),
    },
  },
});
