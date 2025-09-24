import { Slot } from "radix-ui";
import type { ComponentProps, ElementType, ReactNode } from "react";

import { Card } from "~/components/card";
import { Chip } from "~/components/chip";
import { cn } from "~/utils/styles";

export interface TimelineProps {
  children: ReactNode;
}

export function Timeline({ children }: TimelineProps) {
  return <ol className="relative w-full">{children}</ol>;
}

export interface TimelineItemProps {
  children: ReactNode;
  date: string;
  tags?: string[];
}

export function TimelineItem({ children, date, tags = [] }: TimelineItemProps) {
  return (
    <li className="group relative mb-12 break-inside-avoid last:mb-0 print:mb-4">
      <div className="border-border absolute top-full left-0 h-12 w-[calc(50%+2px)] border-r-4 border-dashed group-last:hidden print:hidden" />
      <Card className="relative border-3 text-left print:border-2 print:p-3 print:shadow-md">
        <div className="float-right flex max-w-1/2 flex-col items-end gap-2">
          <Chip
            className="print:px-1.5 print:py-0.25 print:text-xs print:shadow-none"
            color="blue"
          >
            {date}
          </Chip>
          <div className="flex items-center gap-2">
            {tags.map((tag) => (
              <Chip
                children={tag}
                className="print:px-1.5 print:py-0.25 print:text-xs print:shadow-none"
                key={tag}
                size="sm"
              />
            ))}
          </div>
        </div>
        {children}
      </Card>
    </li>
  );
}

export interface TimelineItemHeadingProps extends ComponentProps<"h1"> {
  asChild?: boolean;
}

export function TimelineItemHeading({
  asChild = false,
  className,
  ...props
}: TimelineItemHeadingProps) {
  const Comp = asChild ? Slot.Root : ("h1" as ElementType);
  return (
    <Comp
      className={cn(
        "font-display mb-1 text-xl/8 font-extrabold text-blue-600 print:text-lg/6",
        className,
      )}
      {...props}
    />
  );
}
