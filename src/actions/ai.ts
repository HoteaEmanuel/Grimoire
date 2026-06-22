"use server";

import { openai, AI_MODEL } from "@/lib/openai";
import { checkAiRateLimit } from "@/lib/rate-limit";
import { requireUserId, parseOrError } from "@/lib/auth-helpers";
import {
  generateAutoTagsSchema,
  generateDescriptionSchema,
  explainCodeSchema,
  optimizePromptSchema,
  type GenerateAutoTagsInput,
  type GenerateDescriptionInput,
  type ExplainCodeInput,
  type OptimizePromptInput,
} from "@/lib/schemas/ai";

const MAX_CONTENT_LENGTH = 2000;
const TAG_RE = /^[a-z0-9_-]+$/;

const TAG_SUGGESTIONS_SCHEMA = {
  type: "json_schema" as const,
  name: "tag_suggestions",
  strict: true,
  schema: {
    type: "object",
    properties: {
      tags: { type: "array", items: { type: "string" }, maxItems: 5 },
    },
    required: ["tags"],
    additionalProperties: false,
  },
};

type GenerateAutoTagsResult =
  | { success: true; data: { tags: string[] } }
  | { success: false; error: string };

export async function generateAutoTags(
  input: GenerateAutoTagsInput,
): Promise<GenerateAutoTagsResult> {
  const auth = await requireUserId();
  if (!auth.ok) {
    return { success: false, error: auth.error };
  }

  if (!auth.isPro) {
    return { success: false, error: "AI tag suggestions are a Pro feature" };
  }

  const parsed = parseOrError(generateAutoTagsSchema, input);
  if (!parsed.ok) {
    return { success: false, error: parsed.error };
  }

  const rateLimit = await checkAiRateLimit(auth.userId);
  if (!rateLimit.ok) {
    return { success: false, error: rateLimit.error };
  }

  const truncatedContent = parsed.data.content?.slice(0, MAX_CONTENT_LENGTH) ?? "";

  try {
    const response = await openai.responses.create({
      model: AI_MODEL,
      instructions:
        "You are a tagging assistant for a developer knowledge-base app. Suggest 3 to 5 short, lowercase, freeform tags (single words or short hyphenated phrases) describing the topic, language, or purpose of the given item. Do not include the item's type as a tag.",
      input: `Title: ${parsed.data.title}\n\nContent:\n${truncatedContent}`,
      reasoning: { effort: "minimal" },
      text: { format: TAG_SUGGESTIONS_SCHEMA },
    });

    const output = JSON.parse(response.output_text) as { tags: string[] };
    const tags = output.tags
      .map((tag) => tag.trim().toLowerCase().replace(/\s+/g, "-"))
      .filter((tag) => TAG_RE.test(tag))
      .slice(0, 5);

    return { success: true, data: { tags } };
  } catch {
    return { success: false, error: "AI service is temporarily unavailable" };
  }
}

const DESCRIPTION_SCHEMA = {
  type: "json_schema" as const,
  name: "description_summary",
  strict: true,
  schema: {
    type: "object",
    properties: {
      summary: { type: "string" },
    },
    required: ["summary"],
    additionalProperties: false,
  },
};

type GenerateDescriptionResult =
  | { success: true; data: { summary: string } }
  | { success: false; error: string };

export async function generateDescription(
  input: GenerateDescriptionInput,
): Promise<GenerateDescriptionResult> {
  const auth = await requireUserId();
  if (!auth.ok) {
    return { success: false, error: auth.error };
  }

  if (!auth.isPro) {
    return { success: false, error: "AI descriptions are a Pro feature" };
  }

  const parsed = parseOrError(generateDescriptionSchema, input);
  if (!parsed.ok) {
    return { success: false, error: parsed.error };
  }

  const rateLimit = await checkAiRateLimit(auth.userId);
  if (!rateLimit.ok) {
    return { success: false, error: rateLimit.error };
  }

  const lines = [`Title: ${parsed.data.title}`];
  if (parsed.data.content) {
    lines.push(`Content:\n${parsed.data.content.slice(0, MAX_CONTENT_LENGTH)}`);
  }
  if (parsed.data.url) {
    lines.push(`URL: ${parsed.data.url}`);
  }
  if (parsed.data.fileName) {
    lines.push(`File name: ${parsed.data.fileName}`);
  }

  try {
    const response = await openai.responses.create({
      model: AI_MODEL,
      instructions:
        "You are a writing assistant for a developer knowledge-base app. Write a good, concise 1-2 sentence description summarizing the purpose or content of the given item, using whatever information is available. Do not restate the title verbatim.",
      input: lines.join("\n\n"),
      reasoning: { effort: "minimal" },
      text: { format: DESCRIPTION_SCHEMA },
    });

    const output = JSON.parse(response.output_text) as { summary: string };
    return { success: true, data: { summary: output.summary.trim() } };
  } catch {
    return { success: false, error: "AI service is temporarily unavailable" };
  }
}

