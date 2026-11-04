import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  href?: string;
  linkLabel?: string;
  className?: string;
};

/** Editorial section title — rule line, no marketing subtitle. */
export function SectionHeading({ title, href, linkLabel, className }: Props) {
  return (
    <div
      className={cn(
        "mb-4 flex items-baseline justify-between gap-4 border-b border-border pb-2",
        className,
      )}
    >
      <h2 className="font-serif text-lg font-bold tracking-tight text-foreground sm:text-xl">
        {title}
      </h2>
      {href && linkLabel ? (
        <Link
          href={href}
          className="shrink-0 text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          {linkLabel}
        </Link>
      ) : null}
    </div>
  );
}
