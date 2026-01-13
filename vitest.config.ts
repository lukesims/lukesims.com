import { getViteConfig } from "astro/config";
import { loadEnv } from "vite";
import { configDefaults } from "vitest/config";

export default getViteConfig({
  // @ts-expect-error types are wrong
  test: {
    env: loadEnv("test", process.cwd(), ""),
    exclude: [...configDefaults.exclude, "tests/e2e/*"],
  },
});
