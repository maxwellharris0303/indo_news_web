"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { isCategorySlug } from "@/lib/site";
import { z } from "zod";

const articleSchema = z.object({
  title: z.string().min(10),
  slug: z.string().min(3),
  category: z.string().min(2),
  dek: z.string().min(10),
  body: z.string().min(50),
  authorId: z.string(),
  status: z
    .enum([
      "DRAFT",
      "REVIEW",
      "SCHEDULED",
      "PUBLISHED",
      "CORRECTED",
      "ARCHIVED",
    ])
    .default("PUBLISHED"),
});

async function requireStaff() {
  const session = await auth();
  const role = session?.user?.role;
  if (
    !session?.user?.id ||
    (role !== "SUPERADMIN" && role !== "ADMIN" && role !== "EDITOR")
  ) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

export async function createArticleFormAction(formData: FormData) {
  await createArticleAction(formData);
}

export async function createArticleAction(formData: FormData) {
  await requireStaff();

  const parsed = articleSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    category: formData.get("category"),
    dek: formData.get("dek"),
    body: formData.get("body"),
    authorId: formData.get("authorId"),
    status: formData.get("status") ?? "PUBLISHED",
  });

  if (!parsed.success) {
    return { ok: false as const, error: "Validasi gagal" };
  }

  const data = parsed.data;
  if (!isCategorySlug(data.category)) {
    return { ok: false as const, error: "Kategori tidak valid" };
  }
  const id = `a-${data.slug.slice(0, 24)}`;

  try {
    await prisma.article.create({
      data: {
        id,
        slug: data.slug,
        category: data.category,
      title: data.title,
      dek: data.dek,
      body: data.body,
      summaryBullets: JSON.stringify([
        "Artikel baru dari redaksi KabarDesk.",
        "Detail lengkap ada di isi berita.",
        "Ikuti pembaruan di kanal terkait.",
      ]),
      publishedAt: new Date(),
      authorId: data.authorId,
      imageUrl: `https://picsum.photos/seed/kabardesk-${data.slug.slice(0, 20)}/1200/750`,
      imageCaption: "Ilustrasi berita",
      imageCredit: "KabarDesk",
      sources: JSON.stringify(["Redaksi KabarDesk"]),
      featuredLevel: 0,
      viewCount: 0,
      status: data.status,
      locale: "id",
      galleryImages: "[]",
      aiSummary: "Artikel baru dari redaksi KabarDesk.",
      },
    });
  } catch {
    return { ok: false as const, error: "Slug sudah dipakai atau gagal simpan" };
  }

  revalidatePath("/");
  revalidatePath(`/${data.category}`);
  revalidatePath(`/${data.category}/${data.slug}`);
  revalidatePath("/admin");
  revalidatePath("/indeks");

  return { ok: true as const, id, category: data.category, slug: data.slug };
}

export async function deleteArticleFormAction(formData: FormData) {
  await deleteArticleAction(formData);
}

export async function deleteArticleAction(formData: FormData) {
  await requireStaff();

  const articleId = String(formData.get("articleId") ?? "").trim();
  if (!articleId) {
    return { ok: false as const, error: "Artikel tidak ditemukan" };
  }

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { category: true, slug: true },
  });
  if (!article) {
    return { ok: false as const, error: "Artikel tidak ditemukan" };
  }

  await prisma.article.delete({ where: { id: articleId } });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/indeks");
  revalidatePath(`/${article.category}`);
  if (article.category === "daerah") {
    revalidatePath(`/daerah/${article.slug}`);
  } else {
    revalidatePath(`/${article.category}/${article.slug}`);
  }

  return { ok: true as const };
}
