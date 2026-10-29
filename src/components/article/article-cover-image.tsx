"use client";

import Image from "next/image";
import { useState } from "react";
import {
  isNextImageHost,
  normalizeImageUrl,
  picsumCoverForSlug,
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

  if (isNextImageHost(current)) {
    return (
      <Image
        src={current}
        alt={alt}
        fill={fill}
        priority={priority}
        className={className}
        sizes={sizes}
      />
    );
  }

  return (
    // Publisher CDN — not in next/image allowlist; native img + picsum on error
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={current}
      alt={alt}
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
