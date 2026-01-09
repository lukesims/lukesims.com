import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { loadEnv } from "vite";

const { PUBLIC_SITE_URL } = loadEnv(
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

  integrations: [mdx(), react(), sitemap()],

  server: {
    host: true,
    port: 8787,
  },

  vite: {
    plugins: [tailwindcss()],
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
