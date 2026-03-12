import type { ShikiTransformer } from "@shikijs/types";

/**
 * A Shiki transformer that annotates code blocks with a `title`
 * attribute if a title is provided in the code block's meta string.
 */
export const transformerMetaTitle: ShikiTransformer = {
  name: "annotate-pre-transformer",
  pre(node) {
    const matches = this.options.meta?.__raw?.match(
      /(?:^|\s)title=(['"])(.*?)\1(?:\s|$)/,
    );
    const title = matches?.[2]?.trim();
    if (title) node.properties.title = title;
  },
};
