import z from "zod";

export const sendEmailConfigSchema = z.object({
  from: z.email().optional(),
  html: z.string().optional(),
  subject: z.string(),
  text: z.string(),
  to: z.email().array(),
});

export type SendEmailConfig = z.infer<typeof sendEmailConfigSchema>;
export type SendEmailResponse = {
  id?: string;
  message?: string;
  status?: number;
};
