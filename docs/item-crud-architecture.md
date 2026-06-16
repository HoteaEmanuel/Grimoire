# Item CRUD Architecture

> Design doc for the unified create / read / update / delete system for all 7 item types.

---

## Guiding Principles

- **Actions handle mutations; `lib/db` handles reads.** Server Actions are the only write path. Server components call `lib/db` functions directly — no API routes for item CRUD.
- **Actions are type-agnostic.** A single `createItem` action works for every type. Type-specific rendering logic belongs in components.
- **One dynamic route.** `/dashboard/items/[type]` serves all 7 type pages. The page component validates the slug and 404s on unknown types.
- **Drawer for create/edit.** No full-page navigation for item interactions — all CRUD surfaces in a slide-in drawer.

---

## File Structure

```
src/
├── actions/
│   └── items.ts                  # createItem, updateItem, deleteItem, toggleFavorite, togglePin
│
├── lib/
│   └── db/
│       └── items.ts              # getItemsByType, getItemById (add to existing file)
│                                 # existing: getPinnedItems, getRecentItems, getItemStats, getSidebarItemTypes
│
├── app/
│   └── dashboard/
│       └── items/
│           ├── page.tsx          # /dashboard/items — "All Items" view
│           └── [type]/
│               ├── page.tsx      # /dashboard/items/[type] — type-filtered view
│               └── loading.tsx   # skeleton while items load
│
├── components/
│   └── items/
│       ├── ItemsGrid.tsx         # responsive grid of ItemCards (client — handles open drawer)
│       ├── ItemCard.tsx          # single item card with type-colored left border
│       ├── ItemDrawer.tsx        # slide-in drawer (create or view/edit mode)
│       ├── ItemForm.tsx          # create/edit form; adapts fields by contentKind
│       ├── TypedContentInput.tsx # textarea | url input | file upload based on contentKind
│       └── ItemActions.tsx       # copy / edit / pin / delete action buttons
│
└── types/
    └── items.ts                  # ItemFull, ItemFormValues, ItemCreateInput types
```

---

## Routing: `/dashboard/items/[type]`

The `[type]` segment maps directly to `ItemType.slug` (`snippets`, `prompts`, `notes`, `commands`, `links`, `files`, `images`).

```ts
// src/app/dashboard/items/[type]/page.tsx
import { notFound } from "next/navigation"
import { SYSTEM_ITEM_TYPES } from "@/lib/item-types"
import { getItemsByType } from "@/lib/db/items"
import { getSession } from "@/lib/session"
import { ItemsGrid } from "@/components/items/ItemsGrid"

export default async function ItemTypePage({
  params,
}: {
  params: Promise<{ type: string }>
}) {
  const { type } = await params
  const typeDef = SYSTEM_ITEM_TYPES.find((t) => t.slug === type)
  if (!typeDef) notFound()

  const session = await getSession()
  const userId = session?.user?.id ?? ""

  const items = await getItemsByType(userId, type)

  return <ItemsGrid items={items} typeDef={typeDef} />
}
```

**URL → data flow:**

```
/dashboard/items/snippets
  → params.type = "snippets"
  → SYSTEM_ITEM_TYPES.find(t => t.slug === "snippets") → { name, color, icon, contentKind }
  → getItemsByType(userId, "snippets") → ItemFull[]
  → <ItemsGrid items={...} typeDef={...} />
```

---

## Data Fetching: `lib/db/items.ts` additions

