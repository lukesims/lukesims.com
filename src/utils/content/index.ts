import { getEntry } from "astro:content";

import { flatten } from "~/utils/content/flatten";

export * from "~/utils/content/cv";
export * from "~/utils/content/flatten";

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
