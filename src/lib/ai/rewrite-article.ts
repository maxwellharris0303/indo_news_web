import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import type { AiRewriteProvider } from "@prisma/client";
import {
  buildRewritePrompt,
  parseRewriteJson,
  type RewriteOutput,
} from "@/lib/ai/rewrite-schema";

export type RewriteRequest = {
  provider: AiRewriteProvider;
  sourceTitle: string;
  sourceUrl: string;
  sourceName: string;
  body: string;
  locale: string;
};

export type RewriteResult =
  | { ok: true; output: RewriteOutput; model: string }
  | { ok: false; error: string };

function openAiModel(): string {
  return process.env.OPENAI_REWRITE_MODEL ?? "gpt-4o-mini";
}

function anthropicModel(): string {
  return process.env.ANTHROPIC_REWRITE_MODEL ?? "claude-3-5-haiku-latest";
}

async function rewriteWithOpenAI(
  prompt: string,
): Promise<{ text: string; model: string }> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY tidak diset");
  const client = new OpenAI({ apiKey: key });
  const model = openAiModel();
  const res = await client.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });
  const text = res.choices[0]?.message?.content;
  if (!text) throw new Error("OpenAI tidak mengembalikan konten");
  return { text, model };
}

async function rewriteWithAnthropic(
  prompt: string,
): Promise<{ text: string; model: string }> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY tidak diset");
  const client = new Anthropic({ apiKey: key });
  const model = anthropicModel();
  const res = await client.messages.create({
    model,
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });
  const block = res.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") {
    throw new Error("Anthropic tidak mengembalikan teks");
  }
  return { text: block.text, model };
}

export async function rewriteArticleFromSource(
  req: RewriteRequest,
): Promise<RewriteResult> {
  try {
    const prompt = buildRewritePrompt({
      sourceTitle: req.sourceTitle,
      sourceUrl: req.sourceUrl,
      sourceName: req.sourceName,
      body: req.body,
      locale: req.locale,
    });

    const { text, model } =
      req.provider === "ANTHROPIC"
        ? await rewriteWithAnthropic(prompt)
        : await rewriteWithOpenAI(prompt);

    const output = parseRewriteJson(text);
    return { ok: true, output, model };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Rewrite gagal",
    };
  }
}

export function aiProviderConfigured(provider: AiRewriteProvider): boolean {
  if (provider === "OPENAI") return Boolean(process.env.OPENAI_API_KEY);
  return Boolean(process.env.ANTHROPIC_API_KEY);
}
