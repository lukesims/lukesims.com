import { Heading } from "~/components/heading";

export interface HeaderProps {
  title: string;
}

export const Header = ({ title }: HeaderProps) => (
  <header className="flex w-full flex-col items-center print:hidden">
    <Heading>
      <div id="top" className="absolute -top-32"></div>Curriculum Vitae
    </Heading>
    <Heading asChild className="mt-16" level="h3">
      <p>Luke Sims</p>
    </Heading>
    <Heading asChild level="h5" className="text-blue-600">
      <p>{title}</p>
    </Heading>
  </header>
);
