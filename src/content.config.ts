import { file, glob } from "astro/loaders";
import {
  defineCollection,
  reference,
  type SchemaContext,
  z,
} from "astro:content";

//==== Blog ============================

const blogSchema = ({ image }: SchemaContext) =>
  z.object({
    categories: z.array(reference("categories")),
    description: z.string(),
    hero: image(),
    published: z.coerce.date(),
    title: z.string(),
    updated: z.coerce.date().optional(),
  });

const categoriesSchema = z.object({
  id: z.string(),
  title: z.string(),
});

//==== CV ==============================

const educationSchema = z.object({
  endDate: z.date().optional(),
  heading: z.string(),
  snippet: z.string().optional(),
  startDate: z.date(),
  subheading: z.string(),
});

const experienceSchema = z.object({
  company: z.string(),
  endDate: z.date().optional(),
  location: z.string(),
  snippet: z.string().optional(),
  startDate: z.date(),
  title: z.string(),
});

const skillsTagsSchema = z.object({
  tag: z.string(),
  print: z.boolean().optional().default(false),
});
const skillsSchema = z.object({
  name: z.string(),
  parent: reference("skills").optional(),
  print: z.boolean().optional().default(true),
  startYear: z.number().optional(),
  tags: z.record(z.string(), skillsTagsSchema),
  theme: z.string().optional(),
});

const cvSchema = z.object({
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

//==== Misc. ===========================

const contactInfoSchema = z.object({
  items: z.array(
    z.object({
      icon: z.string(),
      text: z.string(),
      url: z.string().url().optional(),
    }),
  ),
});

const navsSchema = z.object({
  links: z.array(
    z.object({
      href: z.string(),
      text: z.string(),
    }),
  ),
});

//======================================

export const collections = {
  blog: defineCollection({
    schema: blogSchema,
    loader: glob({
      base: "./storage/content/blog",
      pattern: "**/*.{md,mdx}",
    }),
  }),

  categories: defineCollection({
    loader: file("./storage/content/categories.json"),
    schema: categoriesSchema,
  }),

  contactInfo: defineCollection({
    schema: contactInfoSchema,
    loader: glob({
      base: "./storage/content/contact-info",
      pattern: "*.json",
    }),
  }),

  cv: defineCollection({
    schema: cvSchema,
    loader: glob({
      base: "./storage/content/cv",
      pattern: "*.json",
    }),
  }),

  education: defineCollection({
    schema: educationSchema,
    loader: glob({
      base: "./storage/content/education",
      pattern: "*.md",
    }),
  }),

  experience: defineCollection({
    schema: experienceSchema,
    loader: glob({
      base: "./storage/content/experience",
      pattern: "*.md",
    }),
  }),

  navs: defineCollection({
    schema: navsSchema,
    loader: glob({
      base: "./storage/content/navs",
      pattern: "*.json",
    }),
  }),

  skills: defineCollection({
    schema: skillsSchema,
    loader: glob({
      base: "./storage/content/skills",
      pattern: "*.md",
    }),
  }),
};
