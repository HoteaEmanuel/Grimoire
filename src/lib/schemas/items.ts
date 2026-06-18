import { z } from "zod";

export const CREATE_TYPE_SLUGS = [
  "snippets",
  "prompts",
  "notes",
  "commands",
  "links",
  "files",
  "images",
] as const;

export const createItemSchema = z
  .object({
    typeSlug: z.enum(CREATE_TYPE_SLUGS),
    title: z.string().trim().min(1, "Title is required"),
    description: z.string().optional(),
    content: z.string().optional(),
    url: z.string().optional(),
    language: z.string().optional(),
    fileUrl: z.string().optional().nullable(),
    fileName: z.string().optional().nullable(),
    fileSize: z.number().int().positive().optional().nullable(),
    tags: z.array(z.string().trim().min(1)).default([]),
    collectionIds: z.array(z.string()).default([]),
  })
  .superRefine((data, ctx) => {
    if (data.typeSlug === "links") {
      if (!data.url?.trim()) {
        ctx.addIssue({ code: "custom", path: ["url"], message: "URL is required" });
      } else if (!URL.canParse(data.url.trim())) {
        ctx.addIssue({ code: "custom", path: ["url"], message: "Must be a valid URL" });
      }
    }
    if (data.typeSlug === "files" || data.typeSlug === "images") {
      if (!data.fileUrl) {
        ctx.addIssue({ code: "custom", path: ["fileUrl"], message: "File upload is required" });
      }
    }
  });

export type CreateItemInput = z.input<typeof createItemSchema>;
