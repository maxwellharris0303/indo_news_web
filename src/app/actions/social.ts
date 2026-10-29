"use server";

import { revalidatePath } from "next/cache";
import type { ArticleStatus } from "@prisma/client";
import { auth } from "@/auth";
import {
  addComment,
  recordReadingHistory,
  subscribeNewsletter,
  updateArticleStatus,
} from "@/lib/content/repository";

export async function postCommentFormAction(formData: FormData) {
  await postCommentAction(formData);
}

export async function postCommentAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false as const, error: "Login diperlukan" };
  }

  const articleId = String(formData.get("articleId") ?? "");
  const body = String(formData.get("body") ?? "");
  const path = String(formData.get("path") ?? "/");

  try {
    await addComment(session.user.id, articleId, body);
    revalidatePath(path);
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Gagal mengirim komentar" };
  }
}

export async function newsletterSubscribeAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  try {
    await subscribeNewsletter(email);
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Email tidak valid" };
  }
}

export async function trackReadingAction(articleId: string) {
  const session = await auth();
  if (!session?.user?.id) return;
  await recordReadingHistory(session.user.id, articleId);
}

export async function updateArticleStatusFormAction(formData: FormData) {
  await updateArticleStatusAction(formData);
}

export async function updateArticleStatusAction(formData: FormData) {
  const session = await auth();
  const role = session?.user?.role;
  if (
    !session?.user?.id ||
    (role !== "SUPERADMIN" && role !== "ADMIN" && role !== "EDITOR")
  ) {
    return { ok: false as const, error: "Unauthorized" };
  }

  const articleId = String(formData.get("articleId") ?? "");
  const status = String(formData.get("status") ?? "") as ArticleStatus;
  const allowed: ArticleStatus[] = [
    "DRAFT",
    "REVIEW",
    "SCHEDULED",
    "PUBLISHED",
    "CORRECTED",
    "ARCHIVED",
  ];
  if (!allowed.includes(status)) {
    return { ok: false as const, error: "Status tidak valid" };
  }

  await updateArticleStatus(articleId, status);
  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true as const };
}
