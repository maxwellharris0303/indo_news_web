"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useId, useRef } from "react";
import { SearchForm } from "@/components/search/search-form";
import { cn } from "@/lib/utils";

export function HeaderSearchPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const panelId = useId();
  const searchParams = useSearchParams();
  const queryFromUrl = searchParams.get("q")?.trim() ?? "";
  const inputWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const t = window.requestAnimationFrame(() => {
      const input = inputWrapRef.current?.querySelector("input");
      input?.focus();
      input?.select();
    });
    return () => window.cancelAnimationFrame(t);
  }, [open]);

  return (
    <div
      id={panelId}
      role="region"
      aria-label="Pencarian berita"
      aria-hidden={!open}
      className={cn(
        "grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none",
        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
      )}
    >
      <div className="min-h-0 overflow-hidden">
        <div
          className={cn(
            "border-t border-border/80 bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/90",
            open ? "pointer-events-auto" : "pointer-events-none",
          )}
        >
          <div
            ref={inputWrapRef}
            className="mx-auto max-w-3xl px-3 py-4 sm:px-6 sm:py-5"
          >
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="font-serif text-lg font-bold tracking-tight text-foreground sm:text-xl">
                  Cari berita
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                  Judul, topik, atau kata kunci di seluruh KabarDesk.
                </p>
              </div>
              <kbd className="hidden rounded-md border border-border bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground sm:inline-block">
                Ctrl+K
              </kbd>
            </div>
            <div className="mt-4">
              <SearchForm
                initialQuery={queryFromUrl}
                onSubmitted={onClose}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
