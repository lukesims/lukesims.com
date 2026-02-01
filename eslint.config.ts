import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier/flat";
import astroPlugin from "eslint-plugin-astro";
import reactPlugin from "eslint-plugin-react";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },

  tseslint.configs.recommended,
  astroPlugin.configs.recommended,
  astroPlugin.configs["jsx-a11y-recommended"],

  {
    ...reactPlugin.configs.flat.recommended,
    settings: { react: { version: "detect" } },
    ignores: ["**/*.astro"],
  },

  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { caughtErrorsIgnorePattern: "^_", ignoreRestSiblings: true },
      ],
      "react/jsx-no-target-blank": ["error", { allowReferrer: true }],
      "react/react-in-jsx-scope": "off",
    },
  },

  prettierConfig,
  globalIgnores([
    ".astro/*",
    ".wrangler/*",
    "dist/*",
    "worker-configuration.d.ts",
  ]),
]);
