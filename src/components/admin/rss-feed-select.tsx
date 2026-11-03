"use client";

import { ChevronDown, Rss } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { RssFeedBrandMark } from "@/components/admin/rss-feed-brand";
import { selectClassName } from "@/lib/admin/constants";
import { cn } from "@/lib/utils";

export type RssFeedSelectOption = {
  id: string;
  name: string;
  siteUrl: string;
};

type Props = {
  feeds: RssFeedSelectOption[];
  emptyLabel?: string;
  className?: string;
  name?: string;
  defaultValue?: string;
  value?: string;
  onValueChange?: (feedId: string) => void;
  disabled?: boolean;
  "aria-label"?: string;
};

function FeedOptionRow({
  name,
  siteUrl,
  selected,
}: {
  name: string;
  siteUrl: string;
  selected?: boolean;
}) {
  return (
    <span className="flex min-w-0 flex-1 items-center gap-2">
      {siteUrl ? (
        <RssFeedBrandMark name={name} siteUrl={siteUrl} size="sm" />
      ) : (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground ring-1 ring-border">
          <Rss className="h-4 w-4" aria-hidden />
        </span>
      )}
      <span className={cn("truncate", selected && "font-medium")}>{name}</span>
    </span>
  );
}

export function RssFeedSelect({
  feeds,
  emptyLabel = "—",
  className,
  name,
  defaultValue = "",
  value: valueProp,
  onValueChange,
  disabled,
  "aria-label": ariaLabel,
}: Props) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const value = valueProp ?? internalValue;

  const selectedFeed = feeds.find((f) => f.id === value);

  function pick(id: string) {
    if (valueProp === undefined) setInternalValue(id);
    onValueChange?.(id);
    setOpen(false);
  }

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative min-w-[200px]", className)}>
      {name ? <input type="hidden" name={name} value={value} /> : null}
      <button
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={cn(
          selectClassName,
          "flex h-9 items-center justify-between gap-2 px-2 text-left text-xs",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        <span className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
          {selectedFeed ? (
            <FeedOptionRow
              name={selectedFeed.name}
              siteUrl={selectedFeed.siteUrl}
              selected
            />
          ) : (
            <>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground ring-1 ring-border">
                <Rss className="h-4 w-4" aria-hidden />
              </span>
              <span className="truncate text-muted-foreground">
                {emptyLabel}
              </span>
            </>
          )}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-64 w-full min-w-[240px] overflow-y-auto rounded-md border border-border bg-popover py-1 shadow-lg"
        >
          <li role="presentation">
            <button
              type="button"
              role="option"
              aria-selected={value === ""}
              className={cn(
                "flex w-full px-2 py-1.5 text-left text-xs hover:bg-muted",
                value === "" && "bg-muted/70",
              )}
              onClick={() => pick("")}
            >
              <FeedOptionRow name={emptyLabel} siteUrl="" />
            </button>
          </li>
          {feeds.map((feed) => (
            <li key={feed.id} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={value === feed.id}
                className={cn(
                  "flex w-full px-2 py-1.5 text-left text-xs hover:bg-muted",
                  value === feed.id && "bg-muted/70",
                )}
                onClick={() => pick(feed.id)}
              >
                <FeedOptionRow
                  name={feed.name}
                  siteUrl={feed.siteUrl}
                  selected={value === feed.id}
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