```ts
// Add to existing src/lib/db/items.ts

export type ItemFull = {
  id: string
  title: string
  description: string | null
  contentKind: "TEXT" | "URL" | "FILE"
  content: string | null
  url: string | null
  fileUrl: string | null
  fileName: string | null
  fileSize: number | null
  language: string | null
  isFavorite: boolean
  isPinned: boolean
  lastUsedAt: Date | null
  createdAt: Date
  typeId: string
  typeName: string
  typeSlug: string
  typeColor: string
  typeIconName: string
  tags: string[]
  collections: { id: string; name: string }[]
}

export async function getItemsByType(userId: string, typeSlug: string): Promise<ItemFull[]> {
  try {
    const items = await prisma.item.findMany({
      where: { userId, itemType: { slug: typeSlug } },
      orderBy: [{ isPinned: "desc" }, { lastUsedAt: "desc" }, { createdAt: "desc" }],
      select: {
        id: true, title: true, description: true, contentKind: true,
        content: true, url: true, fileUrl: true, fileName: true, fileSize: true,
        language: true, isFavorite: true, isPinned: true, lastUsedAt: true, createdAt: true,
        itemType: { select: { id: true, name: true, slug: true, color: true, icon: true } },
        tags: { select: { tag: { select: { name: true } } } },
        collections: { select: { collection: { select: { id: true, name: true } } } },
      },
    })

    return items.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      contentKind: item.contentKind,
      content: item.content,
      url: item.url,
      fileUrl: item.fileUrl,
      fileName: item.fileName,
      fileSize: item.fileSize,
      language: item.language,
      isFavorite: item.isFavorite,
      isPinned: item.isPinned,
      lastUsedAt: item.lastUsedAt,
      createdAt: item.createdAt,
      typeId: item.itemType.id,
      typeName: item.itemType.name,
      typeSlug: item.itemType.slug,
      typeColor: item.itemType.color,
      typeIconName: item.itemType.icon,
      tags: item.tags.map((t) => t.tag.name),
      collections: item.collections.map((c) => ({ id: c.collection.id, name: c.collection.name })),
    }))
  } catch (err) {
    console.error("[getItemsByType]", err)
    return []
  }
}

export async function getItemById(userId: string, itemId: string): Promise<ItemFull | null> {
  try {
    const item = await prisma.item.findUnique({
      where: { id: itemId, userId },
      select: { /* same select as above */ },
    })
    if (!item) return null
    return { /* same mapping */ }
  } catch (err) {
    console.error("[getItemById]", err)
    return null
  }
}
```

**Ordering:** pinned items float to top (`isPinned: "desc"`), then most recently used, then creation date. This matches the micro-interaction spec.

---

## Mutations: `src/actions/items.ts`

All mutations are Server Actions. They:

1. Resolve `userId` from the session — no client-supplied user IDs.
2. Validate input with Zod.
3. Return `{ success, data?, error }`.
4. Call `revalidatePath` so the page re-fetches after mutation.

