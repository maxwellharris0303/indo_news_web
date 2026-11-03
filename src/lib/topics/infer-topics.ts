import { isTopicSlug, topicCatalog } from "@/lib/topics/catalog";

type TopicSlug = (typeof topicCatalog)[number]["slug"];

type KeywordRule = { phrase: string; weight: number };

const TOPIC_RULES: { slug: TopicSlug; rules: KeywordRule[] }[] = [
  {
    slug: "demo-nasional",
    rules: [
      { phrase: "unjuk rasa", weight: 4 },
      { phrase: "aksi demo", weight: 4 },
      { phrase: "demo nasional", weight: 4 },
      { phrase: "aksi damai", weight: 3 },
      { phrase: "massa aksi", weight: 3 },
      { phrase: "buruh", weight: 2 },
      { phrase: "demonstrasi", weight: 3 },
      { phrase: "demo", weight: 2 },
      { phrase: "polisi bubarkan", weight: 3 },
      { phrase: "kericuhan", weight: 2 },
    ],
  },
  {
    slug: "ihsg",
    rules: [
      { phrase: "pasar modal", weight: 4 },
      { phrase: "bursa efek indonesia", weight: 4 },
      { phrase: "ihsg", weight: 4 },
      { phrase: "idx composite", weight: 3 },
      { phrase: "bei", weight: 2 },
      { phrase: "saham", weight: 2 },
      { phrase: "emiten", weight: 3 },
      { phrase: "ipo", weight: 3 },
      { phrase: "obligasi", weight: 2 },
      { phrase: "investor", weight: 2 },
      { phrase: "bursa efek", weight: 4 },
      { phrase: "bank indonesia", weight: 2 },
      { phrase: "rupiah", weight: 1 },
    ],
  },
  {
    slug: "karhutla",
    rules: [
      { phrase: "karhutla", weight: 4 },
      { phrase: "kebakaran hutan", weight: 4 },
      { phrase: "kebakaran lahan", weight: 4 },
      { phrase: "kabut asap", weight: 4 },
      { phrase: "lahan gambut", weight: 3 },
      { phrase: "hot spot", weight: 3 },
      { phrase: "titik panas", weight: 3 },
      { phrase: "pm2.5", weight: 2 },
      { phrase: "pembakaran hutan", weight: 4 },
    ],
  },
];

const MIN_TOPIC_SCORE = 3;

function normalizeText(parts: string[]): string {
  return parts
    .join(" ")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreTopic(text: string, rules: KeywordRule[]): number {
  let score = 0;
  const sorted = [...rules].sort((a, b) => b.phrase.length - a.phrase.length);
  let remaining = ` ${text} `;

  for (const { phrase, weight } of sorted) {
    const needle = ` ${phrase} `;
    let idx = remaining.indexOf(needle);
    while (idx !== -1) {
      score += weight;
      remaining =
        remaining.slice(0, idx + 1) +
        " ".repeat(phrase.length + 2) +
        remaining.slice(idx + needle.length);
      idx = remaining.indexOf(needle);
    }
  }

  return score;
}

/** Returns zero or more topic slugs for an article (conservative scoring). */
export function inferTopicSlugsFromText(input: {
  title?: string;
  dek?: string;
  body?: string;
  category?: string;
}): TopicSlug[] {
  const text = normalizeText([
    input.title ?? "",
    input.dek ?? "",
    input.body ?? "",
  ]);
  if (!text) return [];

  const scored: { slug: TopicSlug; score: number }[] = [];
  for (const { slug, rules } of TOPIC_RULES) {
    const score = scoreTopic(text, rules);
    if (score >= MIN_TOPIC_SCORE) scored.push({ slug, score });
  }

  if (input.category === "ekonomi" && !scored.some((s) => s.slug === "ihsg")) {
    const ihsgScore = scoreTopic(text, TOPIC_RULES.find((t) => t.slug === "ihsg")!.rules);
    if (ihsgScore >= 2) scored.push({ slug: "ihsg", score: ihsgScore });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.slug).filter((slug) => isTopicSlug(slug)) as TopicSlug[];
}
