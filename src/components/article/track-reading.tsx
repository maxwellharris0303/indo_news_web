"use client";

import { useEffect } from "react";
import { trackReadingAction } from "@/app/actions/social";

export function TrackReading({ articleId }: { articleId: string }) {
  useEffect(() => {
    void trackReadingAction(articleId);
  }, [articleId]);
  return null;
}
