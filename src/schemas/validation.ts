import { z } from "astro/zod";

export const email = () => z.email({ error: "typeMismatch" });

export const string = () =>
  z.string({ error: "valueMissing" }).trim().min(1, { error: "tooShort" });
