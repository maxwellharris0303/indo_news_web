"use client";

import Image from "next/image";
import { useState } from "react";
import {
  normalizeImageUrl,
  picsumCoverForSlug,
  useNextImageOptimizer,
} from "@/lib/article-image";

type Props = {
  src: string;
  alt: string;
  slug: string;
  fill?: boolean;
  priority?: boolean;
  className?: string;
  sizes?: string;
};

export function ArticleCoverImage({
  src,
  alt,
  slug,
  fill = true,
  priority,
  className,
  sizes,
}: Props) {
  const initial = normalizeImageUrl(src) ?? picsumCoverForSlug(slug);
  const [current, setCurrent] = useState(initial);
  const fallback = picsumCoverForSlug(slug);

  if (useNextImageOptimizer(current)) {
    return (
      <Image
        src={current}
        alt={alt}
        fill={fill}
        priority={priority}
        className={className}
        sizes={sizes}
        onError={() => {
          if (current !== fallback) setCurrent(fallback);
        }}
      />
    );
  }

  return (
    // Publisher CDN — browser fetch (optimizer on VPS often times out)
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={current}
      alt={alt}
      referrerPolicy="no-referrer"
      className={
        fill
          ? `absolute inset-0 h-full w-full object-cover ${className ?? ""}`
          : className
      }
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      onError={() => {
        if (current !== fallback) setCurrent(fallback);
      }}
    />
  );
}
