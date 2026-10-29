"use client";

import Link from "next/link";
import { Globe } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  onNavigate?: () => void;
};

export function LanguageSwitcher({ className, onNavigate }: Props) {
  const pathname = usePathname();
  const isEnglish = pathname === "/en" || pathname.startsWith("/en/");

  const href = isEnglish ? "/" : "/en";
  const label = isEnglish ? "ID" : "EN";
  const ariaLabel = isEnglish
    ? "Ganti ke Bahasa Indonesia"
    : "Switch to English edition";

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-border bg-muted/70 px-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted active:bg-muted/90",
        className,
      )}
      aria-label={ariaLabel}
      hrefLang={isEnglish ? "id" : "en"}
    >
      <Globe className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
      <span>{label}</span>
    </Link>
  );
}
