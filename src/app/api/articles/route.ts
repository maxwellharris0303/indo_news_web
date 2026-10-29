import { NextResponse } from "next/server";
import { getArticles } from "@/lib/content/repository";
import { isCategorySlug } from "@/lib/site";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const offset = Number(searchParams.get("offset") ?? "0");
  const limit = Math.min(Number(searchParams.get("limit") ?? "8"), 24);
  const categoryParam = searchParams.get("category");
  const localeParam = searchParams.get("locale");

  const category =
    categoryParam && isCategorySlug(categoryParam) ? categoryParam : undefined;
  const locale =
    localeParam === "en" || localeParam === "id" ? localeParam : undefined;

  const items = await getArticles({
    offset: Number.isFinite(offset) ? offset : 0,
    limit,
    category,
    locale,
    sort: "latest",
  });

  return NextResponse.json({ items, nextOffset: offset + items.length });
}
