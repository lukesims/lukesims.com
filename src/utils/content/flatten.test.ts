import { type CollectionEntry } from "astro:content";
import { describe, expect, it } from "vitest";

import { flatten } from "~/utils/content/flatten";

describe("flatten", () => {
  it("preserves entry id", () => {
    const entry = {
      id: "my-unique-id",
      data: { title: "Test" },
    } as CollectionEntry<"blog">;

    const result = flatten(entry);
    expect(result.id).toBe(entry.id);
  });

  it("replaces raw markdown with rendered html if present", () => {
    const hasBodyEntry = {
      id: "has-markdown-body",
      body: "- List item",
      rendered: { html: "<ul><li>List item</li></ul>" },
    } as CollectionEntry<"blog">;

    const noBodyEntry = {
      id: "no-markdown-body",
    } as CollectionEntry<"blog">;

    const hasBodyFlat = flatten<"blog">(hasBodyEntry);
    // @ts-expect-error `rendered` doesn't exist on the object
    expect(hasBodyFlat.rendered).toBeUndefined();
    expect(hasBodyFlat.body).toBe(hasBodyEntry.rendered!.html);

    const noBodyFlat = flatten<"blog">(noBodyEntry);
    // @ts-expect-error `rendered` doesn't exist on the object
    expect(noBodyFlat.rendered).toBeUndefined();
    expect(noBodyFlat.body).toBeUndefined();
  });

  it("merges all data properties into result", () => {
    const entry = {
      id: "a-blog-post",
      collection: "blog",
      data: {
        categories: [{ collection: "categories", id: "category" }],
        description: "description",
        hero: { src: "img.png", width: 1, height: 1, format: "png" },
        published: new Date(),
        title: "title",
        updated: new Date(),
      },
    } as CollectionEntry<"blog">;

    const result = flatten<"blog">(entry);
    expect(result.id).toBe(entry.id);
    expect(result.categories).toBe(entry.data.categories);
    expect(result.description).toBe(entry.data.description);
    expect(result.hero).toBe(entry.data.hero);
    expect(result.published).toBe(entry.data.published);
    expect(result.title).toBe(entry.data.title);
    expect(result.updated).toBe(entry.data.updated);
  });

  it("handles empty data object", () => {
    const entry = {
      id: "no-data",
      data: {},
      rendered: { html: "<p>body</p>" },
    } as CollectionEntry<"blog">;

    const result = flatten(entry);
    expect(Object.keys(result).length).toBe(2);
    expect(result.id).toBe(entry.id);
    expect(result.body).toBe(entry.rendered!.html);
  });

  it("handles nested data structures", () => {
    const entry = {
      data: {
        categories: [{ collection: "categories", id: "category" }],
      },
    } as unknown as CollectionEntry<"blog">;

    const result = flatten<"blog">(entry);
    expect(result.categories.length).toBe(1);
    expect(result.categories[0].collection).toBe("categories");
    expect(result.categories[0].id).toBe("category");
    // Shallow merge - references are preserved
    expect(result.categories).toBe(entry.data.categories);
  });
});
