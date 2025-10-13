import { file, glob } from "astro/loaders";
import { defineCollection, reference, z } from "astro:content";

/**
 * Blog posts.
 */
const blog = defineCollection({
  loader: glob({ base: "./storage/content/blog", pattern: "**/*.{md,mdx}" }),
  schema: ({ image }) =>
    z.object({
      categories: z.array(reference("categories")),
      description: z.string(),
      hero: image(),
      published: z.coerce.date(),
      title: z.string(),
      updated: z.coerce.date().optional(),
    }),
});

/**
 * Categories for blog posts.
 */
const categories = defineCollection({
  loader: file("./storage/content/categories.json"),
  schema: z.object({
    id: z.string(),
    title: z.string(),
  }),
});

/**
 * Contact info for the contact page and print header.
 */
const contactInfo = defineCollection({
  loader: glob({ base: "./storage/content/contact-info", pattern: "*.json" }),
  schema: z.object({
    items: z.array(
      z.object({
        icon: z.string(),
        text: z.string(),
        url: z.string().url().optional(),
      }),
    ),
  }),
});

/**
 * CV variations/versions.
 */
const cv = defineCollection({
  loader: glob({ base: "./storage/content/cv", pattern: "*.json" }),
  schema: z.object({
    education: z.array(reference("education")).optional(),
    experience: z.array(reference("experience")).optional(),
    expires: z.coerce.date().optional(),
    location: z.string(),
    published: z.coerce.date(),
    skills: z.array(reference("skills")).optional(),
    summary: z.string(),
    title: z.string(),
    updated: z.coerce.date().optional(),
  }),
});

/**
 * Education history for CVs.
 */
const education = defineCollection({
  loader: glob({ base: "./storage/content/education", pattern: "*.md" }),
  schema: z.object({
    endMonth: z.number(),
    endYear: z.number(),
    heading: z.string(),
    startMonth: z.number(),
    startYear: z.number(),
    subheading: z.string(),
  }),
});

/**
 * Work experience for CVs.
 */
const experience = defineCollection({
  loader: glob({ base: "./storage/content/experience", pattern: "*.md" }),
  schema: z.object({
    company: z.string(),
    description: z.string(),
    endMonth: z.number().optional(),
    endYear: z.number().optional(),
    location: z.string(),
    startMonth: z.number(),
    startYear: z.number(),
    tags: z.string().array(),
    title: z.string().optional(),
  }),
});

/**
 * Groups of navigation links to be used in different places.
 */
const navs = defineCollection({
  loader: glob({ base: "./storage/content/navs", pattern: "*.json" }),
  schema: z.object({
    links: z.array(
      z.object({
        href: z.string(),
        text: z.string(),
      }),
    ),
  }),
});

/**
 * Skills for CVs.
 */
const skills = defineCollection({
  loader: glob({ base: "./storage/content/skills", pattern: "*.md" }),
  schema: z.object({
    name: z.string(),
    parent: reference("skills").optional(),
    print: z.boolean().optional(),
    startYear: z.number().optional(),
    tags: z.object({ tag: z.string(), print: z.boolean().optional() }).array(),
    theme: z.string().optional(),
  }),
});

export const collections = {
  blog,
  categories,
  contactInfo,
  cv,
  education,
  experience,
  navs,
  skills,
};
