"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";

export async function toggleSavedArticle(
  articleId: string,
  articlePath?: string,
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false as const, error: "login_required" as const };
  }

  try {
    const existing = await prisma.savedArticle.findUnique({
      where: {
        userId_articleId: { userId: session.user.id, articleId },
      },
    });

    if (existing) {
      await prisma.savedArticle.delete({
        where: {
          userId_articleId: { userId: session.user.id, articleId },
        },
      });
    } else {
      await prisma.savedArticle.create({
        data: { userId: session.user.id, articleId },
      });
    }

    revalidatePath("/akun");
    if (articlePath) revalidatePath(articlePath);
    return { ok: true as const, saved: !existing };
  } catch {
    return { ok: false as const, error: "server" as const };
  }
}

export async function updateUserInterests(categories: string[]) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false as const };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { interests: JSON.stringify(categories) },
  });

  revalidatePath("/");
  revalidatePath("/akun");
  return { ok: true as const };
}

export async function setRegionPreference(regionSlug: string) {
  const cookieStore = await cookies();
  cookieStore.set("kabardesk-region", regionSlug, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  const session = await auth();
  if (session?.user?.id) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { regionSlug },
    });
  }

  revalidatePath("/");
  revalidatePath("/daerah");
  return { ok: true as const };
}
