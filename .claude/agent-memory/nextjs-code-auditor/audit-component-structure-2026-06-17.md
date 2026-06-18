---
name: audit-component-structure-2026-06-17
description: Component decomposition audit findings — ItemDrawer, CreateItemModal, DB layer mapper duplication, collections dominant-color logic
metadata:
  type: project
---

Audit run 2026-06-17 focused exclusively on component/function decomposition.

Key findings:

1. **ItemDrawer.tsx** — Two separate 60-80 line render blocks (view mode body, edit mode body) live inside a single component alongside fetch logic, mutation wiring, and copy/delete state. The edit-mode form fields and view-mode content display should each be extracted as sibling components. The inline IIFE for tag preview in edit mode (lines 308-354) is particularly awkward and should become a `<TagInput>` component (which is also duplicated in CreateItemModal).

2. **CreateItemModal.tsx** — The type selector pill row (lines 125-149) is a self-contained piece of UI that could be its own `<ItemTypeSelector>` component. The tag input + badge preview block (lines 264-292) is identical in intent to the drawer's tag editing; both should share a `<TagInput>` component living in `src/components/shared/TagInput.tsx`.

3. **items.ts DB layer** — The raw Prisma result -> `ItemWithMeta` map is copy-pasted identically across `getPinnedItems`, `getRecentItems`, and `getItemCardsByType` (lines 47-65, 97-115, 244-262). Should be extracted as a private `mapItemWithMeta(item)` helper. Same pattern for `ItemDetail` mapping: duplicated verbatim in `getItemById`, `updateItem`, and `createItem`.

4. **collections.ts** — The dominant-type-color calculation block is duplicated between `getRecentCollections` and `getSidebarCollections`. Should be a shared `computeDominantTypeColor(items)` helper.

5. **dashboard/page.tsx** and **items/[type]/page.tsx** — Both are clean and well-structured. No decomposition needed.

6. **SidebarContent.tsx** and **actions/items.ts** — Both are clean and appropriately sized.

**Confirmed correct patterns (do not re-flag):**
- `ItemsGrid.tsx` branching to ImageGridWithDrawer / FileListWithDrawer / ItemGridWithDrawer via if-chain is intentional and clean given only 3 branches.
- `DrawerSkeleton` and `toEditState` are already extracted helper functions within ItemDrawer — correct.
- `SLUG_TO_CONTENT_KIND` lookup map in items.ts is already the right pattern.
