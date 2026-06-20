import { z } from "zod";

export const generateAutoTagsSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  content: z.string().optional(),
});

export type GenerateAutoTagsInput = z.input<typeof generateAutoTagsSchema>;

export const generateDescriptionSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  content: z.string().optional(),
  url: z.string().optional(),
  fileName: z.string().optional(),
});

export type GenerateDescriptionInput = z.input<typeof generateDescriptionSchema>;
