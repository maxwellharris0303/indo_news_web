"use client";

import Link from "next/link";
import { Menu, Search } from "lucide-react";
import { useState } from "react";
import { AuthNav } from "@/components/layout/auth-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { site, navMain } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:h-16 sm:px-6">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Menu navigasi"
          onClick={() => setOpen((v) => !v)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            KD
          </span>
          <div className="leading-tight">
            <p className="font-serif text-lg font-bold tracking-tight text-foreground">
              {site.name}
            </p>
            <p className="hidden text-[11px] text-muted-foreground sm:block">
              {site.tagline}
            </p>
          </div>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
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
            href="/en"
            className="rounded-md px-2.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            EN
          </Link>
          <Link
            href="/indeks"
            className="rounded-md px-2.5 py-2 text-sm font-medium text-primary"
          >
            Indeks
          </Link>
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <div className="hidden sm:block">
            <AuthNav />
          </div>
          <Button variant="ghost" size="icon" asChild aria-label="Cari">
            <Link href="/search">
              <Search className="h-5 w-5" />
            </Link>
          </Button>
          <ThemeToggle />
        </div>
      </div>

      <div
        className={cn(
          "border-t border-border bg-muted/40 lg:hidden",
          open ? "block" : "hidden",
        )}
      >
        <nav className="mx-auto grid max-w-7xl gap-1 px-4 py-3 sm:px-6">
          {navMain.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-background"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
