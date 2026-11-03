import { isRegionHubSlug, type RegionHubSlug } from "@/lib/regions";

type KeywordRule = { phrase: string; weight: number };

/** Longer phrases first so matching prefers specific hits. */
const REGION_RULES: { slug: RegionHubSlug; rules: KeywordRule[] }[] = [
  {
    slug: "dki-jakarta",
    rules: [
      { phrase: "dki jakarta", weight: 4 },
      { phrase: "jakarta pusat", weight: 4 },
      { phrase: "jakarta selatan", weight: 4 },
      { phrase: "jakarta utara", weight: 4 },
      { phrase: "jakarta barat", weight: 4 },
      { phrase: "jakarta timur", weight: 4 },
      { phrase: "kepulauan seribu", weight: 4 },
      { phrase: "ibu kota", weight: 2 },
      { phrase: "jakarta", weight: 1 },
    ],
  },
  {
    slug: "jawa-barat",
    rules: [
      { phrase: "jawa barat", weight: 4 },
      { phrase: "jabar", weight: 3 },
      { phrase: "kota bandung", weight: 4 },
      { phrase: "bandung", weight: 3 },
      { phrase: "bekasi", weight: 3 },
      { phrase: "bogor", weight: 3 },
      { phrase: "depok", weight: 3 },
      { phrase: "cimahi", weight: 3 },
      { phrase: "tasikmalaya", weight: 3 },
      { phrase: "cirebon", weight: 3 },
    ],
  },
  {
    slug: "jawa-timur",
    rules: [
      { phrase: "jawa timur", weight: 4 },
      { phrase: "jatim", weight: 3 },
      { phrase: "surabaya", weight: 4 },
      { phrase: "malang", weight: 3 },
      { phrase: "sidoarjo", weight: 3 },
      { phrase: "banyuwangi", weight: 3 },
    ],
  },
  {
    slug: "jawa-tengah",
    rules: [
      { phrase: "jawa tengah", weight: 4 },
      { phrase: "jateng", weight: 3 },
      { phrase: "semarang", weight: 4 },
      { phrase: "surakarta", weight: 3 },
      { phrase: "solo", weight: 2 },
      { phrase: "magelang", weight: 3 },
      { phrase: "yogyakarta", weight: 2 },
      { phrase: "jogja", weight: 2 },
    ],
  },
  {
    slug: "bali",
    rules: [
      { phrase: "pulau bali", weight: 4 },
      { phrase: "bali", weight: 3 },
      { phrase: "denpasar", weight: 4 },
      { phrase: "ubud", weight: 3 },
      { phrase: "badung", weight: 3 },
      { phrase: "gianyar", weight: 3 },
    ],
  },
  {
    slug: "sulawesi-selatan",
    rules: [
      { phrase: "sulawesi selatan", weight: 4 },
      { phrase: "sulsel", weight: 3 },
      { phrase: "makassar", weight: 4 },
      { phrase: "gowa", weight: 3 },
    ],
  },
];

function normalizeText(parts: string[]): string {
  return parts
    .join(" ")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreRegion(text: string, rules: KeywordRule[]): number {
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

const MIN_SCORE = 3;
const MIN_LEAD = 2;

/**
 * Guess province hub slug from article text. Conservative to limit false positives
 * on national stories that only mention Jakarta in passing.
 */
export function inferRegionSlugFromText(input: {
  title?: string;
  dek?: string;
  body?: string;
  sourceName?: string;
}): RegionHubSlug | undefined {
  const text = normalizeText([
    input.title ?? "",
    input.dek ?? "",
    input.body ?? "",
    input.sourceName ?? "",
  ]);
  if (!text) return undefined;

  const scores: { slug: RegionHubSlug; score: number }[] = [];
  for (const { slug, rules } of REGION_RULES) {
    const score = scoreRegion(text, rules);
    if (score > 0) scores.push({ slug, score });
  }
  if (scores.length === 0) return undefined;

  scores.sort((a, b) => b.score - a.score);
  const best = scores[0]!;
  const second = scores[1]?.score ?? 0;

  if (best.score < MIN_SCORE) return undefined;
  if (best.score - second < MIN_LEAD && second > 0) return undefined;

  return isRegionHubSlug(best.slug) ? best.slug : undefined;
}
