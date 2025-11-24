import {
  type CollectionEntry,
  getCollection,
  getEntry,
  type InferEntrySchema,
} from "astro:content";
import merge from "lodash/merge";

import { type FlatEntry, flatten } from "~/utils/content/flatten";

export type CV = Omit<
  FlatEntry<"cv">,
  "education" | "experience" | "skills"
> & {
  education: FlatEntry<"education">[];
  experience: FlatEntry<"experience">[];
  skills: Skill[];
};

export type Skill = Omit<FlatEntry<"skills">, "children"> & {
  children?: Skill[];
};

/**
 * Get a particular `cv` entry by ID, along with its related
 * `education`, `experience` and `skills` entries eager-loaded.
 */
export async function getCv(id: string): Promise<CV | undefined> {
  const entry = await getEntry("cv", id);

  if (!entry) {
    return undefined;
  }

  return {
    ...flatten<"cv">(entry),
    education: await getEducation(entry.data),
    experience: await getExperience(entry.data),
    skills: await getSkills(entry.data),
  };
}

/**
 * Given a `cv` entry's data, returns the `education` entries that are
 * referenced and with any data overrides specified in the `cv` applied.
 */
async function getEducation({ education }: InferEntrySchema<"cv">) {
  let entries: CollectionEntry<"education">[] = [];

  if (education) {
    for (let i = 0; i < education.length; i++) {
      const { reference, overrides } = education[i];
      let entry = await getEntry(reference);
      if (!entry) continue;
      if (overrides) entry = merge({}, entry, { data: overrides });
      entries.push(entry);
    }
  } else {
    entries = (await getCollection("education")).sort(sortByEndDateDesc);
  }

  return entries.map(flatten<"education">);
}

/**
 * Given a `cv` entry's data, returns the `experience` entries that are
 * referenced and with any data overrides specified in the `cv` applied.
 */
async function getExperience({ experience }: InferEntrySchema<"cv">) {
  let entries: CollectionEntry<"experience">[] = [];

  if (experience) {
    for (let i = 0; i < experience.length; i++) {
      const { reference, overrides } = experience[i];
      let entry = await getEntry(reference);
      if (!entry) continue;
      if (overrides) entry = merge({}, entry, { data: overrides });
      entries.push(entry);
    }
  } else {
    entries = (await getCollection("experience")).sort(sortByEndDateDesc);
  }

  return entries.map(flatten<"experience">);
}

/**
 * Given a `cv` entry's data, returns the `skills` entries that are
 * referenced and with any data overrides specified in the `cv` applied.
 */
async function getSkills({ skills }: InferEntrySchema<"cv">): Promise<Skill[]> {
  let entries: CollectionEntry<"skills">[] = [];

  if (skills) {
    for (let i = 0; i < skills.length; i++) {
      const { reference, overrides } = skills[i];
      let entry = await getEntry(reference);
      if (!entry) continue;
      if (overrides) {
        entry = merge({}, entry, { data: overrides });
      }
      entries.push(entry);
    }
  } else {
    entries = await getCollection("skills");
  }

  return entries
    .filter((skill) => !skill.data.parent)
    .map(flatten<"skills">)
    .map((skill) => ({
      ...skill,
      children: entries
        .filter((s) => s.data.parent?.id === skill.id)
        .map(flatten<"skills">),
    }));
}

/**
 * Sorts entries with an `endDate` from most recent to oldest.
 */
function sortByEndDateDesc<T extends { data: { endDate?: Date } }>(
  a: T,
  b: T,
): number {
  if (!a.data.endDate && !b.data.endDate) return 0;
  if (!a.data.endDate) return -1;
  if (!b.data.endDate) return 1;
  return b.data.endDate.getTime() - a.data.endDate.getTime();
}
