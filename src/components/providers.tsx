"use client";

import { SessionProvider } from "next-auth/react";
import { LocaleProvider } from "@/components/locale/locale-provider";
import type { SiteLocale } from "@/lib/locale";

export function Providers({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: SiteLocale;
}) {
  return (
    <LocaleProvider initialLocale={locale}>
      <SessionProvider>{children}</SessionProvider>
    </LocaleProvider>
  );
}
