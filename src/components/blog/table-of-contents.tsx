import { type ComponentProps, useEffect, useRef, useState } from "react";

import { Button } from "~/components/button";
import { Card } from "~/components/card";
import { Heading } from "~/components/heading";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/sheet";
import { cn } from "~/utils/styles";

export interface BlogHeading {
  depth: 2 | 3;
  slug: string;
  text: string;
}

//======================================

export interface TableOfContentsProps extends ComponentProps<"section"> {
  headings: BlogHeading[];
}

export function TableOfContents({
  className,
  headings,
  ...props
}: TableOfContentsProps) {
  const [activeSlug, setActiveSlug] = useState<string | undefined>(
    headings[0]?.slug,
  );
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const focusTimeoutRef = useRef<number | null>(null);
  const tocRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    return () => {
      if (focusTimeoutRef.current) {
        window.clearTimeout(focusTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isOverlayVisible) setIsSheetOpen(false);
  }, [isOverlayVisible]);

  useEffect(() => {
    const tocElement = tocRef.current;

    if (!tocElement) return;
    if (headings.length < 2) return;

    const headingElements = headings
      .map(({ slug }) => document.getElementById(slug))
      .filter(
        (element): element is HTMLElement => element instanceof HTMLElement,
      );

    if (headingElements.length === 0) return;

    let frame = 0;

    const getHeaderOffset = () => {
      const pageHeader = document.getElementById("page-header");
      return (pageHeader?.getBoundingClientRect().bottom ?? 0) + 12;
    };

    const updateState = () => {
      const headerOffset = getHeaderOffset();
      const tocBottom = tocElement.getBoundingClientRect().bottom;
      setIsOverlayVisible(tocBottom <= headerOffset);

      let nextActiveSlug = headingElements[0]?.id ?? null;
      const activationOffset = Math.max(
        headerOffset + 24,
        window.innerHeight * 0.35,
      );

      for (const element of headingElements) {
        if (element.getBoundingClientRect().top <= activationOffset) {
          nextActiveSlug = element.id;
          continue;
        }
        break;
      }

      setActiveSlug((currentSlug) =>
        currentSlug === nextActiveSlug ? currentSlug : nextActiveSlug,
      );
    };

    const scheduleUpdate = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateState);
    };

    scheduleUpdate();

    window.addEventListener("hashchange", scheduleUpdate);
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("scroll", scheduleUpdate, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("scroll", scheduleUpdate);
    };
  }, [headings]);

  if (headings.length < 2) {
    return null;
  }

  const focusHeadingPermalink = (slug: string) => {
    if (focusTimeoutRef.current) {
      window.clearTimeout(focusTimeoutRef.current);
    }
    focusTimeoutRef.current = window.setTimeout(() => {
      document.getElementById(slug)?.querySelector("a")?.focus();
      focusTimeoutRef.current = null;
    }, 350);
  };

  return (
    <>
      <section
        className={cn("mx-auto w-full max-w-[65ch] print:hidden", className)}
        ref={tocRef}
        {...props}
      >
        <Card
          className={cn(
            "border-2 shadow-sm",
            isTocOpen
              ? "border-border shadow-border bg-button"
              : "border-border/50 shadow-border/50 focus-within:border-border focus-within:shadow-border hover:border-border hover:shadow-border",
          )}
        >
          <button
            aria-controls="blog-headings-toc-nav"
            aria-expanded={isTocOpen}
            type="button"
            onClick={() => setIsTocOpen((currentState) => !currentState)}
            className={cn(
              "-mx-5 flex w-[calc(100%+2.5rem)] cursor-pointer items-center justify-between gap-4 px-4 py-2 text-left text-current/70 no-underline decoration-dashed decoration-2 underline-offset-3 hover:text-blue-600 focus:text-blue-600 focus:underline focus:outline-none",
              isTocOpen
                ? "bg-elevation-7 -mt-3 mb-4"
                : "hover:bg-elevation-7 focus:bg-elevation-7 -my-3",
            )}
          >
            <Heading
              level="h2"
              className="text-sm leading-none text-current normal-case md:text-base xl:text-lg print:text-base"
            >
              Table of contents
            </Heading>

            <i
              aria-hidden="true"
              className={cn(
                "block size-5 shrink-0",
                isTocOpen
                  ? "icon-[ri--arrow-down-s-line]"
                  : "icon-[ri--arrow-right-s-line]",
              )}
            ></i>
            <span className="sr-only">
              {isTocOpen ? "Collapse" : "Expand"} table of contents
            </span>
          </button>

          {isTocOpen && (
            <nav
              aria-label="Table of contents"
              className="mt-4"
              id="blog-headings-toc-nav"
            >
              <HeadingList headings={headings} />
            </nav>
          )}
        </Card>
      </section>

      <div
        className={cn(
          "fixed right-6 bottom-26 z-50 sm:right-8 sm:bottom-28 lg:bottom-6 print:hidden",
          !isOverlayVisible && "hidden",
        )}
      >
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button className="border-3" size="lg" variant="secondary">
              <i className="icon-[ri--list-view]" aria-hidden="true"></i>
              On this page
            </Button>
          </SheetTrigger>

          <SheetContent className="top-auto w-auto" side="right">
            <SheetHeader className="pr-12">
              <SheetTitle asChild>
                <Heading level="h4" className="leading-none">
                  On this page
                </Heading>
              </SheetTitle>
            </SheetHeader>

            <nav
              aria-label="Article sections"
              className="-mt-4 flex max-h-[calc(100vh-8rem)] flex-col gap-2 overflow-y-auto p-4 pt-0"
            >
              <HeadingList
                activeSlug={activeSlug}
                headings={headings}
                onSelectSlug={(slug) => {
                  setIsSheetOpen(false);
                  focusHeadingPermalink(slug);
                }}
              />
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

//======================================

interface HeadingListProps {
  activeSlug?: string;
  headings: BlogHeading[];
  onSelectSlug?: (slug: string) => void;
}

function HeadingList({ activeSlug, headings, onSelectSlug }: HeadingListProps) {
  return (
    <ul className="flex flex-col gap-2">
      {headings.map(({ depth, slug, text }) => {
        const isActive = slug === activeSlug;
        return (
          <li key={slug} className={cn(depth === 3 && "pl-4")}>
            <a
              aria-current={isActive ? "location" : undefined}
              href={`#${slug}`}
              onClick={() => onSelectSlug?.(slug)}
              className={cn(
                "font-display block rounded-xs px-2 py-1 text-sm underline decoration-transparent decoration-dashed decoration-1 underline-offset-3 hover:bg-black hover:text-yellow-400 focus:bg-black focus:text-yellow-400 focus:decoration-yellow-400 focus:outline-none sm:text-base",
                isActive && "bg-black text-yellow-400 shadow-none",
              )}
            >
              {text}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
