import { type UseMdxComponents } from "@mdx-js/mdx";
import { type ComponentProps, createElement } from "react";

import Blockquote from "~/components/blockquote.astro";
import { BlogHeading } from "~/components/blog/heading";
import CodeBlock from "~/components/code-block.astro";
import { Heading } from "~/components/heading";
import { Link } from "~/components/link";

export const useMdxComponents: UseMdxComponents = () => ({
  a: (props: ComponentProps<"a">) =>
    createElement(Link, { className: "font-display", ...props }),

  blockquote: Blockquote,

  h1: (props: ComponentProps<"h1">) =>
    createElement(BlogHeading, { className: "text-center", ...props }),

  h2: (props: ComponentProps<"h2">) =>
    createElement(BlogHeading, { level: "h2", ...props }),

  h3: (props: ComponentProps<"h3">) =>
    createElement(BlogHeading, { level: "h3", ...props }),

  h4: (props: ComponentProps<"h4">) =>
    createElement(BlogHeading, { level: "h4", ...props }),

  h5: (props: ComponentProps<"h5">) =>
    createElement(BlogHeading, { level: "h5", ...props }),

  h6: (props: ComponentProps<"h6">) =>
    createElement(BlogHeading, { level: "h5", ...props }),

  pre: CodeBlock,

  strong: (props: ComponentProps<"strong">) =>
    createElement("strong", { className: "font-display", ...props }),
});
