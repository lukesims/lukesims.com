import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { styles } from "~/components/input";
import { cn } from "~/utils/styles";

export type TextAreaProps = ComponentProps<"textarea"> &
  VariantProps<typeof styles>;

export function TextArea({
  children,
  className,
  ref,
  variant = "md",
  ...props
}: TextAreaProps) {
  return (
    <textarea
      className={cn(styles({ variant }), "h-auto", className)}
      ref={ref}
      {...props}
    >
      {children}
    </textarea>
  );
}
