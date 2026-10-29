"use client";

import Link from "next/link";
import { Menu, Search, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthNav } from "@/components/layout/auth-nav";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { MobileAuthLinks } from "@/components/layout/mobile-auth-links";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { site, navMain } from "@/lib/site";
import { cn } from "@/lib/utils";

const iconBtnClass =
  "h-11 w-11 shrink-0 sm:h-10 sm:w-10";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/95 pt-[env(safe-area-inset-top,0px)] backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-3 sm:h-16 sm:gap-3 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(iconBtnClass, "lg:hidden")}
            aria-label={open ? "Tutup menu" : "Buka menu navigasi"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <X className="h-5 w-5" aria-hidden />
            ) : (
              <Menu className="h-5 w-5" aria-hidden />
            )}
          </Button>

          <Link
            href="/"
            className="flex min-w-0 items-center gap-2.5 overflow-hidden"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              KD
            </span>
            <div className="min-w-0 leading-tight">
              <p className="truncate font-serif text-base font-bold tracking-tight text-foreground sm:text-lg">
                {site.name}
              </p>
              <p className="hidden truncate text-[11px] text-muted-foreground md:block">
                {site.tagline}
              </p>
            </div>
          </Link>
        </div>

        <nav
          className="hidden items-center gap-0.5 lg:flex"
          aria-label="Kanal utama"
        >
          {navMain.slice(0, 8).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/indeks"
            className="rounded-md px-2.5 py-2 text-sm font-medium text-primary"
          >
            Indeks
          </Link>
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          <div className="hidden md:block">
            <AuthNav />
          </div>
          <LanguageSwitcher />
          <Button
            variant="ghost"
            size="icon"
            className={iconBtnClass}
            asChild
            aria-label="Cari berita"
          >
            <Link href="/search">
              <Search className="h-5 w-5" aria-hidden />
            </Link>
          </Button>
          <ThemeToggle className={iconBtnClass} />
        </div>
      </div>

      {open ? (
        <button
          type="button"
          className="fixed inset-0 top-14 z-40 bg-black/40 sm:top-16 lg:hidden"
          aria-label="Tutup menu"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <div
        id="mobile-nav-panel"
        className={cn(
          "relative z-50 border-t border-border bg-background shadow-lg lg:hidden",
          open ? "block max-h-[min(70vh,calc(100dvh-3.5rem))] overflow-y-auto overscroll-contain" : "hidden",
        )}
      >
        <nav
          className="mx-auto max-w-7xl px-3 py-3 sm:px-6"
          aria-label="Menu mobile"
        >
          <div className="mb-3 md:hidden">
            <MobileAuthLinks onNavigate={() => setOpen(false)} />
          </div>
          <ul className="grid gap-0.5">
            {navMain.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium hover:bg-muted active:bg-muted"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="mt-2 border-t border-border pt-3">
              <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Bahasa
              </p>
              <div className="px-3">
                <LanguageSwitcher
                  className="w-full justify-center"
                  onNavigate={() => setOpen(false)}
                />
              </div>
            </li>
            <li className="mt-2">
              <Link
                href="/indeks"
                className="flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold text-primary hover:bg-muted"
                onClick={() => setOpen(false)}
              >
                Indeks Berita
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
