import { getCollection, getEntry } from "astro:content";
import type { CollectionEntry } from "astro:content";
import { afterEach, describe, expect, it, vi } from "vitest";

import { getCv } from "./cv";

vi.mock("astro:content", () => ({
  getEntry: vi.fn(),
  getCollection: vi.fn(),
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe("getCv", () => {
  it("returns undefined when cv entry does not exist", async () => {
    vi.mocked(getEntry).mockResolvedValue(undefined);
    const cv = await getCv("non-existent");
    expect(cv).toBeUndefined();
  });

  it("returns a cv with entry and related collections flattened", async () => {
    const mockCvEntry = {
      id: "cv123",
      collection: "cv",
      filePath: "/cv.md",
      data: {
        title: "title",
        summary: "summary",
        location: "location",
        published: new Date(),
        education: [{ reference: { collection: "education", id: "edu123" } }],
        experience: [{ reference: { collection: "experience", id: "exp123" } }],
        skills: [{ reference: { collection: "skills", id: "ski123" } }],
      },
      rendered: { html: "<p>CV</p>" },
    } as CollectionEntry<"cv">;

    const mockEducationEntry = {
      id: "edu123",
      collection: "education",
      filePath: "/education.md",
      data: { heading: "heading" },
    } as CollectionEntry<"education">;

    const mockExperienceEntry = {
      id: "exp123",
      collection: "experience",
      filePath: "/experience.md",
      data: { title: "title" },
    } as CollectionEntry<"experience">;

    const mockSkillsEntry = {
      id: "ski123",
      collection: "skills",
      filePath: "/skills.md",
      data: { name: "name" },
    } as CollectionEntry<"skills">;

    vi.mocked(getEntry)
      .mockResolvedValueOnce(mockCvEntry)
      .mockResolvedValueOnce(mockEducationEntry)
      .mockResolvedValueOnce(mockExperienceEntry)
      .mockResolvedValueOnce(mockSkillsEntry);

    const cv = (await getCv("anything"))!;

    expect(vi.mocked(getEntry)).toHaveBeenCalledTimes(4);
    expect(cv).toBeDefined();

    // Should have `id` & `body` properties plus the 7 properties from `data`
    expect(Object.keys(cv)).toHaveLength(9);
    expect(cv.id).toBe(mockCvEntry.id);
    expect(cv.body).toBe(mockCvEntry.rendered?.html);
    expect(cv.title).toBe(mockCvEntry.data.title);
    expect(cv.summary).toBe(mockCvEntry.data.summary);
    expect(cv.location).toBe(mockCvEntry.data.location);
    expect(cv.published).toBe(mockCvEntry.data.published);
    expect(Array.isArray(cv.education)).toBe(true);
    expect(Array.isArray(cv.experience)).toBe(true);
    expect(Array.isArray(cv.skills)).toBe(true);

    // Relations should be loaded and flattened
    expect(cv.education).toHaveLength(1);
    expect(cv.education[0].id).toBe(mockEducationEntry.id);
    expect(cv.education[0].heading).toBe(mockEducationEntry.data.heading);
    expect(cv.experience).toHaveLength(1);
    expect(cv.experience[0].id).toBe(mockExperienceEntry.id);
    expect(cv.experience[0].title).toBe(mockExperienceEntry.data.title);
    expect(cv.skills).toHaveLength(1);
    expect(cv.skills[0].id).toBe(mockSkillsEntry.id);
    expect(cv.skills[0].name).toBe(mockSkillsEntry.data.name);

    // Unnecessary properties should be stripped
    // @ts-expect-error `collection` shouldn't exist on the object
    expect(cv.collection).toBeUndefined();
    // @ts-expect-error `filePath` shouldn't exist on the object
    expect(cv.filePath).toBeUndefined();
    // @ts-expect-error `rendered` shouldn't exist on the object
    expect(cv.rendered).toBeUndefined();
    // @ts-expect-error `collection` shouldn't exist on the object
    expect(cv.education[0].collection).toBeUndefined();
    // @ts-expect-error `filePath` shouldn't exist on the object
    expect(cv.education[0].filePath).toBeUndefined();
    // @ts-expect-error `collection` shouldn't exist on the object
    expect(cv.experience[0].collection).toBeUndefined();
    // @ts-expect-error `filePath` shouldn't exist on the object
    expect(cv.experience[0].filePath).toBeUndefined();
    // @ts-expect-error `collection` shouldn't exist on the object
    expect(cv.skills[0].collection).toBeUndefined();
    // @ts-expect-error `filePath` shouldn't exist on the object
    expect(cv.skills[0].filePath).toBeUndefined();
  });

  it("replaces raw markdown with rendered html if present", async () => {
    const mockCvEntry = {
      id: "main",
      body: "content",
      data: {},
      rendered: { html: "<p>content</p>" },
    } as CollectionEntry<"cv">;

    vi.mocked(getEntry).mockResolvedValue(mockCvEntry);
    vi.mocked(getCollection).mockResolvedValue([]);

    const result = (await getCv("main"))!;

    // @ts-expect-error `rendered` shouldn't exist on the object
    expect(result.rendered).toBeUndefined();
    expect(result.body).toBe(mockCvEntry.rendered?.html);
  });

  it("loads related entries with overrides applied", async () => {
    const mockCvEntry = {
      id: "cv123",
      data: {
        title: "title",
        summary: "summary",
        location: "location",
        published: new Date(),
        education: [
          {
            reference: { collection: "education", id: "edu123" },
            overrides: { heading: "overridden heading" },
          },
        ],
        experience: [
          {
            reference: { collection: "experience", id: "exp123" },
            overrides: { title: "overridden title" },
          },
        ],
        skills: [
          {
            reference: { collection: "skills", id: "ski123" },
            overrides: { name: "overridden name" },
          },
        ],
      },
    } as CollectionEntry<"cv">;

    const mockEducationEntry = {
      id: "edu123",
      data: { heading: "heading" },
    } as CollectionEntry<"education">;

    const mockExperienceEntry = {
      id: "exp123",
      data: { title: "title" },
    } as CollectionEntry<"experience">;

    const mockSkillsEntry = {
      id: "ski123",
      data: { name: "name" },
    } as CollectionEntry<"skills">;

    vi.mocked(getEntry)
      .mockResolvedValueOnce(mockCvEntry)
      .mockResolvedValueOnce(mockEducationEntry)
      .mockResolvedValueOnce(mockExperienceEntry)
      .mockResolvedValueOnce(mockSkillsEntry);

    const cv = (await getCv("anything"))!;

    expect(vi.mocked(getEntry)).toHaveBeenCalledTimes(4);
    expect(cv).toBeDefined();

    expect(Array.isArray(cv.education)).toBe(true);
    expect(cv.education).toHaveLength(1);
    expect(cv.education[0].heading).toBe(
      mockCvEntry.data.education?.[0].overrides?.heading,
    );

    expect(Array.isArray(cv.experience)).toBe(true);
    expect(cv.experience).toHaveLength(1);
    expect(cv.experience[0].title).toBe(
      mockCvEntry.data.experience?.[0].overrides?.title,
    );

    expect(Array.isArray(cv.skills)).toBe(true);
    expect(cv.skills).toHaveLength(1);
    expect(cv.skills[0].name).toBe(
      mockCvEntry.data.skills?.[0].overrides?.name,
    );
  });

  it("loads all of a related collection when none specified in cv", async () => {
    const mockEducationEntries = [
      { id: "education1", data: { heading: "education1" } },
      { id: "education2", data: { heading: "education2" } },
      { id: "education3", data: { heading: "education3" } },
    ] as CollectionEntry<"education">[];

    const mockExperienceEntries = [
      { id: "experience1", data: { title: "experience1" } },
      { id: "experience2", data: { title: "experience2" } },
      { id: "experience3", data: { title: "experience3" } },
    ] as CollectionEntry<"experience">[];

    const mockSkillsEntries = [
      { id: "skill1", data: { name: "skill1" } },
      { id: "skill2", data: { name: "skill2" } },
      { id: "skill3", data: { name: "skill3" } },
    ] as CollectionEntry<"skills">[];

    // No education, experience or skills specified in the CV's `data`
    vi.mocked(getEntry).mockResolvedValue({
      id: "cv123",
      collection: "cv",
      data: {
        title: "title",
      },
    } as CollectionEntry<"cv">);

    vi.mocked(getCollection)
      .mockResolvedValueOnce(mockEducationEntries)
      .mockResolvedValueOnce(mockExperienceEntries)
      .mockResolvedValueOnce(mockSkillsEntries);

    const cv = (await getCv("cv123"))!;

    // Since no relations were specified we'd expect `getCollection` to be
    // called once for each relation type, to fetch the entire collection.
    expect(vi.mocked(getEntry)).toHaveBeenCalledExactlyOnceWith("cv", "cv123");
    expect(vi.mocked(getCollection)).toHaveBeenCalledTimes(3);
    expect(vi.mocked(getCollection).mock.calls[0][0]).toBe("education");
    expect(vi.mocked(getCollection).mock.calls[1][0]).toBe("experience");
    expect(vi.mocked(getCollection).mock.calls[2][0]).toBe("skills");

    // We would expect the final cv object to contain all of the education entries
    expect(Array.isArray(cv.education)).toBe(true);
    expect(cv.education).toHaveLength(3);
    expect(cv.education[0].heading).toBe(mockEducationEntries[0].data.heading);
    expect(cv.education[1].heading).toBe(mockEducationEntries[1].data.heading);
    expect(cv.education[2].heading).toBe(mockEducationEntries[2].data.heading);

    // We would expect the final cv object to contain all of the experience entries
    expect(Array.isArray(cv.experience)).toBe(true);
    expect(cv.experience).toHaveLength(3);
    expect(cv.experience[0].title).toBe(mockExperienceEntries[0].data.title);
    expect(cv.experience[1].title).toBe(mockExperienceEntries[1].data.title);
    expect(cv.experience[2].title).toBe(mockExperienceEntries[2].data.title);

    // We would expect the final cv object to contain all of the skills entries
    expect(Array.isArray(cv.skills)).toBe(true);
    expect(cv.skills).toHaveLength(3);
    expect(cv.skills[0].name).toBe(mockSkillsEntries[0].data.name);
    expect(cv.skills[1].name).toBe(mockSkillsEntries[1].data.name);
    expect(cv.skills[2].name).toBe(mockSkillsEntries[2].data.name);
  });

  it("loads skills with hierarchical structure", async () => {
    const mockSkillsEntries = [
      { id: "javascript", data: { name: "JavaScript", parent: undefined } },
      { id: "react", data: { name: "React", parent: { id: "javascript" } } },
      { id: "vue", data: { name: "Vue", parent: { id: "javascript" } } },
    ] as CollectionEntry<"skills">[];

    const mockCvEntry = {
      id: "123",
      collection: "cv",
      data: {
        education: [],
        experience: [],
        location: "location",
        published: new Date(),
        summary: "summary",
        title: "title",
      },
    } as CollectionEntry<"cv">;

    vi.mocked(getEntry).mockResolvedValue(mockCvEntry);
    vi.mocked(getCollection).mockResolvedValue(mockSkillsEntries);

    const cv = (await getCv("main"))!;

    expect(Array.isArray(cv.skills)).toBe(true);
    expect(cv.skills).toHaveLength(1);
    expect(cv.skills[0].name).toBe("JavaScript");

    expect(Array.isArray(cv.skills[0].children)).toBe(true);
    expect(cv.skills[0].children).toHaveLength(2);
    expect(cv.skills[0].children![0].name).toBe("React");
    expect(cv.skills[0].children![1].name).toBe("Vue");
  });
});
