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

const contentPath = (path: string) => `${import.meta.env.CONTENT_PATH}/${path}`;

export const collections = {
  blog: defineCollection({
    loader: glob({
      base: contentPath("blog"),
      pattern: "**/*.{md,mdx}",
    }),
    schema: blogSchema,
  }),

  categories: defineCollection({
    loader: file(contentPath("categories.json")),
    schema: categoriesSchema,
  }),

  contactInfo: defineCollection({
    loader: glob({
      base: contentPath("contact-info"),
      pattern: "*.json",
    }),
    schema: contactInfoSchema,
  }),

  cv: defineCollection({
    loader: glob({
      base: contentPath("cv"),
      pattern: "*.json",
    }),
    schema: cvSchema,
  }),

  education: defineCollection({
    loader: glob({
      base: contentPath("education"),
      pattern: "*.md",
    }),
    schema: educationSchema,
  }),

  experience: defineCollection({
    loader: glob({
      base: contentPath("experience"),
      pattern: "*.md",
    }),
    schema: experienceSchema,
  }),

  navs: defineCollection({
    loader: glob({
      base: contentPath("navs"),
      pattern: "*.json",
    }),
    schema: navsSchema,
  }),

  pages: defineCollection({
    loader: glob({
      base: contentPath("pages"),
      pattern: "**/*.{md,mdx}",
    }),
    schema: pagesSchema,
  }),

  skills: defineCollection({
    loader: glob({
      base: contentPath("skills"),
      pattern: "*.md",
    }),
    schema: skillsSchema,
  }),
};
