import type { PrismaClient } from "@prisma/client";
import { articles } from "@/lib/content/seed";

/** Fixed ids so production re-seed can upsert without duplicating. */
export const DEMO_COMMENTER_USERS = [
  { id: "u-demo-reader", email: "pembaca@kabardesk.id", name: "Pembaca Demo" },
  { id: "u-cmt-budi", email: "budi.santoso@example.com", name: "Budi Santoso" },
  { id: "u-cmt-sari", email: "sari.m@example.com", name: "Sari Maulida" },
  { id: "u-cmt-dewi", email: "dewi.k@example.com", name: "Dewi Kartika" },
  { id: "u-cmt-rio", email: "rio.pratama@example.com", name: "Rio Pratama" },
  { id: "u-cmt-nia", email: "nia.rahman@example.com", name: "Nia Rahman" },
  { id: "u-cmt-fajar", email: "fajar.h@example.com", name: "Fajar Hidayat" },
  { id: "u-cmt-maya", email: "maya.l@example.com", name: "Maya Lestari" },
] as const;

const COMMENT_SNIPPETS: string[] = [
  "Terima kasih KabarDesk, penjelasannya mudah dipahami.",
  "Semoga informasinya bisa ditindaklanjuti pihak terkait dengan cepat.",
  "Menurut saya perlu ada klarifikasi resmi agar tidak menimbulkan spekulasi.",
  "Saya setuju dengan poin utama berita ini, relevan dengan kondisi terkini.",
  "Mohon dicek lagi datanya — angka di paragraf awal agak berbeda dengan sumber lain.",
  "Bagus liputannya, tapi tolong tambahkan konteks lokal daerah setempat.",
  "Ini isu penting; share ke grup keluarga supaya tidak termakan hoaks.",
  "Redaksi, apakah ada perkembangan terbaru hari ini? Tunggu update lanjutan.",
  "Saya baca dari sumber aslinya juga, rewrite di sini sudah cukup netral.",
  "Harap komentar netizen tetap santun — fokus ke solusi, bukan adu domba.",
  "Kalau benar, dampaknya ke masyarakat kecil pasti terasa. Perlu langkah konkret.",
  "Timeline kejadiannya sudah jelas, membantu yang baru follow isu ini.",
  "Ada bagian yang perlu diperdalam, terutama soal implikasi hukumnya.",
  "Semoga korban / pihak terdampak segera mendapat bantuan.",
  "Artikel panjang tapi padat — worth it untuk dibaca sampai habis.",
  "Cek fakta dulu sebelum share, ya. KabarDesk biasanya rapi sumbernya.",
  "Saya di daerah juga merasakan hal serupa, terima kasih sudah meliput.",
  "Pertanyaan: apakah kebijakan ini berlaku retroaktif atau hanya ke depan?",
  "Tulisan opini di kolom lain beda sudut pandang — bagus untuk balance.",
  "Notifikasi breaking tadi nyambung ke berita ini, flow-nya oke.",
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

function commentCountForArticle(articleId: string): number {
  return 5 + (hashString(articleId) % 6);
}

function commentBody(articleId: string, index: number, title: string): string {
  const h = hashString(`${articleId}:${index}`);
  const snippet = COMMENT_SNIPPETS[h % COMMENT_SNIPPETS.length]!;
  const shortTitle =
    title.length > 72 ? `${title.slice(0, 69)}…` : title;
  if (index % 3 === 0) {
    return `Tentang "${shortTitle}": ${snippet}`;
  }
  return snippet;
}

function commentUserId(articleId: string, index: number): string {
  const users = DEMO_COMMENTER_USERS;
  const h = hashString(`${articleId}:u:${index}`);
  return users[h % users.length]!.id;
}

function commentCreatedAt(articlePublishedAt: string, index: number): Date {
  const base = new Date(articlePublishedAt).getTime();
  const hoursAgo = (index + 1) * 5 + (hashString(`${index}`) % 40);
  return new Date(base + hoursAgo * 60 * 60 * 1000);
}

async function upsertCommentUsers(prisma: PrismaClient) {
  for (const u of DEMO_COMMENTER_USERS) {
    await prisma.user.upsert({
      where: { id: u.id },
      create: {
        id: u.id,
        email: u.email,
        name: u.name,
        role: "READER",
        plan: u.id === "u-demo-reader" ? "PLUS" : "FREE",
        interests: "[]",
      },
      update: { name: u.name, email: u.email },
    });
  }
}

/** 5–10 approved comments per seed demo article; safe to run on production DB. */
export async function seedDemoArticleComments(prisma: PrismaClient) {
  await upsertCommentUsers(prisma);

  let created = 0;
  for (const article of articles) {
    const count = commentCountForArticle(article.id);
    for (let i = 0; i < count; i += 1) {
      const id = `c-seed-${article.id}-${i}`;
      const existing = await prisma.comment.findUnique({ where: { id } });
      if (existing) continue;

      let articleRow = await prisma.article.findUnique({
        where: { id: article.id },
        select: { id: true, title: true, publishedAt: true },
      });
      if (!articleRow) {
        articleRow = await prisma.article.findFirst({
          where: { category: article.category, slug: article.slug },
          select: { id: true, title: true, publishedAt: true },
        });
      }
      if (!articleRow) continue;

      const userId = commentUserId(article.id, i);
      const userOk = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });
      if (!userOk) continue;

      await prisma.comment.create({
        data: {
          id,
          articleId: articleRow.id,
          userId,
          body: commentBody(article.id, i, articleRow.title),
          approved: true,
          createdAt: commentCreatedAt(
            articleRow.publishedAt.toISOString(),
            i,
          ),
        },
      });
      created += 1;
    }
  }

  return created;
}
