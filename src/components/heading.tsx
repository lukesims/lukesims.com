import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type { ComponentProps, ElementType } from "react";

import { cn } from "~/utils/styles";

const styles = cva("text-heading font-display leading-[1.1] font-extrabold", {
  variants: {
    level: {
      h1: "3xl:text-[3.75rem] text-[3.25rem]/[1.1] lg:text-[3.5rem] print:text-[3rem]",
      h2: "3xl:text-[3rem] text-[2.5rem]/[1.1] lg:text-[2.75rem] print:text-[2rem]",
      h3: "3xl:text-[2.25rem] text-[2rem]/[1.1] lg:text-[2.125rem] print:text-[1.5rem]",
      h4: "3xl:text-[1.875rem] text-[1.625rem]/[1.1] lg:text-[1.75rem] print:text-[1.25rem]",
      h5: "3xl:text-[1.5rem] text-[1.25rem]/[1.1] lg:text-[1.375rem] print:text-[1rem]",
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
