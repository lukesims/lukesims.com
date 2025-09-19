import { Slot } from "radix-ui";
import type { ComponentProps } from "react";

import { cn } from "~/utils/styles";

export interface CardProps extends ComponentProps<"div"> {
  asChild?: boolean;
}

export const styles =
  "bg-card border-border shadow-border border-4 px-5 py-3 shadow-lg";

export function Card({
  asChild = false,
  children,
  className,
  ...props
}: CardProps) {
  const Comp = asChild ? Slot.Root : "div";
  return (
    <Comp className={cn(styles, className)} {...props}>
      {children}
    </Comp>
  );
}
