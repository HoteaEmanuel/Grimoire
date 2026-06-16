"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { updateItem as dbUpdateItem } from "@/lib/db/items";
import type { ItemDetail } from "@/lib/db/items";

const updateItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().nullable().optional(),
  content: z.string().nullable().optional(),
  url: z
    .string()
    .trim()
    .refine((v) => !v || URL.canParse(v), { message: "Must be a valid URL" })
    .nullable()
    .optional(),
  language: z.string().trim().nullable().optional(),
  tags: z.array(z.string().trim().min(1)).default([]),
});

export type UpdateItemInput = z.input<typeof updateItemSchema>;

type UpdateItemResult =
  | { success: true; data: ItemDetail }
  | { success: false; error: string };

export async function updateItem(
  itemId: string,
  formData: UpdateItemInput,
): Promise<UpdateItemResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = updateItemSchema.safeParse(formData);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { success: false, error: first?.message ?? "Invalid input" };
  }

  const data = {
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    content: parsed.data.content ?? null,
    url: parsed.data.url ?? null,
    language: parsed.data.language ?? null,
    tags: parsed.data.tags,
  };

  const updated = await dbUpdateItem(session.user.id, itemId, data);
  if (!updated) {
    return { success: false, error: "Failed to save changes" };
  }

  return { success: true, data: updated };
}
