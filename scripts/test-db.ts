import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const PASS = "✓"
const FAIL = "✗"

function check(label: string, condition: boolean, detail = "") {
  const icon = condition ? PASS : FAIL
  const suffix = detail ? `  (${detail})` : ""
  console.log(`  ${icon} ${label}${suffix}`)
  if (!condition) process.exitCode = 1
}

async function main() {
  console.log("━━━ Database verification ━━━\n")

  // ── Row counts ────────────────────────────────────────────────────────────
  const [userCount, itemTypeCount, itemCount, collectionCount, tagCount] =
    await Promise.all([
      prisma.user.count(),
      prisma.itemType.count(),
      prisma.item.count(),
      prisma.collection.count(),
      prisma.tag.count(),
    ])

  console.log("Row counts:")
  console.log(`  Users:       ${userCount}`)
  console.log(`  Item types:  ${itemTypeCount}`)
  console.log(`  Items:       ${itemCount}`)
  console.log(`  Collections: ${collectionCount}`)
  console.log(`  Tags:        ${tagCount}`)

  // ── User ──────────────────────────────────────────────────────────────────
  console.log("\nUser:")
  const user = await prisma.user.findUnique({
    where: { email: "emanuelhotea1@gmail.com" },
  })

  check("user exists", !!user)
  if (!user) { console.log("\nAborting — no user found."); return }

  check("name is set",          !!user.name,          user.name ?? "null")
  check("password is hashed",   !!user.password && user.password.startsWith("$2"), "bcrypt")
  check("emailVerified is set", !!user.emailVerified)
  check("isPro is true",        user.isPro)

  // ── Item types ────────────────────────────────────────────────────────────
  console.log("\nItem types:")
  const expectedSlugs = ["snippets", "prompts", "notes", "commands", "links", "files", "images"]
  const itemTypes = await prisma.itemType.findMany()
  const slugs = itemTypes.map((t) => t.slug)

  check("all 7 system types exist", itemTypes.length === 7, `${itemTypes.length}/7`)
  for (const slug of expectedSlugs) {
    check(`  ${slug}`, slugs.includes(slug))
  }

  // ── Collections ───────────────────────────────────────────────────────────
  console.log("\nCollections:")
  const expectedCollections = [
    "React Patterns",
    "AI Workflows",
    "DevOps",
    "Terminal Commands",
    "Design Resources",
  ]
  const collections = await prisma.collection.findMany({
    where: { userId: user.id },
    include: {
      items: { include: { item: { include: { itemType: true } } } },
    },
    orderBy: { createdAt: "asc" },
  })

  check("5 collections exist", collections.length === 5, `${collections.length}/5`)

  for (const name of expectedCollections) {
    const col = collections.find((c) => c.name === name)
    check(`  "${name}" exists`, !!col)
    if (col) {
      check(`    has items`, col.items.length > 0, `${col.items.length} item(s)`)
    }
  }

  // ── Items by type ─────────────────────────────────────────────────────────
  console.log("\nItems by type:")
  const items = await prisma.item.findMany({
    where: { userId: user.id },
    include: {
      itemType: true,
      tags: { include: { tag: true } },
      collections: { include: { collection: true } },
    },
    orderBy: { createdAt: "asc" },
  })

  const byType = items.reduce<Record<string, number>>((acc, item) => {
    const name = item.itemType.name
    acc[name] = (acc[name] ?? 0) + 1
    return acc
  }, {})

  for (const [type, count] of Object.entries(byType)) {
    console.log(`  ${type}: ${count}`)
  }

  check("snippets exist", (byType["Snippet"] ?? 0) > 0)
  check("prompts exist",  (byType["Prompt"]  ?? 0) > 0)
  check("commands exist", (byType["Command"] ?? 0) > 0)
  check("links exist",    (byType["Link"]    ?? 0) > 0)

  // ── Tags ──────────────────────────────────────────────────────────────────
  console.log("\nTags:")
  const dbTags = await prisma.tag.findMany({ where: { userId: user.id } })
  check("tags exist", dbTags.length > 0, `${dbTags.length} tag(s)`)

  const itemsWithTags = items.filter((i) => i.tags.length > 0)
  check("items have tags", itemsWithTags.length > 0, `${itemsWithTags.length}/${items.length} items tagged`)

  // ── Relations ─────────────────────────────────────────────────────────────
  console.log("\nRelations:")
  const itemsInCollections = items.filter((i) => i.collections.length > 0)
  check(
    "all items belong to a collection",
    itemsInCollections.length === items.length,
    `${itemsInCollections.length}/${items.length}`,
  )

  const pinnedItems = items.filter((i) => i.isPinned)
  const favoriteItems = items.filter((i) => i.isFavorite)
  check("pinned items exist",   pinnedItems.length > 0,   `${pinnedItems.length}`)
  check("favorite items exist", favoriteItems.length > 0, `${favoriteItems.length}`)

  // ── Full item listing ─────────────────────────────────────────────────────
  console.log("\nAll items:")
  for (const item of items) {
    const tagList = item.tags.map((t) => t.tag.name).join(", ")
    const colList = item.collections.map((c) => c.collection.name).join(", ")
    const flags = [item.isPinned && "pinned", item.isFavorite && "fav"].filter(Boolean).join(" ")
    console.log(`  [${item.itemType.name.padEnd(7)}] ${item.title}`)
    console.log(`             tags: ${tagList || "—"}`)
    console.log(`             col:  ${colList}${flags ? `  [${flags}]` : ""}`)
  }

  const passed = process.exitCode !== 1
  console.log(`\n━━━ ${passed ? "All checks passed" : "Some checks FAILED"} ━━━`)
}

main()
  .catch((e) => { console.error("Error:", e); process.exitCode = 1 })
  .finally(() => pool.end())
