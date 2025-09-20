import { cva, type VariantProps } from "class-variance-authority";
import { type ComponentProps } from "react";

import { cn } from "~/utils/styles";

const styles = cva(
  "border-border shadow-border has-icon:grid-cols-[calc(var(--spacing)*7)_1fr] has-icon:gap-x-3 icon:order-first icon:size-7 icon:text-current relative grid w-full grid-cols-[0_1fr] items-start gap-y-1 border-4 px-4 py-3 shadow-lg",
  {
    variants: {
      variant: {
        danger: "bg-danger text-danger-foreground",
        default: "bg-stone-400 text-black",
        info: "bg-info text-info-foreground",
        success: "bg-success text-success-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type AlertStyleVariants = VariantProps<typeof styles>;
export type AlertProps = ComponentProps<"div"> & AlertStyleVariants;

export function Alert({ className, variant, ...props }: AlertProps) {
  return (
    <div
      className={cn(styles({ variant }), className)}
      data-slot="alert"
      role="alert"
      {...props}
    />
  );
}

export function AlertTitle({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "col-start-2 line-clamp-1 min-h-4 text-lg/7 font-medium tracking-wide",
        className,
      )}
      data-slot="alert-title"
      {...props}
    />
  );
}

export function AlertDescription({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "col-start-2 grid justify-items-start gap-1 [&_p]:leading-relaxed",
        className,
      )}
      data-slot="alert-description"
      {...props}
    />
  );
}
