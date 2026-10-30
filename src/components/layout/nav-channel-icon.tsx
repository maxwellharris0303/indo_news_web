import { getNavIcon } from "@/lib/nav-icons";
import { cn } from "@/lib/utils";

export function NavChannelIcon({
  href,
  className,
}: {
  href: string;
  className?: string;
}) {
  const Icon = getNavIcon(href);
  return (
    <Icon
      className={cn("shrink-0 text-muted-foreground", className)}
      aria-hidden
    />
  );
}
