import { Heading, type HeadingProps } from "~/components/heading";
import { cn } from "~/utils/styles";

export type BlogHeadingProps = HeadingProps;

export function BlogHeading({
  children,
  className,
  id,
  level = "h1",
  ...props
}: BlogHeadingProps) {
  return (
    <Heading
      className={cn("group relative", className)}
      id={id}
      level={level}
      {...props}
    >
      {children}
      <div className="absolute top-1/2 left-0 block origin-right -translate-x-full -translate-y-1/2 scale-0 transform pr-2 opacity-0 transition duration-100 ease-in group-hover:scale-100 group-hover:opacity-100 group-hover:ease-out focus-within:scale-100 focus-within:opacity-100">
        <a
          href={`#${id}`}
          aria-label={`Permalink to “${children}”`}
          className="flex items-center justify-center p-1 text-blue-600 hover:bg-black hover:text-yellow-400 focus:bg-black focus:text-yellow-400 focus:outline-none"
        >
          <i className="icon-[ri--hashtag]"></i>
        </a>
      </div>
    </Heading>
  );
}
