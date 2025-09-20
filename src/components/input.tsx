import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "~/utils/styles";

export const styles = cva(
  "border-border bg-input selection:bg-primary selection:text-primary-foreground inset-shadow-shadow-inset text-foreground placeholder:text-foreground/50 focus-visible:bg-background file:border-border file:bg-button file:text-button-foreground flex w-full border-2 leading-[1.25] transition-all duration-200 ease-in-out file:mr-2 file:inline-block file:border-2 file:bg-amber-500 file:px-1 file:font-medium focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:inset-shadow-transparent focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 in-data-invalid:border-[oklch(from_var(--danger)_calc(l-0.2)_c_h)] in-data-invalid:focus-visible:ring-red-400",
  {
    variants: {
      variant: {
        sm: "h-7 px-2.5 py-1.25 text-sm inset-shadow-sm",
        md: "inset-shadow-md h-11 px-3.5 py-2 text-base file:text-sm",
        lg: "inset-shadow-md h-16 px-5 py-3 text-lg file:text-base",
      },
    },
    defaultVariants: {
      variant: "md",
    },
  },
);

export type InputProps = ComponentProps<"input"> & VariantProps<typeof styles>;

export function Input({
  className,
  ref,
  variant = "md",
  ...props
}: InputProps) {
  return (
    <input
      className={cn(styles({ variant }), className)}
      ref={ref}
      {...props}
    />
  );
}
