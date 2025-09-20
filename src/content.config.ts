import { file, glob } from "astro/loaders";
import { defineCollection, reference, z } from "astro:content";

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

const categories = defineCollection({
  loader: file("./storage/content/categories.json"),
  schema: z.object({
    id: z.string(),
    title: z.string(),
  }),
});

export const collections = {
  blog,
  categories,
};
