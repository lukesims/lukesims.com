import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type { ComponentProps, ElementType } from "react";

import { cn } from "~/utils/styles";

export const styles = cva("text-heading font-display font-extrabold", {
  variants: {
    level: {
      h1: "text-4xl sm:text-5xl lg:text-6xl 2xl:text-7xl print:text-5xl",
      h2: "text-3xl sm:text-4xl lg:text-5xl 2xl:text-6xl print:text-3xl",
      h3: "text-2xl sm:text-3xl lg:text-4xl 2xl:text-5xl print:text-2xl",
      h4: "text-xl sm:text-2xl lg:text-3xl 2xl:text-4xl print:text-xl",
      h5: "text-lg sm:text-xl lg:text-2xl 2xl:text-3xl print:text-base",
    },
  },
  defaultVariants: {
    level: "h1",
  },
});

export interface HeadingProps
  extends ComponentProps<"h1">,
    VariantProps<typeof styles> {
  asChild?: boolean;
}

export function Heading({
  asChild = false,
  className,
  level = "h1",
  ...props
}: HeadingProps) {
  const Comp = asChild ? Slot.Root : (level as ElementType);
  return <Comp className={cn(styles({ level }), className)} {...props} />;
}