```ts
"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

// ── Schemas ────────────────────────────────────────────────────────────────

const TextItemSchema = z.object({
  title: z.string().min(1).max(255),
  contentKind: z.literal("TEXT"),
  content: z.string().min(1),
  language: z.string().optional(),
  description: z.string().max(500).optional(),
  tags: z.array(z.string()).optional(),
  collectionIds: z.array(z.string()).optional(),
})

const UrlItemSchema = z.object({
  title: z.string().min(1).max(255),
  contentKind: z.literal("URL"),
  url: z.string().url(),
  description: z.string().max(500).optional(),
  tags: z.array(z.string()).optional(),
  collectionIds: z.array(z.string()).optional(),
})

const FileItemSchema = z.object({
  title: z.string().min(1).max(255),
  contentKind: z.literal("FILE"),
  fileUrl: z.string().url(),
  fileName: z.string(),
  fileSize: z.number().int().positive(),
  description: z.string().max(500).optional(),
  tags: z.array(z.string()).optional(),
  collectionIds: z.array(z.string()).optional(),
})

const CreateItemSchema = z.discriminatedUnion("contentKind", [
  TextItemSchema,
  UrlItemSchema,
  FileItemSchema,
]).and(z.object({ itemTypeId: z.string() }))

// ── Helpers ────────────────────────────────────────────────────────────────

async function resolveTagIds(userId: string, tagNames: string[]): Promise<string[]> {
  if (!tagNames.length) return []
  // upsert each tag (unique per user)
  const ops = tagNames.map((name) =>
    prisma.tag.upsert({
      where: { name_userId: { name, userId } },
      create: { name, userId },
      update: {},
      select: { id: true },
    })
  )
  const tags = await prisma.$transaction(ops)
  return tags.map((t) => t.id)
}

// ── Actions ────────────────────────────────────────────────────────────────

export async function createItem(input: unknown) {
  const session = await getSession()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }
  const userId = session.user.id

  const parsed = CreateItemSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.flatten() }

  const { tags = [], collectionIds = [], itemTypeId, ...data } = parsed.data

  const tagIds = await resolveTagIds(userId, tags)

  const item = await prisma.item.create({
    data: {
      ...data,
      userId,
      itemTypeId,
      tags: { create: tagIds.map((tagId) => ({ tagId })) },
      collections: { create: collectionIds.map((collectionId) => ({ collectionId })) },
    },
  })

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/items")
  return { success: true, data: item }
}

export async function updateItem(itemId: string, input: unknown) {
  const session = await getSession()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }
  const userId = session.user.id

  // verify ownership
  const existing = await prisma.item.findUnique({ where: { id: itemId, userId } })
  if (!existing) return { success: false, error: "Not found" }

  const UpdateItemSchema = z.object({
    title: z.string().min(1).max(255).optional(),
    content: z.string().optional(),
    url: z.string().url().optional(),
    fileUrl: z.string().url().optional(),
    fileName: z.string().optional(),
    fileSize: z.number().int().positive().optional(),
    language: z.string().optional(),
    description: z.string().max(500).optional(),
    tags: z.array(z.string()).optional(),
    collectionIds: z.array(z.string()).optional(),
  })

  const parsed = UpdateItemSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.flatten() }

  const { tags, collectionIds, ...data } = parsed.data

  await prisma.$transaction(async (tx) => {
    await tx.item.update({ where: { id: itemId }, data })

    if (tags !== undefined) {
      const tagIds = await resolveTagIds(userId, tags)
      await tx.tagsOnItems.deleteMany({ where: { itemId } })
      if (tagIds.length) {
        await tx.tagsOnItems.createMany({ data: tagIds.map((tagId) => ({ itemId, tagId })) })
      }
    }

    if (collectionIds !== undefined) {
      await tx.itemCollection.deleteMany({ where: { itemId } })
      if (collectionIds.length) {
        await tx.itemCollection.createMany({
          data: collectionIds.map((collectionId) => ({ itemId, collectionId })),
        })
      }
    }
  })

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/items")
  return { success: true }
}

export async function deleteItem(itemId: string) {
  const session = await getSession()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }
  const userId = session.user.id

  const existing = await prisma.item.findUnique({ where: { id: itemId, userId } })
  if (!existing) return { success: false, error: "Not found" }

  // TODO: if contentKind === "FILE", delete from R2 before removing DB record

  await prisma.item.delete({ where: { id: itemId } })

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/items")
  return { success: true }
}

export async function toggleFavorite(itemId: string) {
  const session = await getSession()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }
  const userId = session.user.id

  const item = await prisma.item.findUnique({ where: { id: itemId, userId }, select: { isFavorite: true } })
  if (!item) return { success: false, error: "Not found" }

  await prisma.item.update({ where: { id: itemId }, data: { isFavorite: !item.isFavorite } })

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/items")
  return { success: true }
}

export async function togglePin(itemId: string) {
  const session = await getSession()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }
  const userId = session.user.id

  const item = await prisma.item.findUnique({ where: { id: itemId, userId }, select: { isPinned: true } })
  if (!item) return { success: false, error: "Not found" }

  await prisma.item.update({ where: { id: itemId }, data: { isPinned: !item.isPinned } })

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/items")
  return { success: true }
}

export async function touchItem(itemId: string) {
  // Called when a user copies/opens an item to update the "recently used" feed
  const session = await getSession()
  if (!session?.user?.id) return
  const userId = session.user.id

  await prisma.item.updateMany({
    where: { id: itemId, userId },
    data: { lastUsedAt: new Date() },
  })
  revalidatePath("/dashboard")
}
```

