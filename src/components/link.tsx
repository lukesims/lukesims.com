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
    !href.startsWith("#") &&
    !href.startsWith("/") &&
    !href.startsWith(import.meta.env.PUBLIC_SITE_URL + "/");

  return (
    <Comp
      className={cn(
        "decoration-elevation-2 relative z-1 -mx-1 px-1 text-blue-600 underline decoration-[0.15em] underline-offset-2 visited:text-purple-700 hover:bg-black hover:text-yellow-400 hover:no-underline focus:bg-black focus:text-yellow-400 focus:no-underline focus:outline-none active:bg-yellow-400 active:text-black",
        className,
      )}
      href={href}
      target={target ?? (external ? "_blank" : undefined)}
      {...props}
    />
  );
}
