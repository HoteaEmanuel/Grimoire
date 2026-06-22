"use server";

import { z } from "zod";
import {
  updateItem as dbUpdateItem,
  createItem as dbCreateItem,
  toggleItemFavorite as dbToggleItemFavorite,
  toggleItemPin as dbToggleItemPin,
} from "@/lib/db/items";
import { prisma } from "@/lib/prisma";
import { deleteR2Object, keyFromPublicUrl } from "@/lib/r2";
import type { ItemDetail } from "@/lib/db/items";
import { createItemSchema } from "@/lib/schemas/items";
import { FREE_ITEM_LIMIT } from "@/lib/limits";
import { requireUserId, parseOrError } from "@/lib/auth-helpers";

export type { CreateItemInput } from "@/lib/schemas/items";

type CreateItemResult =
  | { success: true; data: ItemDetail }
  | { success: false; error: string };

export async function createItem(formData: z.input<typeof createItemSchema>): Promise<CreateItemResult> {
  const auth = await requireUserId();
  if (!auth.ok) {
    return { success: false, error: auth.error };
  }

  const parsed = parseOrError(createItemSchema, formData);
  if (!parsed.ok) {
    return { success: false, error: parsed.error };
  }

  if (parsed.data.typeSlug === "links" && !parsed.data.url) {
    return { success: false, error: "URL is required for link items" };
  }

  const isFile = parsed.data.typeSlug === "files" || parsed.data.typeSlug === "images";
  if (isFile && !parsed.data.fileUrl) {
    return { success: false, error: "File upload is required" };
  }

  if (!auth.isPro) {
    if (isFile) {
      return { success: false, error: "Files and images are a Pro feature" };
    }
    const itemCount = await prisma.item.count({ where: { userId: auth.userId } });
    if (itemCount >= FREE_ITEM_LIMIT) {
      return { success: false, error: `Free plan is limited to ${FREE_ITEM_LIMIT} items` };
    }
  }

  const created = await dbCreateItem(auth.userId, {
    typeSlug: parsed.data.typeSlug,
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    content: parsed.data.content ?? null,
    url: parsed.data.url ?? null,
    language: parsed.data.language ?? null,
    tags: parsed.data.tags,
    fileUrl: parsed.data.fileUrl ?? null,
    fileName: parsed.data.fileName ?? null,
    fileSize: parsed.data.fileSize ?? null,
    collectionIds: parsed.data.collectionIds,
  });

  if (!created) {
    return { success: false, error: "Failed to create item" };
  }

  return { success: true, data: created };
}

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
  collectionIds: z.array(z.string()).default([]),
});

export type UpdateItemInput = z.input<typeof updateItemSchema>;

type UpdateItemResult =
  | { success: true; data: ItemDetail }
  | { success: false; error: string };

export async function updateItem(
  itemId: string,
  formData: UpdateItemInput,
): Promise<UpdateItemResult> {
  const auth = await requireUserId();
  if (!auth.ok) {
    return { success: false, error: auth.error };
  }

  const parsed = parseOrError(updateItemSchema, formData);
  if (!parsed.ok) {
    return { success: false, error: parsed.error };
  }

  const data = {
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    content: parsed.data.content ?? null,
    url: parsed.data.url ?? null,
    language: parsed.data.language ?? null,
    tags: parsed.data.tags,
    collectionIds: parsed.data.collectionIds,
  };

  const updated = await dbUpdateItem(auth.userId, itemId, data);
  if (!updated) {
    return { success: false, error: "Failed to save changes" };
  }

  return { success: true, data: updated };
}

type ToggleFavoriteResult = { success: true } | { success: false; error: string };

export async function toggleItemFavorite(
  itemId: string,
  isFavorite: boolean,
): Promise<ToggleFavoriteResult> {
  const auth = await requireUserId();
  if (!auth.ok) {
    return { success: false, error: auth.error };
  }

  const updated = await dbToggleItemFavorite(auth.userId, itemId, isFavorite);
  if (!updated) {
    return { success: false, error: "Failed to update favorite" };
  }

  return { success: true };
}

type TogglePinResult = { success: true } | { success: false; error: string };

export async function toggleItemPin(itemId: string, isPinned: boolean): Promise<TogglePinResult> {
  const auth = await requireUserId();
  if (!auth.ok) {
    return { success: false, error: auth.error };
  }

  const updated = await dbToggleItemPin(auth.userId, itemId, isPinned);
  if (!updated) {
    return { success: false, error: "Failed to update pin" };
  }

  return { success: true };
}

type DeleteItemResult = { success: true } | { success: false; error: string };

export async function deleteItem(itemId: string): Promise<DeleteItemResult> {
  const auth = await requireUserId();
  if (!auth.ok) {
    return { success: false, error: auth.error };
  }

  try {
    const item = await prisma.item.findFirst({
      where: { id: itemId, userId: auth.userId },
      select: { fileUrl: true },
    });

    if (!item) {
      return { success: false, error: "Item not found" };
    }

    const deleted = await prisma.item.deleteMany({
      where: { id: itemId, userId: auth.userId },
    });

    if (deleted.count === 0) {
      return { success: false, error: "Item not found" };
    }

    if (item.fileUrl) {
      try {
        const key = keyFromPublicUrl(item.fileUrl);
        await deleteR2Object(key);
      } catch {
        // R2 delete failure is non-fatal — item is already removed from DB
      }
    }

    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete item" };
  }
}
