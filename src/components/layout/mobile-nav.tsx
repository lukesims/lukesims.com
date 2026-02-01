import type { ComponentProps } from "react";

import { Button } from "~/components/button";
import { Heading } from "~/components/heading";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/sheet";
import type { FlatEntry } from "~/utils/content";
import { cn } from "~/utils/styles";

export type MobileNavProps = {
  buttonClass?: string;
  buttonSize?: ComponentProps<typeof Button>["size"];
  buttonVariant?: ComponentProps<typeof Button>["variant"];
  contactInfo?: FlatEntry<"contactInfo">;
  currentPath: string;
  mobileNav?: FlatEntry<"navs">;
};

export function MobileNav({
  buttonClass,
  buttonSize,
  buttonVariant,
  contactInfo,
  // currentPath,
  mobileNav,
}: MobileNavProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          className={buttonClass}
          size={buttonSize}
          variant={buttonVariant}
        >
          <i className="icon-[ri--menu-line]"></i> Menu
        </Button>
      </SheetTrigger>

      <SheetContent className="top-auto w-auto" side="right">
        <SheetHeader>
          <SheetTitle asChild>
            <Heading level="h4" className="leading-none">
              Menu
            </Heading>
          </SheetTitle>
        </SheetHeader>

        <nav className="-mt-4 flex flex-col gap-4 p-4 pt-0">
          {mobileNav?.links.map(({ href, text }, i) => (
            <Button asChild key={i} size="lg" className="px-12">
              <a href={href}>{text}</a>
            </Button>
          ))}
          <div className="flex justify-end gap-4">
            {contactInfo?.items.map(({ icon, text, url }, i) => (
              <Button asChild square key={i}>
                <a href={url} target="_blank" rel="noopener">
                  <span className={cn(icon, "size-6! xl:size-7!")}></span>
                  <span className="sr-only">{text}</span>
                </a>
              </Button>
            ))}
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
