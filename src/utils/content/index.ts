import { getCollection, getEntry } from "astro:content";

import { flatten } from "~/utils/content/flatten";

export * from "~/utils/content/cv";
export * from "~/utils/content/excerpt";
export * from "~/utils/content/flatten";

/**
 * Get all blog posts that should be rendered (i.e. listed on
 * the blog index page and have an individual route/page created).
 */
export function getRenderableBlogPosts() {
  return getCollection(
    "blog",
    (entry) =>
      // In development load all posts regardless of whether they're published
      import.meta.env.MODE === "development" ||
      // In all other modes, check that the publish date is in the past
      (entry.data.published &&
        entry.data.published.getTime() > 0 &&
        entry.data.published <= new Date()),
  );
}

/**
 * Get a particular `contactInfo` entry by ID.
 */
export async function getContactInfo(id: string) {
  const entry = await getEntry("contactInfo", id);
  return entry ? flatten<"contactInfo">(entry) : undefined;
}

/**
 * Get a particular `navs` entry by ID.
 */
export async function getNav(id: string) {
  const entry = await getEntry("navs", id);
  return entry ? flatten<"navs">(entry) : undefined;
}
