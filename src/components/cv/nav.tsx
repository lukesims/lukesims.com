import * as RadixNav from "@radix-ui/react-navigation-menu";
import { SITE_URL } from "astro:env/client";

import { NavItem } from "~/components/cv/nav-item";

export interface NavProps {
  id: string;
  url: URL;
}

export const Nav = ({ id, url }: NavProps) => {
  const downloadUrl = new URL(`/cv/${id}/download`, SITE_URL);
  downloadUrl.searchParams.set("url", url.toString());

  return (
    <RadixNav.Root className="shadow-border sticky top-21 z-50 mb-16 shadow-lg print:hidden">
      <RadixNav.List className="border-border flex items-center border-2">
        <NavItem href="#top">Top</NavItem>
        <NavItem href="#summary">Summary</NavItem>
        <NavItem href="#skills">Skills</NavItem>
        <NavItem href="#experience">Experience</NavItem>
        <NavItem href="#education">Education</NavItem>
        <RadixNav.Item className="bg-border h-10 w-[2px]" />
        <NavItem href={downloadUrl.toString()}>
          <i className="icon-[ri--file-download-fill] h-5 w-5"></i>
          Download PDF
        </NavItem>
      </RadixNav.List>
    </RadixNav.Root>
  );
};
