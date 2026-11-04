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

const iconBtnClass = "h-10 w-10 shrink-0";

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
    <header className="sticky top-0 z-50 border-b-2 border-primary bg-card pt-[env(safe-area-inset-top,0px)]">
      <div className="mx-auto max-w-7xl px-3 sm:px-6">
        <div className="flex min-h-[3.25rem] items-center gap-2 py-2 sm:min-h-16 sm:gap-4">
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

          <Link href="/" className="min-w-0 flex-1 lg:flex-none">
            <NoTranslateBrand
              as="span"
              className="block font-serif text-xl font-black tracking-tight text-foreground sm:text-2xl"
            >
              {site.name}
            </NoTranslateBrand>
            <span className="mt-0.5 hidden text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground sm:block">
              {site.tagline}
            </span>
          </Link>

          <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
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

        <nav
          className="hidden border-t border-border py-1 lg:block"
          aria-label="Kanal utama"
        >
          <ul className="flex flex-wrap items-center gap-x-1 gap-y-1 text-[13px]">
            {navMain.map((item, i) => (
              <li key={item.href} className="flex items-center">
                {i > 0 ? (
                  <span className="mx-1.5 text-border select-none" aria-hidden>
                    |
                  </span>
                ) : null}
                <Link
                  href={item.href}
                  className={cn(
                    "whitespace-nowrap px-0.5 py-1 font-medium transition-colors hover:text-primary",
                    pathname === item.href || pathname.startsWith(`${item.href}/`)
                      ? "text-primary"
                      : "text-foreground/85",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
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
          className="fixed inset-0 top-[var(--site-header-height)] z-40 bg-black/50 lg:hidden"
          aria-label="Tutup menu"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      <div
        id="mobile-nav-panel"
        className={cn(
          "relative z-50 border-t border-border bg-card lg:hidden",
          menuOpen
            ? "block max-h-[min(70vh,calc(100dvh-var(--site-header-height)))] overflow-y-auto overscroll-contain"
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
          <ul className="divide-y divide-border border-y border-border">
            {navMain.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex min-h-11 items-center gap-3 py-2 text-sm font-medium hover:text-primary"
                  onClick={() => setMenuOpen(false)}
                >
                  <NavChannelIcon href={item.href} className="h-4 w-4 opacity-60" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