---

## Type-Specific Logic: Where It Lives

**Actions are type-agnostic.** They switch on `contentKind` (`TEXT | URL | FILE`) — not on the slug. The slug is only used for routing and display.

Type-specific logic lives exclusively in components:

| Decision | Lives in |
| -------- | -------- |
| Which input field to show | `TypedContentInput` (switches on `contentKind`) |
| Whether to show language selector | `ItemForm` (only when `contentKind === "TEXT"`) |
| Whether to show file upload | `TypedContentInput` (only when `contentKind === "FILE"`) |
| Syntax highlighting language | `ItemCard` / `ItemDrawer` (reads `item.language`) |
| Markdown rendering | `ItemDrawer` (checks `item.typeSlug === "notes"`) |
| "Open URL" vs "Copy" vs "Download" | `ItemActions` (switches on `contentKind`) |
| Card left border color | `ItemCard` (reads `item.typeColor`) |

---

## Component Responsibilities

### `ItemsGrid` (client component)

- Receives `ItemFull[]` and `typeDef` as props from the server page
- Renders a responsive grid of `ItemCard` components
- Holds open/edit drawer state (`useState<ItemFull | null>`)
- Renders "New Item" button that opens drawer in create mode
- Passes `onOpen`, `onEdit`, `onDelete` callbacks down to cards

```tsx
"use client"

export function ItemsGrid({ items, typeDef }: { items: ItemFull[], typeDef: ... }) {
  const [selectedItem, setSelectedItem] = useState<ItemFull | null>(null)
  const [drawerMode, setDrawerMode] = useState<"view" | "create" | "edit">("view")

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} onOpen={() => { setSelectedItem(item); setDrawerMode("view") }} />
        ))}
      </div>
      <ItemDrawer
        mode={drawerMode}
        item={selectedItem}
        typeDef={typeDef}
        onClose={() => setSelectedItem(null)}
      />
    </>
  )
}
```

### `ItemCard` (client component)

- Displays title, description, tags, type badge
- Left border colored with `item.typeColor`
- Favorite star and pin indicator
- Click opens `ItemDrawer` in view mode
- Edit/delete are in the drawer, not the card (keeps cards clean)

### `ItemDrawer` (client component)

- Slide-in panel from the right (`transform transition-transform`)
- Three modes: `view`, `create`, `edit`
- **View mode:** Renders content based on `contentKind` (code block, URL link, file download), tags, collections, `ItemActions`
- **Create/Edit mode:** Renders `ItemForm`
- Calls Server Actions on submit, shows toasts on success/error

### `ItemForm` (client component)

- `react-hook-form` + Zod for validation
- `typeDef.contentKind` determines which fields render:
  - `TEXT` → `TypedContentInput` (textarea), optional `language` selector
  - `URL` → `TypedContentInput` (url input)
  - `FILE` → `TypedContentInput` (file upload → R2 flow)
- Tag input with autocomplete (create new tags on the fly)
- Collection multi-select
- On submit: calls `createItem` or `updateItem` Server Action

### `TypedContentInput` (client component)

Renders the correct input for each content kind:

```tsx
export function TypedContentInput({ contentKind, ...props }) {
  if (contentKind === "TEXT") return <CodeEditor {...props} />
  if (contentKind === "URL")  return <input type="url" {...props} />
  if (contentKind === "FILE") return <FileUpload onUpload={props.onFileUploaded} />
}
```

### `ItemActions` (client component)

Action buttons shown in the drawer footer:

| Action   | `TEXT`       | `URL`          | `FILE`         |
| -------- | ------------ | -------------- | -------------- |
| Primary  | Copy content | Open URL       | Download       |
| Edit     | ✓            | ✓              | ✓ (title/tags) |
| Pin      | ✓            | ✓              | ✓              |
| Favorite | ✓            | ✓              | ✓              |
| Delete   | ✓            | ✓              | ✓              |

