import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type { ComponentProps, ElementType } from "react";

import { cn } from "~/utils/styles";

export const styles = cva("text-heading font-display font-extrabold", {
  variants: {
    level: {
      h1: "text-4xl md:text-5xl xl:text-6xl print:text-5xl",
      h2: "text-2xl md:text-3xl xl:text-4xl print:text-3xl",
      h3: "text-xl md:text-2xl xl:text-3xl print:text-2xl",
      h4: "text-base md:text-lg xl:text-xl print:text-xl",
      h5: "text-sm uppercase md:text-base xl:text-lg print:text-base print:normal-case",
    },
  },
  defaultVariants: {
    level: "h1",
  },
});

export interface HeadingProps
  extends ComponentProps<"h1">, VariantProps<typeof styles> {
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
