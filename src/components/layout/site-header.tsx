"use client";

import Link from "next/link";
import { Menu, Search, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AuthNav } from "@/components/layout/auth-nav";
import { MobileAuthLinks } from "@/components/layout/mobile-auth-links";
import { HeaderSearchPanel } from "@/components/search/header-search-panel";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { NoTranslateBrand } from "@/components/brand/no-translate-brand";
import { NavChannelIcon } from "@/components/layout/nav-channel-icon";
import { site, navMain } from "@/lib/site";
import { cn } from "@/lib/utils";

const iconBtnClass =
  "h-11 w-11 shrink-0 sm:h-10 sm:w-10";

function HeaderSearchPanelFallback() {
  return null;
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setMenuOpen(false);
        setSearchOpen(true);
        return;
      }
      if (e.key === "Escape" && searchOpen) {
        e.preventDefault();
        setSearchOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [searchOpen]);

  function toggleSearch() {
    setMenuOpen(false);
    setSearchOpen((v) => !v);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/95 pt-[env(safe-area-inset-top,0px)] backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex min-h-14 max-w-7xl flex-wrap items-center gap-x-2 gap-y-2 px-3 py-2 sm:min-h-16 sm:gap-3 sm:px-6 lg:flex-nowrap">
        <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(iconBtnClass, "lg:hidden")}
            aria-label={menuOpen ? "Tutup menu" : "Buka menu navigasi"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? (
              <X className="h-5 w-5" aria-hidden />
            ) : (
              <Menu className="h-5 w-5" aria-hidden />
            )}
          </Button>

          <Link
            href="/"
            className="flex min-w-0 items-center gap-2.5 overflow-hidden"
          >
            <NoTranslateBrand
              as="span"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground"
            >
              KD
            </NoTranslateBrand>
            <div className="min-w-0 leading-tight">
              <NoTranslateBrand
                as="p"
                className="truncate font-serif text-base font-bold tracking-tight text-foreground sm:text-lg"
              >
                {site.name}
              </NoTranslateBrand>
              <p className="hidden truncate text-[11px] text-muted-foreground md:block">
                {site.tagline}
              </p>
            </div>
          </Link>
        </div>

        <nav
          className="hidden min-w-0 flex-1 flex-wrap items-center justify-center gap-0.5 lg:flex xl:justify-center"
          aria-label="Kanal utama"
        >
          {navMain.map((item) => {
            const isIndeks = item.href === "/indeks";
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-1 whitespace-nowrap rounded-md px-1.5 py-1.5 text-xs font-medium transition-colors xl:gap-1.5 xl:px-2.5 xl:py-2 xl:text-sm",
                  isIndeks
                    ? "text-primary hover:bg-muted hover:text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <NavChannelIcon
                  href={item.href}
                  className={cn(
                    "h-3.5 w-3.5 xl:h-4 xl:w-4",
                    isIndeks && "text-primary",
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-1.5">
          <div className="hidden md:block">
            <AuthNav />
          </div>
          <Button
            type="button"
            variant={searchOpen ? "secondary" : "ghost"}
            size="icon"
            className={iconBtnClass}
            aria-label={searchOpen ? "Tutup pencarian" : "Buka pencarian"}
            aria-expanded={searchOpen}
            aria-controls="header-search-panel"
            onClick={toggleSearch}
          >
            {searchOpen ? (
              <X className="h-5 w-5" aria-hidden />
            ) : (
              <Search className="h-5 w-5" aria-hidden />
            )}
          </Button>
          <ThemeToggle className={iconBtnClass} />
        </div>
      </div>

      <div id="header-search-panel">
        <Suspense fallback={<HeaderSearchPanelFallback />}>
          <HeaderSearchPanel
            open={searchOpen}
            onClose={() => setSearchOpen(false)}
          />
        </Suspense>
      </div>

      {menuOpen ? (
        <button
          type="button"
          className="fixed inset-0 top-14 z-40 bg-black/40 sm:top-16 lg:hidden"
          aria-label="Tutup menu"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      <div
        id="mobile-nav-panel"
        className={cn(
          "relative z-50 border-t border-border bg-background shadow-lg lg:hidden",
          menuOpen
            ? "block max-h-[min(70vh,calc(100dvh-3.5rem))] overflow-y-auto overscroll-contain"
            : "hidden",
        )}
      >
        <nav
          className="mx-auto max-w-7xl px-3 py-3 sm:px-6"
          aria-label="Menu mobile"
        >
          <div className="mb-3 md:hidden">
            <MobileAuthLinks onNavigate={() => setMenuOpen(false)} />
          </div>
          <ul className="grid gap-0.5">
            {navMain.map((item) => {
              const isIndeks = item.href === "/indeks";
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium hover:bg-muted active:bg-muted",
                      isIndeks && "font-semibold text-primary",
                    )}
                    onClick={() => setMenuOpen(false)}
                  >
                    <NavChannelIcon
                      href={item.href}
                      className={cn(
                        "h-5 w-5",
                        isIndeks && "text-primary",
                      )}
                    />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
