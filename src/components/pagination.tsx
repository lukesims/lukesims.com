import type { Page } from "astro";
import { type ComponentProps, Fragment } from "react";

import { Button } from "~/components/button";
import { cn } from "~/utils/styles";

export interface PaginationProps extends ComponentProps<"nav"> {
  baseUrl: string;
  page: Page;
  siblings?: number;
}

export function Pagination({
  baseUrl,
  className,
  page: { currentPage, lastPage, url },
  siblings = 2,
  ...props
}: PaginationProps) {
  const numCurrentPages = siblings * 2 + 1;

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center gap-2", className)}
      role="navigation"
      {...props}
    >
      <PaginationLink label="Go to the previous page" url={url.prev}>
        Previous
      </PaginationLink>

      <PaginationLink
        square
        current={currentPage === 1}
        label="Go to page 1"
        url={baseUrl}
      >
        1
      </PaginationLink>

      {lastPage > numCurrentPages + 2
        ? // If there are more pages than we want to show, they need to be truncated
          Array.from({ length: numCurrentPages }, (_, i) => {
            let pageNum: number;
            if (currentPage < 2 + siblings) {
              pageNum = i + 2;
            } else if (currentPage > lastPage - siblings - 1) {
              pageNum = lastPage - numCurrentPages + i;
            } else {
              pageNum = currentPage - siblings + i;
            }
            return (
              <Fragment key={i}>
                {i === 0 && pageNum > 2 && (
                  <div className="flex h-11 w-11 items-center justify-center">
                    <span className="icon-[ri--more-fill] ml-0.5 size-7" />
                  </div>
                )}
                <PaginationLink
                  square
                  current={currentPage === pageNum}
                  label={`Go to page ${pageNum}`}
                  url={`${baseUrl}/${pageNum}`}
                >
                  {pageNum}
                </PaginationLink>
                {i === numCurrentPages - 1 && pageNum < lastPage - 1 && (
                  <div className="flex h-11 w-11 items-center justify-center">
                    <span className="icon-[ri--more-fill] ml-0.5 size-7" />
                  </div>
                )}
              </Fragment>
            );
          })
        : // There are few enough pages that we can show them all
          Array.from({ length: lastPage - 2 }, (_, i) => {
            const pageNum = i + 2;
            return (
              <PaginationLink
                square
                current={currentPage === pageNum}
                key={i}
                label={`Go to page ${pageNum}`}
                url={`${baseUrl}/${pageNum}`}
              >
                {pageNum}
              </PaginationLink>
            );
          })}

      {lastPage > 1 && (
        <PaginationLink
          square
          current={currentPage === lastPage}
          label={`Go to page ${lastPage}`}
          url={`${baseUrl}/${lastPage}`}
        >
          {lastPage}
        </PaginationLink>
      )}

      <PaginationLink label="Go to the next page" url={url.next}>
        Next
      </PaginationLink>
    </nav>
  );
}

export interface PaginationLinkProps extends ComponentProps<typeof Button> {
  current?: boolean;
  label?: string;
  url?: string;
}

export function PaginationLink({
  children,
  current = false,
  label,
  url,
  ...props
}: PaginationLinkProps) {
  return (
    <Button
      asChild
      className={cn(
        "font-semibold decoration-2 underline-offset-6",
        current && "bg-yellow-400 underline hover:bg-yellow-300",
        !url && "disabled",
      )}
      {...props}
    >
      <a
        aria-current={current ? "page" : "false"}
        aria-disabled={url ? "false" : "true"}
        aria-label={label}
        href={url}
        role="link"
      >
        &thinsp;{children}&thinsp;
      </a>
    </Button>
  );
}
