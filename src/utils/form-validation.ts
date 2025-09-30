import z from "zod";

export const email = () => string().email({ message: "typeMismatch" });

export const string = () =>
  z.string({ message: "valueMissing" }).min(1, { message: "tooShort" });
