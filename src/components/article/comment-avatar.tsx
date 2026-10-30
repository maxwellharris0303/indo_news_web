import { cn } from "@/lib/utils";

const AVATAR_PALETTES = [
  "bg-primary/15 text-primary ring-primary/20",
  "bg-sky-500/15 text-sky-700 dark:text-sky-300 ring-sky-500/20",
  "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-emerald-500/20",
  "bg-amber-500/15 text-amber-800 dark:text-amber-300 ring-amber-500/20",
  "bg-violet-500/15 text-violet-700 dark:text-violet-300 ring-violet-500/20",
  "bg-rose-500/15 text-rose-700 dark:text-rose-300 ring-rose-500/20",
] as const;

function hashName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i += 1) {
    h = (h * 31 + name.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function commentInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function CommentAvatar({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const palette = AVATAR_PALETTES[hashName(name) % AVATAR_PALETTES.length]!;
  const dim = size === "sm" ? "h-9 w-9 text-xs" : "h-10 w-10 text-sm";

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold ring-1 ring-inset",
        dim,
        palette,
        className,
      )}
      aria-hidden
    >
      {commentInitials(name)}
    </span>
  );
}
