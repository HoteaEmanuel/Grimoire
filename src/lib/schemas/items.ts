import { z } from "zod";

export const CREATE_TYPE_SLUGS = [
  "snippets",
  "prompts",
  "notes",
  "commands",
  "links",
] as const;

export const createItemSchema = z
  .object({
    typeSlug: z.enum(CREATE_TYPE_SLUGS),
    title: z.string().trim().min(1, "Title is required"),
    description: z.string().optional(),
    content: z.string().optional(),
    url: z.string().optional(),
    language: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.typeSlug === "links") {
      if (!data.url?.trim()) {
        ctx.addIssue({ code: "custom", path: ["url"], message: "URL is required" });
      } else if (!URL.canParse(data.url.trim())) {
        ctx.addIssue({ code: "custom", path: ["url"], message: "Must be a valid URL" });
      }
    }
  });

export type CreateItemInput = z.infer<typeof createItemSchema>;
