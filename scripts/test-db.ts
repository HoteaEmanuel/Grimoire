import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Testing database connection...\n");

  const userCount = await prisma.user.count();
  const itemTypeCount = await prisma.itemType.count();
  const itemCount = await prisma.item.count();
  const collectionCount = await prisma.collection.count();
  const tagCount = await prisma.tag.count();

  console.log("Row counts:");
  console.log(`  Users:       ${userCount}`);
  console.log(`  Item types:  ${itemTypeCount}`);
  console.log(`  Items:       ${itemCount}`);
  console.log(`  Collections: ${collectionCount}`);
  console.log(`  Tags:        ${tagCount}`);

  const user = await prisma.user.findFirst({
    include: {
      items: {
        take: 3,
        orderBy: { createdAt: "desc" },
        include: { itemType: true, tags: { include: { tag: true } } },
      },
      collections: { take: 3 },
    },
  });

  if (!user) {
    console.log("\nNo users found.");
    return;
  }

  console.log(`\nUser: ${user.name} <${user.email}> isPro=${user.isPro}`);

  console.log("\nRecent items:");
  for (const item of user.items) {
    const tagList = item.tags.map((t) => t.tag.name).join(", ");
    console.log(
      `  [${item.itemType.name}] ${item.title}  tags: ${tagList || "—"}`,
    );
  }

  console.log("\nCollections:");
  for (const col of user.collections) {
    console.log(`  ${col.name}`);
  }

  console.log("\nDatabase connection OK.");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(() => pool.end());
