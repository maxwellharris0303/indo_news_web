/** Plain text for browser TTS — title, dek, bullets, then body paragraphs. */
export function buildArticleSpeechText(input: {
  title: string;
  dek: string;
  summaryBullets: string[];
  body: string;
}): string {
  const parts: string[] = [];

  const title = input.title.trim();
  if (title) parts.push(title);

  const dek = input.dek.trim();
  if (dek) parts.push(dek);

  const bullets = input.summaryBullets.map((b) => b.trim()).filter(Boolean);
  if (bullets.length > 0) {
    parts.push(bullets.join(". "));
  }

  const body = input.body
    .split(/\n\n+/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join(" ");

  if (body) parts.push(body);

  return parts.join(". ").replace(/\.{2,}/g, ".").trim();
}

/** Split long copy into utterance-sized chunks (Chrome truncates single strings). */
export function chunkSpeechText(text: string, maxLen = 420): string[] {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [];

  const sentences = normalized.split(/(?<=[.!?…])\s+/u).filter(Boolean);
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    const next = current ? `${current} ${sentence}` : sentence;
    if (next.length > maxLen && current) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current = next;
    }
  }

  if (current.trim()) chunks.push(current.trim());

  if (chunks.length === 0 && normalized) return [normalized.slice(0, maxLen)];
  return chunks;
}
