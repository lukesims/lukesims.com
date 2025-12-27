import z from "zod";

export const email = () => string().trim().email({ message: "typeMismatch" });

export const string = () =>
  z.string({ message: "valueMissing" }).trim().min(1, { message: "tooShort" });
