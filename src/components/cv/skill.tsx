import { differenceInYears } from "date-fns";
import { useMemo } from "react";

import { Card } from "~/components/card";
import { Chip } from "~/components/chip";
import { Heading } from "~/components/heading";
import { type Skill as SkillEntry } from "~/utils/content";
import { cn } from "~/utils/styles";

type SkillProps = {
  level?: number;
  skill: SkillEntry;
};

export const Skill = ({ level = 0, skill }: SkillProps) => {
  const HeadingComponent = useMemo(() => (level === 0 ? "h3" : "h4"), [level]);
  const chipClass = useMemo(() => skill.theme ?? "", [skill]);
  const years = useMemo(() => {
    if (!skill.startYear) return undefined;
    return differenceInYears(new Date(), new Date(skill.startYear, 6));
  }, [skill]);

  return (
    <Card
      className={cn(
        "relative flex break-inside-avoid flex-col gap-5 border-3 p-4 lg:gap-7 lg:p-6 print:gap-0 print:border-2 print:p-2.5 print:pb-0",
        skill.print === false && "print:hidden",
        level === 0
          ? "mb-6 last:mb-0 lg:mb-8 print:mb-5 print:shadow-md"
          : "bg-elevation-7 p-3 shadow-sm lg:p-6 print:-mx-2.5 print:border-r-0 print:border-b-0 print:border-l-0 print:shadow-none",
      )}
    >
      <div className="flex items-center justify-between gap-4 print:mb-2.5 print:gap-2">
        <Heading asChild level="h5" className="text-foreground">
          <HeadingComponent>{skill.name}</HeadingComponent>
        </Heading>
        {years && (
          <Chip className={cn(chipClass, "print:text-xs print:shadow-none")}>
            {years}+ years
          </Chip>
        )}
      </div>

      {skill.body && (
        <div
          className="prose prose-sm prose-stone dark:prose-invert text-left print:mb-3"
          dangerouslySetInnerHTML={{ __html: skill.body }}
        />
      )}

      {skill.tags && (
        <div className="text-left text-wrap">
          {Object.keys(skill.tags)
            .sort()
            .map((id) => (
              <Chip
                className={cn(
                  chipClass,
                  skill.tags[id].print === false && "print:hidden",
                  "mr-2 mb-2 print:text-xs print:shadow-none",
                )}
                key={id}
              >
                {skill.tags[id].tag}
              </Chip>
            ))}
        </div>
      )}

      {skill.children?.map((child) => (
        <Skill key={child.id} level={level + 1} skill={child} />
      ))}
    </Card>
  );
};
