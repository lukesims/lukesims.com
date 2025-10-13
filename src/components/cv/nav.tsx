import {
  Content,
  Indicator,
  Item,
  Link,
  List,
  Root,
  Trigger,
} from "@radix-ui/react-navigation-menu";
import { SITE_URL } from "astro:env/client";
import type { MouseEventHandler } from "react";

import { cn } from "~/utils/styles";

const sections = [
  { href: "#top", label: "Top" },
  { href: "#summary", label: "Summary" },
  { href: "#skills", label: "Skills" },
  { href: "#experience", label: "Experience" },
  { href: "#education", label: "Education" },
];

const linkStyles =
  "flex cursor-pointer items-center gap-1.5 bg-blue-600 px-3 py-2 text-white underline decoration-white/0 decoration-2 underline-offset-4 transition select-none hover:bg-black focus-visible:bg-black focus-visible:decoration-white focus-visible:outline-none";

const onClickNavItem: (id: string) => MouseEventHandler<HTMLAnchorElement> =
  (id) => (event) => {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

export interface DesktopNavProps {
  id: string;
  url: URL;
}

export const DesktopNav = ({ id, url }: DesktopNavProps) => {
  const downloadUrl = new URL(`/cv/${id}/download`, SITE_URL);
  downloadUrl.searchParams.set("url", url.toString());

  return (
    <Root className="shadow-border sticky top-21 z-50 mb-16 hidden shadow-lg lg:block print:hidden">
      <List className="border-border flex items-center border-3">
        {sections.map(({ href, label }, i) => (
          <Item key={i}>
            <Link
              className={linkStyles}
              href={href}
              onClick={onClickNavItem(href.slice(1))}
            >
              {label}
            </Link>
          </Item>
        ))}
        <Item className="bg-border h-10 w-[2px]" />
        <Item>
          <Link className={linkStyles} href={downloadUrl.toString()}>
            <i className="icon-[ri--file-download-fill] h-5 w-5"></i>
            Download PDF
          </Link>
        </Item>
      </List>
    </Root>
  );
};

export interface MobileNavProps {
  id: string;
  url: URL;
}

export const MobileNav = ({ id, url }: MobileNavProps) => {
  const downloadUrl = new URL(`/cv/${id}/download`, SITE_URL);
  downloadUrl.searchParams.set("url", url.toString());

  return (
    <Root className="fixed top-6 right-6 z-50 lg:hidden print:hidden">
      <List className="border-border shadow-border flex items-center border-3 shadow-lg">
        <Item className="relative">
          <Trigger className={linkStyles}>Jump to&hellip;</Trigger>
          <Content className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in data-[state=open]:slide-in-from-top-4 data-[state=open]:zoom-in-90 absolute top-[calc(100%+3px)] -left-[3px] flex w-full origin-[top_center] justify-center pt-3 duration-100">
            <ul className="border-border border-3">
              {sections.map(({ href, label }, i) => (
                <li key={i}>
                  <Link
                    className={cn(linkStyles, "justify-center")}
                    href={href}
                    onClick={onClickNavItem(href.slice(1))}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </Content>
        </Item>
        <Item className="bg-border h-10 w-[2px]" />
        <Item>
          <Link className={linkStyles} href={downloadUrl.toString()}>
            <i className="icon-[ri--file-download-fill] hidden h-5 w-5 sm:inline-block"></i>
            Download PDF
          </Link>
        </Item>
        <Indicator className="data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:animate-in data-[state=visible]:fade-in top-full z-10 flex h-3 w-full items-end justify-center overflow-hidden duration-100">
          <div className="bg-border relative top-[70%] size-2.5 rotate-45" />
        </Indicator>
      </List>
    </Root>
  );
};
