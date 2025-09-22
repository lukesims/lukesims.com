import { STORAGE_PATH } from "astro:env/server";
import { resolve } from "node:path";

export const basePath = (...path: string[]) =>
  resolve(import.meta.dirname, "../..", ...path);

export const storagePath = (...path: string[]) =>
  resolve(STORAGE_PATH, ...path);
