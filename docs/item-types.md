# Item Types Reference

> Generated from `src/lib/item-types.ts`, `prisma/seed.ts`, and `context/project-overview.md`.

---

## Overview

Grimoire has 7 built-in system item types. All are defined as `isSystem: true` in the DB and cannot be deleted. Two are Pro-only (`file`, `image`). Each type maps to one of three **content kinds**: `TEXT`, `URL`, or `FILE`.

---

## Content Kind Classification

| Content Kind | Types                            | Stored in      |
| ------------ | -------------------------------- | -------------- |
| `TEXT`       | snippet, prompt, note, command   | `Item.content` |
| `URL`        | link                             | `Item.url`     |
| `FILE`       | file, image                      | `Item.fileUrl` |

---

## Per-Type Details

### Snippet

| Property     | Value                                         |
| ------------ | --------------------------------------------- |
| Slug         | `snippets`                                    |
| Icon         | `Code` (Lucide)                               |
| Color        | `#3b82f6` (Blue)                              |
| Content Kind | `TEXT`                                        |
| Pro Only     | No                                            |
| Route        | `/dashboard/items/snippets`                   |

**Purpose:** Store reusable code blocks — hooks, utilities, components, patterns. Supports syntax highlighting via `Item.language` (e.g., `"typescript"`, `"python"`).

**Key fields used:** `content`, `language`, `description`

---

### Prompt

| Property     | Value                                         |
| ------------ | --------------------------------------------- |
| Slug         | `prompts`                                     |
| Icon         | `Sparkles` (Lucide)                           |
| Color        | `#8b5cf6` (Purple)                            |
| Content Kind | `TEXT`                                        |
| Pro Only     | No                                            |
| Route        | `/dashboard/items/prompts`                    |

**Purpose:** Store AI prompts, system messages, and reusable instructions. Pro users get the Prompt Optimizer AI feature to improve these automatically.

**Key fields used:** `content`, `description`

---

### Note

| Property     | Value                                         |
| ------------ | --------------------------------------------- |
| Slug         | `notes`                                       |
| Icon         | `StickyNote` (Lucide)                         |
| Color        | `#fde047` (Yellow)                            |
| Content Kind | `TEXT`                                        |
| Pro Only     | No                                            |
| Route        | `/dashboard/items/notes`                      |

**Purpose:** Free-form markdown notes — documentation, explanations, checklists. Rendered with a markdown editor and syntax highlighting.

**Key fields used:** `content`, `description`

---

### Command

| Property     | Value                                         |
| ------------ | --------------------------------------------- |
| Slug         | `commands`                                    |
| Icon         | `Terminal` (Lucide)                           |
| Color        | `#f97316` (Orange)                            |
| Content Kind | `TEXT`                                        |
| Pro Only     | No                                            |
| Route        | `/dashboard/items/commands`                   |

**Purpose:** Terminal commands, shell scripts, CLI invocations. Stored as plain text; `language` is typically `"bash"` for syntax highlighting.

**Key fields used:** `content`, `language`, `description`

---

### Link

| Property     | Value                                         |
| ------------ | --------------------------------------------- |
| Slug         | `links`                                       |
| Icon         | `Link` (Lucide)                               |
| Color        | `#10b981` (Emerald)                           |
| Content Kind | `URL`                                         |
| Pro Only     | No                                            |
| Route        | `/dashboard/items/links`                      |

**Purpose:** Bookmark URLs — docs, references, tools, resources. The URL is stored in `Item.url` rather than `content`.

**Key fields used:** `url`, `description`

---

### File

| Property     | Value                                         |
| ------------ | --------------------------------------------- |
| Slug         | `files`                                       |
| Icon         | `File` (Lucide)                               |
| Color        | `#6b7280` (Gray)                              |
| Content Kind | `FILE`                                        |
| Pro Only     | **Yes**                                       |
| Route        | `/dashboard/items/files`                      |

