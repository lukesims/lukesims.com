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

  integrations: [react()],
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
    },
  },
});
