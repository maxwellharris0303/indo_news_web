import { z } from "zod";
import { categorySlugs, isCategorySlug } from "@/lib/site";

export const REWRITE_PROMPT_VERSION = "v1";

export const rewriteOutputSchema = z.object({
  title: z.string().min(10),
  dek: z.string().min(10),
  body: z.string().min(80),
  summaryBullets: z.array(z.string().min(5)).min(2).max(5),
  suggestedCategory: z
    .string()
    .refine((v) => isCategorySlug(v), "Invalid category"),
  attributionLine: z.string().min(10),
  confidence: z.enum(["high", "medium", "low"]),
});

export type RewriteOutput = z.infer<typeof rewriteOutputSchema>;

export function buildRewritePrompt(input: {
  sourceTitle: string;
  sourceUrl: string;
  sourceName: string;
  body: string;
  locale: string;
}): string {
  const localeLabel = input.locale === "en" ? "English" : "Bahasa Indonesia";
  return `You are an editor for KabarDesk, an Indonesian news portal.
Rewrite the SOURCE MATERIAL into an original news article in ${localeLabel}.

Rules:
- Do NOT invent facts, quotes, numbers, or names not present in the source.
- Neutral, clear journalism. Short dek (1-2 sentences). Body with paragraphs separated by blank lines.
- Include attributionLine citing the publisher and URL (${input.sourceUrl}).
- suggestedCategory must be one of: ${categorySlugs.join(", ")}.
- confidence: high if source body is detailed; medium if thin; low if very thin.

Return ONLY valid JSON matching this schema:
{
  "title": string,
  "dek": string,
  "body": string,
  "summaryBullets": string[],
  "suggestedCategory": string,
  "attributionLine": string,
  "confidence": "high" | "medium" | "low"
}

SOURCE PUBLISHER: ${input.sourceName}
SOURCE URL: ${input.sourceUrl}
SOURCE TITLE: ${input.sourceTitle}

SOURCE BODY:
"""
${input.body.slice(0, 12_000)}
"""`;
}

export function parseRewriteJson(raw: string): RewriteOutput {
  const trimmed = raw.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  const jsonStr = jsonMatch ? jsonMatch[0] : trimmed;
  const parsed = JSON.parse(jsonStr) as unknown;
  return rewriteOutputSchema.parse(parsed);
}
