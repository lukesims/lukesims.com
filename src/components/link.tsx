import { Slot } from "radix-ui";
import type { ComponentProps } from "react";

import { cn } from "~/utils/styles";

export interface LinkProps extends ComponentProps<"a"> {
  asChild?: boolean;
}

export function Link({
  asChild = false,
  className,
  href,
  target,
  ...props
}: LinkProps) {
  const Comp = asChild ? Slot.Root : "a";
  const external =
    typeof href === "string" &&
    !href.startsWith("/") &&
    !href.startsWith(import.meta.env.PUBLIC_SITE_URL + "/");

  return (
    <Comp
      className={cn(
        "decoration-elevation-2 relative z-1 inline-block text-blue-600 decoration-[0.15em] underline-offset-2 before:pointer-events-none before:absolute before:-inset-x-[0.25em] before:top-1/2 before:-z-1 before:h-[1.4em] before:-translate-y-1/2 before:transform visited:text-purple-700 hover:text-yellow-400 hover:no-underline hover:before:bg-black focus:text-yellow-400 focus:no-underline focus:outline-none focus:before:bg-black active:text-black active:before:bg-yellow-400",
        className,
      )}
      href={href}
      target={target ?? (external ? "_blank" : undefined)}
      {...props}
    />
  );
}
