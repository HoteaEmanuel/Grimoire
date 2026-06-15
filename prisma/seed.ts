import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import bcrypt from "bcryptjs"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Seeding database...")

  // ── User ─────────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("12345678", 12)

  const seedEmail = process.env.SEED_USER_EMAIL
  if (!seedEmail) throw new Error("SEED_USER_EMAIL env var is required to run the seed")

  const user = await prisma.user.upsert({
    where: { email: seedEmail },
    update: { password: passwordHash, emailVerified: new Date(), isPro: true },
    create: {
      name: "Emanuel Hotea",
      email: seedEmail,
      password: passwordHash,
      emailVerified: new Date(),
      isPro: true,
    },
  })

  // Reset: delete all user-owned data so the seed is idempotent
  await prisma.item.deleteMany({ where: { userId: user.id } })
  await prisma.collection.deleteMany({ where: { userId: user.id } })
  await prisma.tag.deleteMany({ where: { userId: user.id } })

  // ── System Item Types ─────────────────────────────────────────────────────
  const typeData = [
    { name: "Snippet", slug: "snippets", icon: "Code",      color: "#3b82f6" },
    { name: "Prompt",  slug: "prompts",  icon: "Sparkles",  color: "#8b5cf6" },
    { name: "Note",    slug: "notes",    icon: "StickyNote", color: "#fde047" },
    { name: "Command", slug: "commands", icon: "Terminal",   color: "#f97316" },
    { name: "Link",    slug: "links",    icon: "Link",       color: "#10b981" },
    { name: "File",    slug: "files",    icon: "File",       color: "#6b7280" },
    { name: "Image",   slug: "images",   icon: "Image",      color: "#ec4899" },
  ]

  const types: Record<string, string> = {}
  for (const t of typeData) {
    const record = await prisma.itemType.upsert({
      where: { slug: t.slug },
      update: {},
      create: { ...t, isSystem: true },
    })
    types[t.slug] = record.id
  }

  // ── Tags ──────────────────────────────────────────────────────────────────
  const tagNames = [
    "react", "hooks", "context", "typescript", "generics",
    "next.js", "server-actions", "middleware",
    "docker", "ci-cd", "devops", "git", "bash", "npm",
    "tailwind", "css", "design", "icons",
    "ai", "prompts", "code-review", "documentation", "refactoring",
    "prisma", "database", "sql",
    "zod", "validation", "testing", "vitest",
  ]

  await prisma.tag.createMany({
    data: tagNames.map((name) => ({ name, userId: user.id })),
  })

  const tagRecords = await prisma.tag.findMany({
    where: { userId: user.id },
    select: { id: true, name: true },
  })
  const tags: Record<string, string> = Object.fromEntries(tagRecords.map((t) => [t.name, t.id]))

  // ── Helper ────────────────────────────────────────────────────────────────
  type ItemSeed = {
    title: string
    contentKind: "TEXT" | "URL"
    content?: string
    url?: string
    language?: string
    description?: string
    isFavorite?: boolean
    isPinned?: boolean
    lastUsedAt?: Date
    typeSlug: string
    tagKeys: string[]
  }

  async function createCollection(
    name: string,
    description: string,
    isFavorite: boolean,
    items: ItemSeed[],
  ) {
    const collection = await prisma.collection.create({
      data: { name, description, isFavorite, userId: user.id },
    })

    for (const item of items) {
      const { typeSlug, tagKeys, contentKind, ...rest } = item
      await prisma.item.create({
        data: {
          ...rest,
          contentKind,
          userId: user.id,
          itemTypeId: types[typeSlug],
          tags: { create: tagKeys.map((k) => ({ tagId: tags[k] })) },
          collections: { create: [{ collectionId: collection.id }] },
        },
      })
    }

    return collection
  }

  // ── React Patterns ────────────────────────────────────────────────────────
  await createCollection(
    "React Patterns",
    "Reusable React patterns and hooks",
    true,
    [
      {
        title: "useDebounce hook",
        contentKind: "TEXT",
        content: `import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}`,
        language: "typescript",
        description: "Delays updating a value until the user stops changing it",
        isFavorite: true,
        isPinned: false,
        lastUsedAt: new Date("2026-06-13T10:00:00Z"),
        typeSlug: "snippets",
        tagKeys: ["react", "hooks", "typescript"],
      },
      {
        title: "useLocalStorage hook",
        contentKind: "TEXT",
        content: `import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);

  useEffect(() => {
    const stored = localStorage.getItem(key);
    if (stored) setValue(JSON.parse(stored));
  }, [key]);

  const set = (val: T) => {
    setValue(val);
    localStorage.setItem(key, JSON.stringify(val));
  };

  return [value, set] as const;
}`,
        language: "typescript",
        description: "Syncs React state with localStorage",
        isFavorite: true,
        isPinned: false,
        lastUsedAt: new Date("2026-06-12T09:00:00Z"),
        typeSlug: "snippets",
        tagKeys: ["react", "hooks", "typescript"],
      },
      {
        title: "Context provider pattern",
        contentKind: "TEXT",
        content: `import { createContext, useContext, useState, ReactNode } from "react";

type ThemeContextValue = { theme: "light" | "dark"; toggle: () => void };

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}`,
        language: "typescript",
        description: "Type-safe Context + Provider + custom hook pattern",
        isFavorite: false,
        isPinned: false,
        lastUsedAt: new Date("2026-06-11T14:00:00Z"),
        typeSlug: "snippets",
        tagKeys: ["react", "context", "typescript"],
      },
    ],
  )

  // ── AI Workflows ──────────────────────────────────────────────────────────
  await createCollection(
    "AI Workflows",
    "AI prompts and workflow automations",
    true,
    [
      {
        title: "Senior dev code review",
        contentKind: "TEXT",
        content: "You are a senior software engineer. Review the following code for: correctness, security issues, performance problems, and maintainability. Be direct and specific. Point out what's good and what needs improvement.",
        description: "Thorough code review from a senior perspective",
        isFavorite: true,
        isPinned: true,
        lastUsedAt: new Date("2026-06-13T09:30:00Z"),
        typeSlug: "prompts",
        tagKeys: ["ai", "code-review", "prompts"],
      },
      {
        title: "Generate JSDoc documentation",
        contentKind: "TEXT",
        content: "Write JSDoc comments for the following TypeScript function. Include @param, @returns, @throws if applicable, and a one-line @description. Be concise — no filler, no restating the function name.",
        description: "Generate concise JSDoc for a TypeScript function",
        isFavorite: false,
        isPinned: false,
        lastUsedAt: new Date("2026-06-10T11:00:00Z"),
        typeSlug: "prompts",
        tagKeys: ["ai", "documentation", "typescript"],
      },
      {
        title: "Refactor for readability",
        contentKind: "TEXT",
        content: "Refactor the following code to improve readability and maintainability. Do not change the external behavior. Prefer: smaller functions, clear names, removing redundancy, and consistent patterns. Explain each change briefly.",
        description: "Structured refactoring prompt that preserves behavior",
        isFavorite: false,
        isPinned: false,
        lastUsedAt: new Date("2026-06-09T16:00:00Z"),
        typeSlug: "prompts",
        tagKeys: ["ai", "refactoring", "prompts"],
      },
    ],
  )

  // ── DevOps ────────────────────────────────────────────────────────────────
  await createCollection(
    "DevOps",
    "Infrastructure and deployment resources",
    false,
    [
      {
        title: "Docker Compose — Next.js + Postgres",
        contentKind: "TEXT",
        content: `version: "3.9"
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/app
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: app
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:`,
        language: "yaml",
        description: "Docker Compose setup for Next.js app with Postgres",
        isFavorite: false,
        isPinned: false,
        lastUsedAt: new Date("2026-06-08T10:00:00Z"),
        typeSlug: "snippets",
        tagKeys: ["docker", "devops", "ci-cd"],
      },
      {
        title: "Deploy to Vercel (CLI)",
        contentKind: "TEXT",
        content: `# production deploy
vercel --prod

# preview deploy
vercel

# set env variable
vercel env add DATABASE_URL production`,
        language: "bash",
        description: "Vercel CLI deploy commands",
        isFavorite: false,
        isPinned: false,
        lastUsedAt: new Date("2026-06-07T15:00:00Z"),
        typeSlug: "commands",
        tagKeys: ["devops", "ci-cd", "bash"],
      },
      {
        title: "Docker docs",
        contentKind: "URL",
        url: "https://docs.docker.com",
        description: "Official Docker documentation",
        isFavorite: false,
        isPinned: false,
        typeSlug: "links",
        tagKeys: ["docker", "devops"],
      },
      {
        title: "GitHub Actions docs",
        contentKind: "URL",
        url: "https://docs.github.com/en/actions",
        description: "GitHub Actions workflow documentation",
        isFavorite: false,
        isPinned: false,
        typeSlug: "links",
        tagKeys: ["ci-cd", "devops"],
      },
    ],
  )

  // ── Terminal Commands ─────────────────────────────────────────────────────
  await createCollection(
    "Terminal Commands",
    "Useful shell commands for everyday development",
    false,
    [
      {
        title: "git log pretty",
        contentKind: "TEXT",
        content: "git log --oneline --graph --decorate --all",
        language: "bash",
        description: "Visual branch graph in the terminal",
        isFavorite: true,
        isPinned: false,
        lastUsedAt: new Date("2026-06-13T08:30:00Z"),
        typeSlug: "commands",
        tagKeys: ["git", "bash"],
      },
      {
        title: "Docker full cleanup",
        contentKind: "TEXT",
        content: "docker system prune -a --volumes",
        language: "bash",
        description: "Remove all unused Docker resources including volumes",
        isFavorite: false,
        isPinned: false,
        lastUsedAt: new Date("2026-06-12T16:00:00Z"),
        typeSlug: "commands",
        tagKeys: ["docker", "bash"],
      },
      {
        title: "Kill process on port",
        contentKind: "TEXT",
        content: `# macOS / Linux
lsof -ti :3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F`,
        language: "bash",
        description: "Kill whatever is running on a specific port",
        isFavorite: true,
        isPinned: false,
        lastUsedAt: new Date("2026-06-11T17:00:00Z"),
        typeSlug: "commands",
        tagKeys: ["bash", "devops"],
      },
      {
        title: "Interactive dependency upgrade",
        contentKind: "TEXT",
        content: "npx npm-check-updates -i",
        language: "bash",
        description: "Interactively select which packages to upgrade",
        isFavorite: false,
        isPinned: false,
        lastUsedAt: new Date("2026-06-08T10:00:00Z"),
        typeSlug: "commands",
        tagKeys: ["npm", "bash"],
      },
    ],
  )

  // ── Design Resources ──────────────────────────────────────────────────────
  await createCollection(
    "Design Resources",
    "UI/UX resources and references",
    false,
    [
      {
        title: "Tailwind CSS docs",
        contentKind: "URL",
        url: "https://tailwindcss.com/docs",
        description: "Official Tailwind CSS documentation",
        isFavorite: true,
        isPinned: false,
        lastUsedAt: new Date("2026-06-13T07:00:00Z"),
        typeSlug: "links",
        tagKeys: ["tailwind", "css", "design"],
      },
      {
        title: "shadcn/ui components",
        contentKind: "URL",
        url: "https://ui.shadcn.com/docs/components",
        description: "shadcn/ui component library reference",
        isFavorite: true,
        isPinned: false,
        lastUsedAt: new Date("2026-06-12T11:00:00Z"),
        typeSlug: "links",
        tagKeys: ["react", "design", "css"],
      },
      {
        title: "Lucide icons",
        contentKind: "URL",
        url: "https://lucide.dev/icons",
        description: "Searchable Lucide icon library",
        isFavorite: false,
        isPinned: false,
        lastUsedAt: new Date("2026-06-10T09:00:00Z"),
        typeSlug: "links",
        tagKeys: ["icons", "design"],
      },
      {
        title: "Radix UI primitives",
        contentKind: "URL",
        url: "https://www.radix-ui.com/primitives/docs/overview/introduction",
        description: "Accessible, unstyled UI primitives for React",
        isFavorite: false,
        isPinned: false,
        typeSlug: "links",
        tagKeys: ["react", "design", "css"],
      },
    ],
  )

  const [itemCount, colCount, tagCount] = await Promise.all([
    prisma.item.count({ where: { userId: user.id } }),
    prisma.collection.count({ where: { userId: user.id } }),
    prisma.tag.count({ where: { userId: user.id } }),
  ])

  console.log(`Done: 1 user, ${typeData.length} item types, ${tagCount} tags, ${colCount} collections, ${itemCount} items`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => pool.end())
