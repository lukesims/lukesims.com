import { getCollection, getEntries, getEntry } from "astro:content";

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

  const education = entry.data.education
    ? await getEntries(entry.data.education)
    : await getCollection("education");
  const experience = entry.data.experience
    ? await getEntries(entry.data.experience)
    : await getCollection("experience");

  return {
    ...flatten<"cv">(entry),
    education: education.map(flatten<"education">),
    experience: experience.map(flatten<"experience">),
    skills: await getSkills(),
  };
}

async function getSkills(parent?: FlatEntry<"skills">): Promise<Skill[]> {
  const skills: Skill[] = [];
  const entries = parent
    ? await getCollection("skills", (s) => s.data.parent?.id === parent.id)
    : await getCollection("skills", (s) => !s.data.parent);

  for (let i = 0; i < entries.length; i++) {
    const skill = flatten<"skills">(entries[i]);
    skills.push({ ...skill, children: await getSkills(skill) });
  }

  return skills;
}
