import { revalidatePath } from "next/cache";
import { articlePublicHref } from "@/lib/article-url";

export function revalidatePublicArticle(category: string, slug: string) {
  revalidatePath(articlePublicHref(category, slug));
  revalidatePath(category === "daerah" ? "/daerah" : `/${category}`);
}
