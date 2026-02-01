import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type { ComponentProps } from "react";

import { cn } from "~/utils/styles";

const styles = cva(
  "icon:pointer-events-none icon:shrink-0 border-border shadow-border inline-flex translate-x-0 translate-y-0 transform items-center justify-center gap-2 border-2 font-sans leading-none font-medium tracking-wide whitespace-nowrap shadow-md ring-offset-white transition-all select-none focus-visible:ring-4 focus-visible:ring-blue-600 focus-visible:outline-hidden active:translate-x-1 active:translate-y-1 active:shadow-none disabled:pointer-events-none disabled:translate-x-0.5 disabled:translate-y-0.5 disabled:opacity-50 disabled:shadow-none dark:font-normal [&.disabled]:pointer-events-none [&.disabled]:translate-x-0.5 [&.disabled]:translate-y-0.5 [&.disabled]:opacity-50 [&.disabled]:shadow-none",
  {
    variants: {
      size: {
        sm: "icon:size-3 h-7 text-sm",
        md: "icon:size-4.5 h-11 text-base",
        lg: "icon:size-6 h-16 text-lg",
      },
      square: {
        false: "",
        true: "",
      },
      variant: {
        default: "bg-button text-button-foreground hover:bg-button-hover",
        primary: "bg-yellow-400 text-black",
        secondary: "bg-white text-black hover:bg-yellow-400 hover:text-black",
      },
    },
    compoundVariants: [
      { size: "sm", square: false, class: "px-3" },
      { size: "md", square: false, class: "px-4" },
      { size: "lg", square: false, class: "px-6" },

      { size: "sm", square: true, class: "w-7" },
      { size: "md", square: true, class: "w-11" },
      { size: "lg", square: true, class: "w-16" },
    ],
    defaultVariants: {
      size: "md",
      square: false,
      variant: "default",
    },
  },
);

export interface ButtonProps
  extends ComponentProps<"button">, VariantProps<typeof styles> {
  asChild?: boolean;
}

export function Button({
  asChild = false,
  className,
  size,
  square,
  variant,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      className={cn(styles({ variant, size, square }), className)}
      {...props}
    />
  );
}
