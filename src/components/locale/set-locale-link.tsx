"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setSiteLocaleAction } from "@/app/actions/locale";
import { useSiteLocale } from "@/components/locale/locale-provider";
import type { SiteLocale } from "@/lib/locale";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  locale: SiteLocale;
  className?: string;
  children: React.ReactNode;
};

export function SetLocaleLink({ href, locale, className, children }: Props) {
  const { setLocale } = useSiteLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Link
      href={href}
      className={cn(className, pending && "pointer-events-none opacity-60")}
      onClick={(e) => {
        e.preventDefault();
        startTransition(async () => {
          setLocale(locale);
          await setSiteLocaleAction(locale);
          router.push(href);
          router.refresh();
        });
      }}
    >
      {children}
    </Link>
  );
}