const EXPLANATION_SCHEMA = {
  type: "json_schema" as const,
  name: "code_explanation",
  strict: true,
  schema: {
    type: "object",
    properties: {
      explanation: { type: "string" },
    },
    required: ["explanation"],
    additionalProperties: false,
  },
};

type ExplainCodeResult =
  | { success: true; data: { explanation: string } }
  | { success: false; error: string };

export async function explainCode(input: ExplainCodeInput): Promise<ExplainCodeResult> {
  const auth = await requireUserId();
  if (!auth.ok) {
    return { success: false, error: auth.error };
  }

  if (!auth.isPro) {
    return { success: false, error: "AI code explanations are a Pro feature" };
  }

  const parsed = parseOrError(explainCodeSchema, input);
  if (!parsed.ok) {
    return { success: false, error: parsed.error };
  }

  const rateLimit = await checkAiRateLimit(auth.userId);
  if (!rateLimit.ok) {
    return { success: false, error: rateLimit.error };
  }

  const truncatedCode = parsed.data.code.slice(0, MAX_CONTENT_LENGTH);
  const languageLine = parsed.data.language ? `Language: ${parsed.data.language}\n\n` : "";

  try {
    const response = await openai.responses.create({
      model: AI_MODEL,
      instructions:
        "You are a code-explanation assistant for a developer knowledge-base app. Explain what the given code or command does in plain English, in about 200-300 words, covering its purpose, key logic, and any notable concepts or gotchas. Use markdown formatting (e.g. backticks for identifiers, short lists where helpful). Do not repeat the full code verbatim.",
      input: `${languageLine}Code:\n${truncatedCode}`,
      reasoning: { effort: "minimal" },
      text: { format: EXPLANATION_SCHEMA },
    });

    const output = JSON.parse(response.output_text) as { explanation: string };
    return { success: true, data: { explanation: output.explanation.trim() } };
  } catch {
    return { success: false, error: "AI service is temporarily unavailable" };
  }
}

const PROMPT_OPTIMIZATION_SCHEMA = {
  type: "json_schema" as const,
  name: "prompt_optimization",
  strict: true,
  schema: {
    type: "object",
    properties: {
      optimized: { type: "string" },
    },
    required: ["optimized"],
    additionalProperties: false,
  },
};

type OptimizePromptResult =
  | { success: true; data: { optimized: string } }
  | { success: false; error: string };

export async function optimizePrompt(input: OptimizePromptInput): Promise<OptimizePromptResult> {
  const auth = await requireUserId();
  if (!auth.ok) {
    return { success: false, error: auth.error };
  }

  if (!auth.isPro) {
    return { success: false, error: "AI prompt optimization is a Pro feature" };
  }

  const parsed = parseOrError(optimizePromptSchema, input);
  if (!parsed.ok) {
    return { success: false, error: parsed.error };
  }

  const rateLimit = await checkAiRateLimit(auth.userId);
  if (!rateLimit.ok) {
    return { success: false, error: rateLimit.error };
  }

  const truncatedContent = parsed.data.content.slice(0, MAX_CONTENT_LENGTH);

  try {
    const response = await openai.responses.create({
      model: AI_MODEL,
      instructions:
        "You are a prompt-engineering assistant for a developer knowledge-base app. Rewrite the given AI prompt to be clearer, more specific, and more effective for an LLM to act on, while preserving its original intent. Return only the rewritten prompt text, with no preamble or explanation.",
      input: `Title: ${parsed.data.title}\n\nPrompt:\n${truncatedContent}`,
      reasoning: { effort: "minimal" },
      text: { format: PROMPT_OPTIMIZATION_SCHEMA },
    });

    const output = JSON.parse(response.output_text) as { optimized: string };
    return { success: true, data: { optimized: output.optimized.trim() } };
  } catch {
    return { success: false, error: "AI service is temporarily unavailable" };
  }
}