**Purpose:** Upload arbitrary files (PDFs, ZIPs, context files, templates). Files go directly to Cloudflare R2 via a server-generated signed URL — never through the Next.js request body.

**Key fields used:** `fileUrl` (R2 URL), `fileName`, `fileSize`, `description`

---

### Image

| Property     | Value                                         |
| ------------ | --------------------------------------------- |
| Slug         | `images`                                      |
| Icon         | `Image` (Lucide)                              |
| Color        | `#ec4899` (Pink)                              |
| Content Kind | `FILE`                                        |
| Pro Only     | **Yes**                                       |
| Route        | `/dashboard/items/images`                     |

**Purpose:** Store screenshots, diagrams, design references, and other image assets. Same R2 upload flow as `file` type.

**Key fields used:** `fileUrl` (R2 URL), `fileName`, `fileSize`, `description`

---

## Shared Properties

All item types share these `Item` model fields regardless of content kind:

| Field         | Type       | Description                                          |
| ------------- | ---------- | ---------------------------------------------------- |
| `id`          | `String`   | CUID primary key                                     |
| `title`       | `String`   | Required display name                                |
| `description` | `String?`  | Optional short description                           |
| `isFavorite`  | `Boolean`  | Starred by user; surfaces in favorites feed          |
| `isPinned`    | `Boolean`  | Pinned items float to the top of their list          |
| `lastUsedAt`  | `DateTime?`| Updated on access; drives the "recently used" feed  |
| `createdAt`   | `DateTime` | Creation timestamp                                   |
| `updatedAt`   | `DateTime` | Last update timestamp                                |
| `userId`      | `String`   | Owner reference (cascade delete on user removal)     |
| `itemTypeId`  | `String`   | FK to `ItemType` record                              |
| `tags`        | relation   | Many-to-many via `TagsOnItems`                       |
| `collections` | relation   | Many-to-many via `ItemCollection`                    |

---

## Display Differences

| Type    | Sidebar badge | Card left border | Syntax highlight | Markdown render | Copy action | Open/download |
| ------- | ------------- | ---------------- | ---------------- | --------------- | ----------- | ------------- |
| snippet | Blue          | Blue             | Yes              | No              | Yes         | —             |
| prompt  | Purple        | Purple           | No               | No              | Yes         | —             |
| note    | Yellow        | Yellow           | Yes (code blocks)| Yes             | Yes         | —             |
| command | Orange        | Orange           | Yes (bash)       | No              | Yes         | —             |
| link    | Emerald       | Emerald          | No               | No              | URL copy    | Open URL      |
| file    | Gray + PRO    | Gray             | No               | No              | —           | Download      |
| image   | Pink + PRO    | Pink             | No               | No              | —           | View/download |

> Pro-only types (`file`, `image`) show a **PRO** badge in the sidebar and are gated in the UI for free-plan users.

---

## Code Reference

The canonical source of truth for item types in the codebase is [`src/lib/item-types.ts`](../src/lib/item-types.ts):

```ts
export const SYSTEM_ITEM_TYPES = [
  { name: "Snippet", slug: "snippets", icon: Code,      color: "#3b82f6", contentKind: "TEXT" },
  { name: "Prompt",  slug: "prompts",  icon: Sparkles,  color: "#8b5cf6", contentKind: "TEXT" },
  { name: "Note",    slug: "notes",    icon: StickyNote, color: "#fde047", contentKind: "TEXT" },
  { name: "Command", slug: "commands", icon: Terminal,   color: "#f97316", contentKind: "TEXT" },
  { name: "Link",    slug: "links",    icon: LinkIcon,   color: "#10b981", contentKind: "URL"  },
  { name: "File",    slug: "files",    icon: File,       color: "#6b7280", contentKind: "FILE", isPro: true },
  { name: "Image",   slug: "images",   icon: Image,      color: "#ec4899", contentKind: "FILE", isPro: true },
] as const;
```
