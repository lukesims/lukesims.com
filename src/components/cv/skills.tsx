import { Skill } from "~/components/cv/skill";
import { Heading } from "~/components/heading";
import { type Skill as SkillEntry } from "~/utils/content";

export interface SkillsProps {
  skills: SkillEntry[];
}

export const Skills = ({ skills }: SkillsProps) => (
  <section className="w-full max-w-7xl print:w-full print:max-w-full print:p-0">
    <Heading level="h2" className="relative mb-8 pt-16 md:pt-32 print:hidden">
      <div id="skills" className="absolute -top-20 lg:-top-24"></div>
      Skills
    </Heading>
    <div className="w-full columns-1 gap-6 md:columns-2 lg:gap-8 xl:columns-3 print:columns-3 print:gap-3">
      <Heading asChild level="h3" className="mb-3 hidden print:block">
        <h2>Skills</h2>
      </Heading>
      {skills.map((skill) => (
        <Skill key={skill.id} skill={skill} />
      ))}
    </div>
  </section>
);
