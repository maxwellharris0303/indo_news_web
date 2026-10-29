"use client";

import { useState } from "react";
import {
  feedBrandAccent,
  feedFaviconUrl,
  feedHostname,
  feedInitials,
} from "@/lib/rss/feed-brand";

export function RssFeedBrandMark({
  name,
  siteUrl,
  size = "md",
}: {
  name: string;
  siteUrl: string;
  size?: "sm" | "md" | "lg";
}) {
  const [failed, setFailed] = useState(false);
  const accent = feedBrandAccent(siteUrl);
  const dim =
    size === "lg" ? "h-14 w-14 text-lg" : size === "sm" ? "h-8 w-8 text-xs" : "h-12 w-12 text-sm";

  if (failed) {
    return (
      <div
        className={`${dim} flex shrink-0 items-center justify-center rounded-xl font-bold text-white shadow-sm ring-1 ring-black/10`}
        style={{ backgroundColor: accent }}
        title={feedHostname(siteUrl)}
      >
        {feedInitials(name)}
      </div>
    );
  }

  return (
    <div
      className={`${dim} relative shrink-0 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-border`}
      style={{ boxShadow: `0 0 0 2px ${accent}22` }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={feedFaviconUrl(siteUrl, size === "lg" ? 128 : 64)}
        alt=""
        className="h-full w-full object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
