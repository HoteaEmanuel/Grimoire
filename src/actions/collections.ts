"use server";

import {
  createCollection as dbCreateCollection,
  updateCollection as dbUpdateCollection,
  deleteCollection as dbDeleteCollection,
  toggleCollectionFavorite as dbToggleCollectionFavorite,
} from "@/lib/db/collections";
import type { CollectionWithMeta, CollectionDetail } from "@/lib/db/collections";
import { createCollectionSchema } from "@/lib/schemas/collections";
import { prisma } from "@/lib/prisma";
import { FREE_COLLECTION_LIMIT } from "@/lib/limits";
import { requireUserId, parseOrError } from "@/lib/auth-helpers";

export type { CreateCollectionInput } from "@/lib/schemas/collections";

type CreateCollectionResult =
  | { success: true; data: CollectionWithMeta }
  | { success: false; error: string };

export async function createCollection(
  formData: unknown,
): Promise<CreateCollectionResult> {
  const auth = await requireUserId();
  if (!auth.ok) {
    return { success: false, error: auth.error };
  }

  const parsed = parseOrError(createCollectionSchema, formData);
  if (!parsed.ok) {
    return { success: false, error: parsed.error };
  }

  if (!auth.isPro) {
    const collectionCount = await prisma.collection.count({ where: { userId: auth.userId } });
    if (collectionCount >= FREE_COLLECTION_LIMIT) {
      return { success: false, error: `Free plan is limited to ${FREE_COLLECTION_LIMIT} collections` };
    }
  }

  const created = await dbCreateCollection(auth.userId, {
    name: parsed.data.name,
    description: parsed.data.description ?? null,
  });

  if (!created) {
    return { success: false, error: "Failed to create collection" };
  }

  return { success: true, data: created };
}

type UpdateCollectionResult =
  | { success: true; data: CollectionDetail }
  | { success: false; error: string };

export async function updateCollection(
  collectionId: string,
  formData: unknown,
): Promise<UpdateCollectionResult> {
  const auth = await requireUserId();
  if (!auth.ok) {
    return { success: false, error: auth.error };
  }

  const parsed = parseOrError(createCollectionSchema, formData);
  if (!parsed.ok) {
    return { success: false, error: parsed.error };
  }

  const updated = await dbUpdateCollection(auth.userId, collectionId, {
    name: parsed.data.name,
    description: parsed.data.description ?? null,
  });

  if (!updated) {
    return { success: false, error: "Failed to update collection" };
  }

  return { success: true, data: updated };
}

type ToggleFavoriteResult = { success: true } | { success: false; error: string };

export async function toggleCollectionFavorite(
  collectionId: string,
  isFavorite: boolean,
): Promise<ToggleFavoriteResult> {
  const auth = await requireUserId();
  if (!auth.ok) {
    return { success: false, error: auth.error };
  }

  const updated = await dbToggleCollectionFavorite(auth.userId, collectionId, isFavorite);
  if (!updated) {
    return { success: false, error: "Failed to update favorite" };
  }

  return { success: true };
}

type DeleteCollectionResult = { success: true } | { success: false; error: string };

export async function deleteCollection(collectionId: string): Promise<DeleteCollectionResult> {
  const auth = await requireUserId();
  if (!auth.ok) {
    return { success: false, error: auth.error };
  }

  const deleted = await dbDeleteCollection(auth.userId, collectionId);
  if (!deleted) {
    return { success: false, error: "Collection not found" };
  }

  return { success: true };
}