---

## FILE Type: R2 Upload Flow

File and image items require a two-step upload before the item record is created:

```
Client                        Server (API Route)           Cloudflare R2
  │                                  │                           │
  │ POST /api/upload                 │                           │
  │ { fileName, fileType, fileSize } │                           │
  │ ──────────────────────────────►  │                           │
  │                                  │  generatePresignedUrl()   │
  │                                  │ ────────────────────────► │
  │                                  │ ◄──── { signedUrl, key }  │
  │  ◄── { signedUrl, fileUrl }      │                           │
  │                                  │                           │
  │ PUT signedUrl (direct upload)    │                           │
  │ ──────────────────────────────────────────────────────────►  │
  │ ◄──────────────────────── 200 OK ─────────────────────────── │
  │                                  │                           │
  │ createItem({ contentKind: "FILE", fileUrl, fileName, ... })  │
  │ ──────────────────────────────►  │                           │
```

`TypedContentInput` for FILE kind manages this flow internally — the parent `ItemForm` only sees the resolved `fileUrl`, `fileName`, and `fileSize` values after upload completes.

---

## Tag Resolution

Tags are scoped per user (`@@unique([name, userId])`). The `resolveTagIds` helper in `actions/items.ts` upserts each tag name, so:

- Typing an existing tag name → reuses the existing `Tag` record
- Typing a new tag name → creates a new `Tag` record for the user
- Deleting a tag from an item → removes the `TagsOnItems` join row only (the `Tag` record stays; it may be used by other items)

---

## `revalidatePath` Strategy

After any mutation, invalidate:

| Path | Reason |
|---|---|
| `/dashboard` | Stats cards (total items, favorites) |
| `/dashboard/items` | All items view |
| `/dashboard/items/[type]` | Type-filtered view |

The sidebar item counts are fetched in `DashboardLayout` and re-render automatically once the paths above are revalidated, since the layout is a server component.

---

## Zod Schema for Client-Side Validation

Mirror the action schemas on the client so `react-hook-form` validation runs before the Server Action call:

```ts
// src/lib/schemas/items.ts

export const TextItemFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  content: z.string().min(1, "Content is required"),
  language: z.string().optional(),
  description: z.string().max(500).optional(),
  tags: z.array(z.string()).default([]),
  collectionIds: z.array(z.string()).default([]),
})

export const UrlItemFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  url: z.string().url("Must be a valid URL"),
  description: z.string().max(500).optional(),
  tags: z.array(z.string()).default([]),
  collectionIds: z.array(z.string()).default([]),
})

export const FileItemFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  fileUrl: z.string().url(),
  fileName: z.string(),
  fileSize: z.number().positive(),
  description: z.string().max(500).optional(),
  tags: z.array(z.string()).default([]),
  collectionIds: z.array(z.string()).default([]),
})
```

`ItemForm` picks the correct schema based on `typeDef.contentKind`.

---

## Summary

| Layer | File | Responsibility |
|---|---|---|
| Route | `app/dashboard/items/[type]/page.tsx` | Validate slug, fetch items, render grid |
| Query | `lib/db/items.ts` | `getItemsByType`, `getItemById` |
| Mutation | `actions/items.ts` | `createItem`, `updateItem`, `deleteItem`, `toggleFavorite`, `togglePin`, `touchItem` |
| Grid | `components/items/ItemsGrid.tsx` | Layout, drawer state |
| Card | `components/items/ItemCard.tsx` | Display, open drawer |
| Drawer | `components/items/ItemDrawer.tsx` | View / create / edit modes |
| Form | `components/items/ItemForm.tsx` | Field layout, validation, action call |
| Input | `components/items/TypedContentInput.tsx` | Content field adapts to contentKind |
| Actions | `components/items/ItemActions.tsx` | Copy / open / download / pin / delete |
| Schemas | `lib/schemas/items.ts` | Shared Zod schemas (client + server) |
