import { cn } from "@/lib/utils";

/** Prevents browser “Translate page” from rewriting KabarDesk / logo text. */
export function NoTranslateBrand({
  children,
  className,
  as: Tag = "span",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "span" | "p" | "div" | "h1" | "a";
}) {
  return (
    <Tag translate="no" className={cn("notranslate", className)}>
      {children}
    </Tag>
  );
}
