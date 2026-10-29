"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin", label: "Ringkasan", exact: true },
  { href: "/admin/artikel", label: "Artikel", exact: false },
  { href: "/admin/artikel/baru", label: "Tulis baru", exact: false },
] as const;

export function AdminNav() {
  const activePath = usePathname();

  return (
    <nav className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
      {nav.map((item) => {
        const active = (() => {
          if (item.exact) return activePath === item.href;
          if (item.href === "/admin/artikel") {
            return activePath === "/admin/artikel";
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
