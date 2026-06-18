"use server";

import { auth } from "@/auth";
import { createCollection as dbCreateCollection } from "@/lib/db/collections";
import type { CollectionWithMeta } from "@/lib/db/collections";
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
