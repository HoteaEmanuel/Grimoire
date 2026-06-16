import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const KEEP_EMAIL = "emanuelhotea1@gmail.com"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const targets = await prisma.user.findMany({
    where: { email: { not: KEEP_EMAIL } },
    select: { id: true, email: true },
  })

  if (targets.length === 0) {
    console.log("No other users found — nothing to delete.")
    return
  }

  console.log(`Deleting ${targets.length} user(s):`)
  targets.forEach((u) => console.log(`  - ${u.email} (${u.id})`))

  const ids = targets.map((u) => u.id)

  // All cascade-dependent records are deleted first to avoid FK constraint errors.
  // Items own tags/collections via join tables with onDelete: Cascade, but we
  // delete explicitly here for clarity and to handle any non-cascading relations.
  await prisma.$transaction([
    prisma.tagsOnItems.deleteMany({ where: { item: { userId: { in: ids } } } }),
    prisma.itemCollection.deleteMany({ where: { item: { userId: { in: ids } } } }),
    prisma.item.deleteMany({ where: { userId: { in: ids } } }),
    prisma.collection.deleteMany({ where: { userId: { in: ids } } }),
    prisma.tag.deleteMany({ where: { userId: { in: ids } } }),
    prisma.itemType.deleteMany({ where: { userId: { in: ids } } }),
    prisma.verificationToken.deleteMany({ where: { identifier: { in: targets.map((u) => u.email) } } }),
    prisma.session.deleteMany({ where: { userId: { in: ids } } }),
    prisma.account.deleteMany({ where: { userId: { in: ids } } }),
    prisma.user.deleteMany({ where: { id: { in: ids } } }),
  ])

  console.log("Done.")
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => pool.end())
