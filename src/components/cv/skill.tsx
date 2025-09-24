import { differenceInYears } from "date-fns";
import { useMemo } from "react";

import { Card } from "~/components/card";
import { Chip } from "~/components/chip";
import { Heading } from "~/components/heading";
import type { AugmentedSkillEntry } from "~/utils/content";
import { cn } from "~/utils/styles";

type SkillProps = {
  level?: number;
  skill: AugmentedSkillEntry;
};

export const Skill = ({ level = 0, skill }: SkillProps) => {
  const HeadingComponent = useMemo(() => (level === 0 ? "h3" : "h4"), [level]);
  const chipClass = useMemo(() => skill.data.theme ?? "", [skill]);
  const years = useMemo(() => {
    if (!skill.data.startYear) return undefined;
    return differenceInYears(new Date(), new Date(skill.data.startYear, 6));
  }, [skill]);

  return (
    <Card
      className={cn(
        "relative flex break-inside-avoid flex-col gap-7 border-3 p-6 print:gap-0 print:border-2 print:p-2.5 print:pb-0",
        skill.data.print === false && "print:hidden",
        level === 0
          ? "mb-8 print:mb-4 print:shadow-md"
          : "bg-elevation-7 shadow-sm print:-mx-2.5 print:border-r-0 print:border-b-0 print:border-l-0 print:shadow-none",
      )}
    >
      <div className="flex items-center justify-between gap-4 print:mb-3 print:gap-2">
        <Heading asChild level="h5" className="text-foreground">
          <HeadingComponent>{skill.data.name}</HeadingComponent>
        </Heading>
        {years && (
          <Chip className={cn(chipClass, "print:text-xs print:shadow-none")}>
            {years}+ years
          </Chip>
        )}
      </div>

      {skill.body && skill.rendered && (
        <div
          className="prose prose-sm prose-stone dark:prose-invert text-left print:mb-3"
          dangerouslySetInnerHTML={{ __html: skill.rendered.html }}
        />
      )}

      {skill.data.tags && (
        <div className="-m-1 text-left text-wrap print:-m-0.5 print:mb-2.5">
          {skill.data.tags.map(({ print, tag }) => (
            <Chip
              className={cn(
                chipClass,
                "m-1 print:m-0.5 print:px-1.5 print:py-0.25 print:text-xs print:shadow-none",
                print === false && "print:hidden",
              )}
              key={tag}
            >
              {tag}
            </Chip>
          ))}
        </div>
      )}

      {skill.relations.children?.map((child) => (
        <Skill key={child.id} level={level + 1} skill={child} />
      ))}
    </Card>
  );
};
