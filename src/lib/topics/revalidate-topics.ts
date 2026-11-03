import { revalidatePath } from "next/cache";

export function revalidateTopicSlugs(slugs: string[]) {
  revalidatePath("/topik");
  revalidatePath("/");
  for (const slug of [...new Set(slugs)]) {
    revalidatePath(`/topik/${slug}`);
  }
}
