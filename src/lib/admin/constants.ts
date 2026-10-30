import type { ArticleStatus, EditorialOrigin } from "@prisma/client";

export const ARTICLE_STATUSES = [
  "DRAFT",
  "REVIEW",
  "SCHEDULED",
  "PUBLISHED",
  "CORRECTED",
  "ARCHIVED",
] as const satisfies readonly ArticleStatus[];

export const EDITORIAL_ORIGINS = [
  "ORIGINAL",
  "RSS_REWRITE",
] as const satisfies readonly EditorialOrigin[];

export const EDITORIAL_ORIGIN_LABELS: Record<EditorialOrigin, string> = {
  ORIGINAL: "Asli redaksi",
  RSS_REWRITE: "Ulas ulang RSS",
};

export const STATUS_LABELS: Record<ArticleStatus, string> = {
  DRAFT: "Draft",
  REVIEW: "Review",
  SCHEDULED: "Terjadwal",
  PUBLISHED: "Terbit",
  CORRECTED: "Koreksi",
  ARCHIVED: "Arsip",
};

export const ROLE_LABELS: Record<string, string> = {
  SUPERADMIN: "Super Admin",
  ADMIN: "Admin",
  EDITOR: "Editor",
};

export const selectClassName =
  "h-10 w-full rounded-md border border-border bg-background px-3 text-sm";

export const textareaClassName =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm";
