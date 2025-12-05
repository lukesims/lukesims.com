import { reference, type SchemaContext, z } from "astro:content";

//==== Blog ============================

export const blogSchema = ({ image }: SchemaContext) =>
  z.object({
    categories: z.array(reference("categories")),
    description: z.string(),
    hero: image(),
    published: z.coerce.date(),
    title: z.string(),
    updated: z.coerce.date().optional(),
  });

export const categoriesSchema = z.object({
  id: z.string(),
  title: z.string(),
});

//==== CV ==============================

export const educationSchema = z.object({
  endDate: z.date().optional(),
  heading: z.string(),
  snippet: z.string().optional(),
  startDate: z.date(),
  subheading: z.string(),
});

export const experienceSchema = z.object({
  company: z.string(),
  endDate: z.date().optional(),
  location: z.string(),
  snippet: z.string().optional(),
  startDate: z.date(),
  title: z.string(),
});

export const skillsTagsSchema = z.object({
  tag: z.string(),
  print: z.boolean().optional().default(false),
});
export const skillsSchema = z.object({
  name: z.string(),
  parent: reference("skills").optional(),
  print: z.boolean().optional().default(true),
  startYear: z.number().optional(),
  tags: z.record(z.string(), skillsTagsSchema),
  theme: z.string().optional(),
});

export const cvSchema = z.object({
  expires: z.coerce.date().optional(),
  location: z.string(),
  published: z.coerce.date(),
  summary: z.string(),
  title: z.string(),
  updated: z.coerce.date().optional(),

  education: z
    .object({
      reference: reference("education"),
      overrides: educationSchema.partial().optional(),
    })
    .array()
    .optional(),

  experience: z
    .object({
      reference: reference("experience"),
      overrides: experienceSchema.partial().optional(),
    })
    .array()
    .optional(),

  skills: z
    .object({
      reference: reference("skills"),
      overrides: skillsSchema
        .extend({
          tags: z.record(z.string(), skillsTagsSchema.partial()),
        })
        .partial()
        .optional(),
    })
    .array()
    .optional(),
});

//==== Navigation ======================

export const contactInfoSchema = z.object({
  items: z.array(
    z.object({
      icon: z.string(),
      text: z.string(),
      url: z.string().url().optional(),
    }),
  ),
});

export const navsSchema = z.object({
  links: z.array(
    z.object({
      href: z.string(),
      text: z.string(),
    }),
  ),
});
