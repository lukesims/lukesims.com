import type {
  CollectionEntry,
  CollectionKey,
  RenderedContent,
} from "astro:content";

export type FlatEntry<C extends CollectionKey> = CollectionEntry<C>["data"] & {
  body?: RenderedContent["html"];
  id: CollectionEntry<C>["id"];
};

/**
 * Flattens a content entry into an object containing only its ID,
 * data (flattened) and body rendered as HTML (if applicable).
 *
 * Use this to prevent unnecessary data from being sent to the client
 * (such as file paths and raw markdown) when passing content entries
 * to React components that are rendered on the client side.
 */
export function flatten<C extends CollectionKey>(
  entry: CollectionEntry<C>,
): FlatEntry<C> {
  return {
    id: entry.id,
    body: entry.rendered?.html,
    ...entry.data,
  };
}
