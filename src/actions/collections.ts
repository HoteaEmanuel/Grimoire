"use server";

import { auth } from "@/auth";
import {
  createCollection as dbCreateCollection,
  updateCollection as dbUpdateCollection,
  deleteCollection as dbDeleteCollection,
  toggleCollectionFavorite as dbToggleCollectionFavorite,
} from "@/lib/db/collections";
import type { CollectionWithMeta, CollectionDetail } from "@/lib/db/collections";
import { createCollectionSchema } from "@/lib/schemas/collections";

export type { CreateCollectionInput } from "@/lib/schemas/collections";

type CreateCollectionResult =
  | { success: true; data: CollectionWithMeta }
  | { success: false; error: string };

export async function createCollection(
  formData: unknown,
): Promise<CreateCollectionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = createCollectionSchema.safeParse(formData);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { success: false, error: first?.message ?? "Invalid input" };
  }

  const created = await dbCreateCollection(session.user.id, {
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
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = createCollectionSchema.safeParse(formData);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { success: false, error: first?.message ?? "Invalid input" };
  }

  const updated = await dbUpdateCollection(session.user.id, collectionId, {
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
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const updated = await dbToggleCollectionFavorite(session.user.id, collectionId, isFavorite);
  if (!updated) {
    return { success: false, error: "Failed to update favorite" };
  }

  return { success: true };
}

type DeleteCollectionResult = { success: true } | { success: false; error: string };

export async function deleteCollection(collectionId: string): Promise<DeleteCollectionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const deleted = await dbDeleteCollection(session.user.id, collectionId);
  if (!deleted) {
    return { success: false, error: "Collection not found" };
  }

  return { success: true };
}
