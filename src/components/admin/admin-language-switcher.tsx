"use client";

import { Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setAdminLocaleAction } from "@/app/actions/admin-locale";
import { useAdminLocale } from "@/components/admin/admin-locale-provider";
import type { AdminLocale } from "@/lib/admin-locale";
import { shellText } from "@/lib/admin/locale-ui";
import { cn } from "@/lib/utils";

type Props = { className?: string };

export function AdminLanguageSwitcher({ className }: Props) {
  const { locale, setLocale } = useAdminLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const copy = shellText(locale);

  const target: AdminLocale = locale === "en" ? "id" : "en";
  const label = locale === "en" ? "ID" : "EN";
  const ariaLabel = locale === "en" ? copy.switchToId : copy.switchToEn;

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          setLocale(target);
          await setAdminLocaleAction(target);
          router.refresh();
        });
      }}
      className={cn(
        "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-60",
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
