"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminLocale } from "@/components/admin/admin-locale-provider";
import { navText } from "@/lib/admin/locale-ui";
import { cn } from "@/lib/utils";

export function AdminNav() {
  const activePath = usePathname();
  const { locale } = useAdminLocale();
  const copy = navText(locale);
  const nav = [
    { href: "/admin", label: copy.overview, exact: true },
    { href: "/admin/artikel", label: copy.articles, exact: false },
    { href: "/admin/artikel/baru", label: copy.compose, exact: false },
    { href: "/admin/rss", label: copy.rss, exact: false },
  ] as const;

  return (
    <nav className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
      {nav.map((item) => {
        const active = (() => {
          if (item.exact) return activePath === item.href;
          if (item.href === "/admin/artikel") {
            return activePath === "/admin/artikel";
          }
          if (item.href === "/admin/rss") {
            return (
              activePath === "/admin/rss" ||
              activePath.startsWith("/admin/rss/")
            );
          }
          return (
            activePath === item.href ||
            activePath.startsWith(`${item.href}/`)
          );
        })();
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-card text-foreground hover:bg-muted",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
