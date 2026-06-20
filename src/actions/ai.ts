"use server";

import { auth } from "@/auth";
import { openai, AI_MODEL } from "@/lib/openai";
import { checkRateLimit, aiFeatureLimiter } from "@/lib/rate-limit";
import {
  generateAutoTagsSchema,
  generateDescriptionSchema,
  type GenerateAutoTagsInput,
  type GenerateDescriptionInput,
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
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  if (!session.user.isPro) {
    return { success: false, error: "AI tag suggestions are a Pro feature" };
  }

  const parsed = generateAutoTagsSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { success: false, error: first?.message ?? "Invalid input" };
  }

  const { success, retryAfter } = await checkRateLimit(aiFeatureLimiter, session.user.id);
  if (!success) {
    const minutes = Math.ceil(retryAfter / 60);
    return {
      success: false,
      error: `Too many AI requests. Try again in ${minutes} minute${minutes !== 1 ? "s" : ""}.`,
    };
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
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  if (!session.user.isPro) {
    return { success: false, error: "AI descriptions are a Pro feature" };
  }

  const parsed = generateDescriptionSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { success: false, error: first?.message ?? "Invalid input" };
  }

  const { success, retryAfter } = await checkRateLimit(aiFeatureLimiter, session.user.id);
  if (!success) {
    const minutes = Math.ceil(retryAfter / 60);
    return {
      success: false,
      error: `Too many AI requests. Try again in ${minutes} minute${minutes !== 1 ? "s" : ""}.`,
    };
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
