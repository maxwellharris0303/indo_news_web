import type { Topic } from "@/lib/content/types";

/** Canonical topic definitions (DB seed + inference + admin). */
export const topicCatalog: Topic[] = [
  {
    slug: "demo-nasional",
    name: "Aksi Demo Nasional",
    description: "Liputan terkini aksi unjuk rasa dan respons pemerintah.",
  },
  {
    slug: "ihsg",
    name: "IHSG & Pasar Modal",
    description: "Pergerakan indeks, emiten, dan kebijakan bursa.",
  },
  {
    slug: "karhutla",
    name: "Karhutla & Lingkungan",
    description: "Kebakaran hutan, kabut asap, dan mitigasi bencana.",
  },
];

/** Homepage chip order (editorial priority). */
export const homepageTopicSlugs = [
  "demo-nasional",
  "ihsg",
  "karhutla",
] as const;

const catalogBySlug = new Map(topicCatalog.map((t) => [t.slug, t]));

export function isTopicSlug(value: string): boolean {
  return catalogBySlug.has(value);
}

export function getTopicFromCatalog(slug: string): Topic | undefined {
  return catalogBySlug.get(slug);
}

export function parseTopicSlugs(values: string[]): string[] {
  const out: string[] = [];
  for (const raw of values) {
    const slug = raw.trim();
    if (slug && isTopicSlug(slug) && !out.includes(slug)) out.push(slug);
  }
  return out;
}
