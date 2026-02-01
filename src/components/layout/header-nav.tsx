import { Button } from "~/components/button";
import { MobileNav } from "~/components/layout/mobile-nav";
import type { FlatEntry } from "~/utils/content";
import { cn } from "~/utils/styles";

export interface HeaderNavProps {
  contactInfo?: FlatEntry<"contactInfo">;
  currentPath: string;
  grow?: boolean;
  mainNav?: FlatEntry<"navs">;
  mobileNav?: FlatEntry<"navs">;
}

export function HeaderNav({
  contactInfo,
  currentPath,
  grow,
  mainNav,
  mobileNav,
}: HeaderNavProps) {
  return (
    <nav className="border-border bg-elevation-7 flex h-20 w-full items-center border-y-4">
      <div
        className={cn(
          "flex items-center gap-3 pl-4 lg:gap-5 lg:pl-5",
          grow && "grow",
        )}
      >
        <MobileNav
          buttonClass="inline-flex md:hidden"
          contactInfo={contactInfo}
          currentPath={currentPath}
          mobileNav={mobileNav}
        />
        {mainNav?.links.map(({ href, text }, i) => (
          <Button
            asChild
            key={i}
            className={cn(
              "hidden h-9 px-3.5 text-sm md:inline-flex xl:h-11 xl:px-4 xl:text-base",
              currentPath === href && "disabled",
            )}
          >
            <a href={href}>{text}</a>
          </Button>
        ))}
      </div>
      <div className="flex items-center gap-5 pl-5">
        {contactInfo?.items.map(({ icon, text, url }, i) => (
          <Button
            asChild
            square
            key={i}
            className="hidden h-9 w-9 shrink-0 lg:inline-flex xl:h-11 xl:w-11"
          >
            <a href={url} target="_blank" rel="noopener">
              <span className={cn(icon, "size-6! xl:size-7!")}></span>
              <span className="sr-only">{text}</span>
            </a>
          </Button>
        ))}
        <a
          href="/contact"
          className="font-display hidden h-18 w-full items-center gap-1 border-x-4 border-black bg-black px-4 text-base font-semibold text-white ring-0 ring-blue-600 transition ring-inset hover:bg-blue-600 focus:outline-none focus-visible:ring-6 sm:flex lg:px-6 lg:text-lg xl:gap-2 xl:px-8 xl:text-xl"
        >
          <span>Get in Touch</span>
          <span className="icon-[ri--arrow-right-up-line] size-6 transition md:size-7 xl:size-8"></span>
        </a>
      </div>
    </nav>
  );
}
