import { file, glob } from "astro/loaders";
import { defineCollection } from "astro:content";

import {
  blogSchema,
  categoriesSchema,
  contactInfoSchema,
  cvSchema,
  educationSchema,
  experienceSchema,
  navsSchema,
  pagesSchema,
  skillsSchema,
} from "~/schemas/content";

export const collections = {
  blog: defineCollection({
    loader: glob({ base: "content/blog", pattern: "**/*.{md,mdx}" }),
    schema: blogSchema,
  }),

  categories: defineCollection({
    loader: file("content/categories.json"),
    schema: categoriesSchema,
  }),

  contactInfo: defineCollection({
    loader: glob({ base: "content/contact-info", pattern: "*.json" }),
    schema: contactInfoSchema,
  }),

  cv: defineCollection({
    loader: glob({ base: "content/cv", pattern: "*.json" }),
    schema: cvSchema,
  }),

  education: defineCollection({
    loader: glob({ base: "content/education", pattern: "*.md" }),
    schema: educationSchema,
  }),

  experience: defineCollection({
    loader: glob({ base: "content/experience", pattern: "*.md" }),
    schema: experienceSchema,
  }),

  navs: defineCollection({
    loader: glob({ base: "content/navs", pattern: "*.json" }),
    schema: navsSchema,
  }),

  pages: defineCollection({
    loader: glob({ base: "content/pages", pattern: "**/*.{md,mdx}" }),
    schema: pagesSchema,
  }),

  skills: defineCollection({
    loader: glob({ base: "content/skills", pattern: "*.md" }),
    schema: skillsSchema,
  }),
};
