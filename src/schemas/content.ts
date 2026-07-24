import { z } from "astro/zod";
import { reference, type SchemaContext } from "astro:content";

//==== Pages ===========================

export const pagesSchema = z.object({
  bodyClass: z.string().optional(),
  canonical: z.url().optional(),
  container: z.enum(["sm", "md", "lg"]).optional(),
  description: z.string().optional(),
  nofollow: z.boolean().optional().default(false),
  noindex: z.boolean().optional().default(false),
  title: z.string(),
});

//==== Blog ============================

export const blogSchema = ({ image }: SchemaContext) =>
  z.object({
    title: z.string(),
    description: z.string(),
    categories: z.array(reference("categories")),
    published: z.coerce.date().optional(),
    updated: z.coerce.date().optional(),

    hero: z.optional(
      z.union([
        image(),
        z.object({
          url: image(),
          class: z.string().optional(),
          credit: z.optional(z.object({ name: z.string(), url: z.url() })),
        }),
      ]),
    ),
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
  tags: z.record(z.string(), skillsTagsSchema).optional(),
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
      url: z.url().optional(),
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
