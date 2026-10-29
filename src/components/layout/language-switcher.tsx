"use client";

import { Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setSiteLocaleAction } from "@/app/actions/locale";
import { useSiteLocale } from "@/components/locale/locale-provider";
import type { SiteLocale } from "@/lib/locale";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  onNavigate?: () => void;
};

export function LanguageSwitcher({ className, onNavigate }: Props) {
  const { locale, setLocale } = useSiteLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const target: SiteLocale = locale === "en" ? "id" : "en";
  const label = locale === "en" ? "ID" : "EN";
  const ariaLabel =
    locale === "en"
      ? "Ganti ke Bahasa Indonesia"
      : "Switch to English";

  function switchLocale() {
    startTransition(async () => {
      setLocale(target);
      await setSiteLocaleAction(target);
      router.refresh();
      onNavigate?.();
    });
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={switchLocale}
      className={cn(
        "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-border bg-muted/70 px-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted active:bg-muted/90 disabled:opacity-60",
        className,
      )}
      aria-label={ariaLabel}
      aria-busy={pending}
    >
      <Globe className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
      <span>{label}</span>
    </button>
  );
}
