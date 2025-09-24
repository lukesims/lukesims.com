import * as RadixNav from "@radix-ui/react-navigation-menu";
import type { ComponentProps, MouseEventHandler } from "react";

interface CvNavItemProps extends ComponentProps<typeof RadixNav.Link> {}

const onClickNavItem: (id: string) => MouseEventHandler<HTMLAnchorElement> =
  (id) => (event) => {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

export const NavItem = ({ children, href, onClick }: CvNavItemProps) => {
  if (!onClick && href?.startsWith("#")) {
    onClick = onClickNavItem(href.slice(1));
  }

  return (
    <RadixNav.Item>
      <RadixNav.Link
        className="inline-flex cursor-pointer items-center gap-1.5 bg-blue-600 px-3 py-2 text-white transition-colors select-none hover:bg-black"
        href={href}
        onClick={onClick}
      >
        {children}
      </RadixNav.Link>
    </RadixNav.Item>
  );
};
