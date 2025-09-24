import { Skill } from "~/components/cv/skill";
import { Heading } from "~/components/heading";
import type { AugmentedSkillEntry } from "~/utils/content";

export interface SkillsProps {
  skills: AugmentedSkillEntry[];
}

export const Skills = ({ skills }: SkillsProps) => (
  <section className="w-full max-w-7xl print:w-full print:max-w-full print:p-0">
    <Heading level="h2" className="relative mb-8 w-full pt-32 print:hidden">
      <div id="skills" className="absolute -top-24"></div>
      Skills
    </Heading>
    <div className="w-full columns-3 gap-8 print:gap-3">
      <Heading asChild level="h3" className="mb-3 hidden print:block">
        <h2>Skills</h2>
      </Heading>
      {skills.map((skill) => (
        <Skill key={skill.id} skill={skill} />
      ))}
    </div>
  </section>
);
