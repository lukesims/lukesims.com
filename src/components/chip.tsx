import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { cn } from "~/utils/styles";

const styles = cva(
  "inline-block border-2 border-black/20 font-semibold tracking-wide text-black shadow-xs",
  {
    variants: {
      color: {
        blue: "border-blue-700 bg-blue-400 shadow-blue-700",
        gray: "border-stone-400 bg-stone-300 shadow-stone-400",
        green: "border-green-600 bg-green-400 shadow-green-600",
        red: "border-red-600 bg-red-400 shadow-red-600",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2 py-0.5 text-sm",
        lg: "px-3 py-1 text-base",
      },
    },
    defaultVariants: {
      color: "gray",
      size: "md",
    },
  },
);

export interface ChipProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "color">,
    VariantProps<typeof styles> {}

export function Chip({ children, className, color, size }: ChipProps) {
  return (
    <span className={cn(styles({ color, size }), className)}>{children}</span>
  );
}
