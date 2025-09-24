import {
  type CollectionEntry,
  getCollection,
  getEntries,
  getEntry,
} from "astro:content";

export type AugmentedSkillEntry = CollectionEntry<"skills"> & {
  relations: {
    children?: AugmentedSkillEntry[];
  };
};

export type AugmentedCvEntry = CollectionEntry<"cv"> & {
  relations: {
    education: CollectionEntry<"education">[];
    experience: CollectionEntry<"experience">[];
    skills: AugmentedSkillEntry[];
  };
};

export async function getAugmentedCv(
  id: string,
): Promise<AugmentedCvEntry | undefined> {
  const entry = await getEntry("cv", id);
  if (!entry) return undefined;
  return {
    ...entry,
    relations: {
      education: sortEntries(
        entry.data.education
          ? entry.data.education.length
            ? await getEntries(entry.data.education)
            : []
          : await getCollection("education"),
      ),
      experience: sortEntries(
        entry.data.experience
          ? entry.data.experience.length
            ? await getEntries(entry.data.experience)
            : []
          : await getCollection("experience"),
      ),
      skills: await augmentSkills(
        entry.data.skills
          ? entry.data.skills.length
            ? await getEntries(entry.data.skills)
            : []
          : await getCollection("skills", (s) => !s.data.parent),
      ),
    },
  };
}

async function augmentSkills(
  skills: CollectionEntry<"skills">[],
): Promise<AugmentedSkillEntry[]> {
  const augmented = [];

  for (let i = 0; i < skills.length; i++) {
    const children = await getCollection(
      "skills",
      (s) => s.data.parent?.id === skills[i].id,
    );

    augmented[i] = {
      ...skills[i],
      relations: {
        children:
          Array.isArray(children) && children.length
            ? await augmentSkills(children)
            : undefined,
      },
    };
  }

  return augmented;
}

function sortEntries<T extends CollectionEntry<"education" | "experience">[]>(
  entries: T,
): T {
  return entries
    .sort(
      (a, b) =>
        new Date(b.data.startYear, b.data.startMonth - 1).getTime() -
        new Date(a.data.startYear, a.data.startMonth - 1).getTime(),
    )
    .sort((a, b) => {
      if (!a.data.endYear && !b.data.endYear) return 0;
      if (!a.data.endYear) return -1;
      if (!b.data.endYear) return 1;
      return (
        new Date(b.data.endYear, (b.data.endMonth ?? 1) - 1).getTime() -
        new Date(a.data.endYear, (a.data.endMonth ?? 1) - 1).getTime()
      );
    });
}
