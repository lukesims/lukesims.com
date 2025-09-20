import { Button } from "~/components/button";
import { Logo } from "~/components/logo";
import { contactInfo } from "~/config";
import { cn } from "~/utils/styles";

export interface HeaderProps {
  centered?: boolean;
  currentPath: string;
  errorCode?: string;
}

export function Header({
  centered = false,
  currentPath,
  errorCode,
}: HeaderProps) {
  const activeClass = (p: string) => (currentPath === p ? "disabled" : "");

  return (
    <header
      id="page-header"
      className={cn(
        "transition-page print-color-exact fixed inset-x-0 top-[-6px] z-50 flex justify-center print:top-4 print:right-5 print:left-4",
        centered ? "h-[45dvh]" : "h-20 print:h-18",
      )}
    >
      <div
        className={cn(
          "transition-page relative flex w-full items-center",
          centered
            ? "shadow-border/0 max-w-dvw shadow-none"
            : "shadow-border container shadow-lg print:shadow-md",
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "transition-page border-border flex h-20 shrink-0 items-end justify-end border-4 bg-yellow-400 px-5 py-5.5 print:h-18 print:border-2 print:px-4",
            centered && "h-[45dvh] grow border-l-0 p-0 pl-6",
          )}
        >
          <a
            href="/"
            className={cn(
              "transition-page text-black hover:text-blue-600",
              centered && "-mr-[3px] -mb-[3px]",
            )}
          >
            <Logo
              className={cn(
                "transition-page h-7 print:h-6",
                centered && "h-15",
              )}
            />
          </a>
        </div>

        {/* Nav */}
        <div
          className={cn(
            "transition-page relative flex grow items-end justify-start inset-shadow-[6px_0] print:hidden",
            centered ? "h-[45dvh]" : "h-20",
            errorCode
              ? "bg-red-500 inset-shadow-red-600/85"
              : "bg-green-500 inset-shadow-green-600/85",
          )}
        >
          {errorCode && (
            <div className="absolute bottom-20 flex h-46 items-start overflow-hidden pl-4">
              <div className="font-display text-[30dvh]/[0.69] font-extrabold text-red-600/85 select-none">
                {errorCode}
              </div>
            </div>
          )}
          <nav className="border-border bg-elevation-7 flex h-20 w-full items-center border-y-4">
            <div
              className={cn(
                "transition-page flex items-center gap-5 pl-5",
                !centered && "grow",
              )}
            >
              <Button asChild className={activeClass("/about")}>
                <a href="/about">About</a>
              </Button>
              <Button asChild className={activeClass("/projects")}>
                <a href="/projects">Projects</a>
              </Button>
              <Button asChild className={activeClass("/blog")}>
                <a href="/blog">Blog</a>
              </Button>
            </div>
            <div className="flex items-center gap-5 pl-5">
              <Button asChild square className="shrink-0">
                <a href="https://github.com/lukesims">
                  <span className="icon-[ri--github-fill] !size-7"></span>
                  <span className="sr-only">Github</span>
                </a>
              </Button>
              <Button asChild square className="shrink-0">
                <a href="https://linkedin.com/in/lukesimsuk">
                  <span className="icon-[ri--linkedin-fill] !size-7"></span>
                  <span className="sr-only">LinkedIn</span>
                </a>
              </Button>
              <a
                href="/contact"
                className="font-display flex h-18 w-full items-center gap-2 border-x-4 border-black bg-black px-8 text-xl font-semibold text-white transition hover:bg-blue-600"
              >
                <span>Get in Touch</span>
                <span className="icon-[ri--arrow-right-up-line] size-8 transition"></span>
              </a>
            </div>
          </nav>
        </div>

        {/* Contact Info */}
        <div className="border-border hidden h-18 grow items-stretch gap-3 border-4 border-l-0 bg-white px-3 print:flex print:border-2 print:border-l-0">
          <div className="font-display flex shrink items-center font-bold text-balance text-blue-600">
            Full Stack Web Developer
          </div>
          <div className="flex grow flex-wrap items-center justify-end gap-x-4 py-1">
            <PrintContactInfo item="location" />
            <PrintContactInfo item="linkedin" />
            <PrintContactInfo item="website" />
            <PrintContactInfo item="github" />
          </div>
        </div>
      </div>
    </header>
  );
}

function PrintContactInfo({ item }: { item: keyof typeof contactInfo }) {
  const { icon, text, url } = contactInfo[item];
  const Comp = url ? "a" : "div";
  return (
    <Comp
      className={cn(
        "font-display flex items-center gap-1 text-sm",
        url && "underline",
      )}
      href={url}
      target={url ? "_blank" : undefined}
    >
      <i className={cn(icon, "size-5 text-blue-600")} />
      <span>{url ? url.substring(8) : text}</span>
    </Comp>
  );
}
