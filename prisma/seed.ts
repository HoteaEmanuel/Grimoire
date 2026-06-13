import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Seeding database...")

  // ── User ────────────────────────────────────────────────────────────────
  const user = await prisma.user.upsert({
    where: { email: "emanuelhotea1@gmail.com" },
    update: {},
    create: {
      name: "Emanuel Hotea",
      email: "emanuelhotea1@gmail.com",
      isPro: true,
    },
  })

  // ── System Item Types ────────────────────────────────────────────────────
  const typeData = [
    { name: "Snippet", slug: "snippets", icon: "Code",       color: "#3b82f6" },
    { name: "Prompt",  slug: "prompts",  icon: "Sparkles",   color: "#8b5cf6" },
    { name: "Note",    slug: "notes",    icon: "StickyNote",  color: "#fde047" },
    { name: "Command", slug: "commands", icon: "Terminal",    color: "#f97316" },
    { name: "Link",    slug: "links",    icon: "Link",        color: "#10b981" },
    { name: "File",    slug: "files",    icon: "File",        color: "#6b7280" },
    { name: "Image",   slug: "images",  icon: "Image",       color: "#ec4899" },
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

  // ── Tags ─────────────────────────────────────────────────────────────────
  const tagNames = [
    "react", "hooks", "localStorage", "typescript", "generics", "utility-types",
    "next.js", "server-actions", "api-routes", "python", "scripting",
    "ai", "code-review", "learning", "prompts", "debugging",
    "git", "docker", "devops", "bash", "npm",
    "tailwind", "css", "docs", "conventions", "api",
    "prisma", "database", "performance", "security",
  ]

  const tags: Record<string, string> = {}
  for (const name of tagNames) {
    const record = await prisma.tag.upsert({
      where: { name_userId: { name, userId: user.id } },
      update: {},
      create: { name, userId: user.id },
    })
    tags[name] = record.id
  }

  // ── Collections ──────────────────────────────────────────────────────────
  const collectionData = [
    {
      key: "react",
      name: "React Patterns",
      description: "Reusable React hooks, patterns, and component templates",
      isFavorite: true,
    },
    {
      key: "ai-prompts",
      name: "AI Prompts",
      description: "Curated prompts for coding, review, and learning",
      isFavorite: true,
    },
    {
      key: "devops",
      name: "DevOps Commands",
      description: "Docker, git, and shell commands I always forget",
      isFavorite: false,
    },
    {
      key: "typescript",
      name: "TypeScript Utils",
      description: "Utility types, type guards, and generic patterns",
      isFavorite: true,
    },
    {
      key: "nextjs",
      name: "Next.js Patterns",
      description: "App Router patterns, server actions, and API routes",
      isFavorite: false,
    },
    {
      key: "python",
      name: "Python Scripts",
      description: "Handy Python snippets and one-liners",
      isFavorite: false,
    },
    {
      key: "resources",
      name: "Resources & Docs",
      description: "Essential documentation and reference links",
      isFavorite: false,
    },
  ]

  const cols: Record<string, string> = {}
  for (const c of collectionData) {
    const { key, ...data } = c
    const record = await prisma.collection.create({
      data: { ...data, userId: user.id },
    })
    cols[key] = record.id
  }

  // ── Items ────────────────────────────────────────────────────────────────
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
    collectionKeys: string[]
  }

  const items: ItemSeed[] = [
    // ── Snippets ────────────────────────────────────────────────────────
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
      description: "Custom hook for syncing state with localStorage",
      isFavorite: true,
      isPinned: false,
      lastUsedAt: new Date("2026-06-13T10:00:00Z"),
      typeSlug: "snippets",
      tagKeys: ["react", "hooks", "localStorage"],
      collectionKeys: ["react"],
    },
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
      description: "Delays updating a value until the user stops typing",
      isFavorite: false,
      isPinned: false,
      lastUsedAt: new Date("2026-06-12T09:00:00Z"),
      typeSlug: "snippets",
      tagKeys: ["react", "hooks", "performance"],
      collectionKeys: ["react"],
    },
    {
      title: "useClickOutside hook",
      contentKind: "TEXT",
      content: `import { useEffect, RefObject } from "react";

export function useClickOutside(ref: RefObject<HTMLElement>, handler: () => void) {
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      handler();
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
}`,
      language: "typescript",
      description: "Fires a callback when clicking outside a referenced element",
      isFavorite: false,
      isPinned: false,
      lastUsedAt: new Date("2026-06-10T11:00:00Z"),
      typeSlug: "snippets",
      tagKeys: ["react", "hooks"],
      collectionKeys: ["react"],
    },
    {
      title: "Prisma find with relations",
      contentKind: "TEXT",
      content: `const user = await prisma.user.findUnique({
  where: { id },
  include: {
    items: { include: { itemType: true, tags: { include: { tag: true } } } },
    collections: true,
  },
});`,
      language: "typescript",
      description: "Prisma query with nested includes",
      isFavorite: true,
      isPinned: false,
      lastUsedAt: new Date("2026-06-08T13:00:00Z"),
      typeSlug: "snippets",
      tagKeys: ["prisma", "database", "typescript"],
      collectionKeys: ["react", "ai-prompts"],
    },
    {
      title: "TypeScript DeepPartial",
      contentKind: "TEXT",
      content: `type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;`,
      language: "typescript",
      description: "Recursively makes all properties optional",
      isFavorite: true,
      isPinned: false,
      lastUsedAt: new Date("2026-06-11T14:00:00Z"),
      typeSlug: "snippets",
      tagKeys: ["typescript", "generics", "utility-types"],
      collectionKeys: ["typescript"],
    },
    {
      title: "TypeScript NonNullable keys",
      contentKind: "TEXT",
      content: `type NonNullableFields<T> = {
  [K in keyof T]-?: NonNullable<T[K]>;
};`,
      language: "typescript",
      description: "Removes null and undefined from all fields in a type",
      isFavorite: false,
      isPinned: false,
      lastUsedAt: new Date("2026-06-09T10:00:00Z"),
      typeSlug: "snippets",
      tagKeys: ["typescript", "generics", "utility-types"],
      collectionKeys: ["typescript"],
    },
    {
      title: "Next.js Server Action pattern",
      contentKind: "TEXT",
      content: `"use server";
import { z } from "zod";

const schema = z.object({ title: z.string().min(1) });

export async function createItem(formData: FormData) {
  const parsed = schema.safeParse({ title: formData.get("title") });
  if (!parsed.success) return { success: false, error: parsed.error.flatten() };

  // db call here

  return { success: true };
}`,
      language: "typescript",
      description: "Server Action with Zod validation and standard return shape",
      isFavorite: true,
      isPinned: true,
      lastUsedAt: new Date("2026-06-13T08:00:00Z"),
      typeSlug: "snippets",
      tagKeys: ["next.js", "server-actions", "typescript"],
      collectionKeys: ["nextjs"],
    },
    {
      title: "Next.js API route with error handling",
      contentKind: "TEXT",
      content: `import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const data = await fetchSomething();
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}`,
      language: "typescript",
      description: "API route with try/catch and consistent response shape",
      isFavorite: false,
      isPinned: false,
      lastUsedAt: new Date("2026-06-07T09:00:00Z"),
      typeSlug: "snippets",
      tagKeys: ["next.js", "api-routes", "typescript"],
      collectionKeys: ["nextjs"],
    },
    {
      title: "Python list comprehension patterns",
      contentKind: "TEXT",
      content: `# filter + map
evens_squared = [x**2 for x in range(20) if x % 2 == 0]

# flatten nested list
flat = [item for sub in nested for item in sub]

# dict comprehension
word_lengths = {word: len(word) for word in words}

# set comprehension
unique_lengths = {len(word) for word in words}`,
      language: "python",
      description: "Common list, dict, and set comprehension patterns",
      isFavorite: false,
      isPinned: false,
      lastUsedAt: new Date("2026-06-06T15:00:00Z"),
      typeSlug: "snippets",
      tagKeys: ["python", "scripting"],
      collectionKeys: ["python"],
    },
    {
      title: "Python retry decorator",
      contentKind: "TEXT",
      content: `import time
import functools

def retry(times=3, delay=1.0):
    def decorator(fn):
        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            for attempt in range(times):
                try:
                    return fn(*args, **kwargs)
                except Exception as e:
                    if attempt == times - 1:
                        raise
                    time.sleep(delay)
        return wrapper
    return decorator

@retry(times=3, delay=0.5)
def fetch_data(url: str):
    ...`,
      language: "python",
      description: "Decorator that retries a function on failure",
      isFavorite: true,
      isPinned: false,
      lastUsedAt: new Date("2026-06-05T10:00:00Z"),
      typeSlug: "snippets",
      tagKeys: ["python", "scripting", "api"],
      collectionKeys: ["python"],
    },

    // ── Prompts ─────────────────────────────────────────────────────────
    {
      title: "Senior dev code review prompt",
      contentKind: "TEXT",
      content: "You are a senior software engineer. Review the following code for: correctness, security issues, performance problems, and maintainability. Be direct and specific. Point out what's good and what needs improvement.",
      description: "Prompt for AI code review",
      isFavorite: true,
      isPinned: true,
      lastUsedAt: new Date("2026-06-13T09:30:00Z"),
      typeSlug: "prompts",
      tagKeys: ["ai", "code-review"],
      collectionKeys: ["ai-prompts"],
    },
    {
      title: "Explain like I'm a junior dev",
      contentKind: "TEXT",
      content: "Explain the following concept as if I am a junior developer with 1 year of experience. Use simple analogies, avoid jargon, and give a concrete example.",
      description: "Teaching-style explanation prompt",
      isFavorite: false,
      isPinned: false,
      lastUsedAt: new Date("2026-06-07T10:00:00Z"),
      typeSlug: "prompts",
      tagKeys: ["ai", "learning"],
      collectionKeys: ["ai-prompts"],
    },
    {
      title: "Conventional commit message prompt",
      contentKind: "TEXT",
      content: "Generate a concise conventional commit message for the following diff. Use the format: `type(scope): description`. Types: feat, fix, chore, refactor, docs, test, style. Keep the subject under 72 characters. Do not add a body unless the change is non-obvious.",
      description: "Generate a conventional commit message from a diff",
      isFavorite: true,
      isPinned: false,
      lastUsedAt: new Date("2026-06-12T11:00:00Z"),
      typeSlug: "prompts",
      tagKeys: ["ai", "git", "prompts"],
      collectionKeys: ["ai-prompts", "devops"],
    },
    {
      title: "Debug this error prompt",
      contentKind: "TEXT",
      content: "I'm getting the following error. Explain what is causing it, what the root cause likely is, and give me the fix with an explanation of why it works. Error:\n\n{ERROR}",
      description: "Structured debugging help prompt",
      isFavorite: false,
      isPinned: false,
      lastUsedAt: new Date("2026-06-11T16:00:00Z"),
      typeSlug: "prompts",
      tagKeys: ["ai", "debugging"],
      collectionKeys: ["ai-prompts"],
    },
    {
      title: "Write JSDoc for this function",
      contentKind: "TEXT",
      content: "Write JSDoc comments for the following TypeScript function. Include @param, @returns, @throws if applicable, and a one-line @description. Keep it concise — no filler.",
      description: "Generate JSDoc comments for a TypeScript function",
      isFavorite: false,
      isPinned: false,
      lastUsedAt: new Date("2026-06-06T09:00:00Z"),
      typeSlug: "prompts",
      tagKeys: ["ai", "typescript", "docs"],
      collectionKeys: ["ai-prompts"],
    },

    // ── Notes ───────────────────────────────────────────────────────────
    {
      title: "API error handling conventions",
      contentKind: "TEXT",
      content: "Always return `{ success, data, error }` from server actions. Use toast for user-facing errors. Log full error server-side, never expose internals to client.",
      description: "Error handling conventions",
      isFavorite: false,
      isPinned: false,
      lastUsedAt: new Date("2026-06-10T14:00:00Z"),
      typeSlug: "notes",
      tagKeys: ["conventions", "api"],
      collectionKeys: ["ai-prompts"],
    },
    {
      title: "Auth boundary rules",
      contentKind: "TEXT",
      content: `- Every protected route must check session in the layout or page component
- Never trust userId from the client — always derive it from the session
- OAuth users have null password — always check before hashing
- Gate Pro features with isPro check server-side, not just UI-side`,
      description: "Security rules for authentication in this codebase",
      isFavorite: true,
      isPinned: true,
      lastUsedAt: new Date("2026-06-13T07:00:00Z"),
      typeSlug: "notes",
      tagKeys: ["conventions", "security", "next.js"],
      collectionKeys: ["nextjs"],
    },
    {
      title: "Tailwind v4 config rules",
      contentKind: "TEXT",
      content: `- No tailwind.config.ts — v4 uses CSS-based config only
- All theme overrides go in @theme {} inside globals.css
- Use @import "tailwindcss" at the top of globals.css
- Dark mode: add class="dark" to <html> — no media query strategy`,
      description: "Tailwind CSS v4 configuration reminders",
      isFavorite: false,
      isPinned: false,
      lastUsedAt: new Date("2026-06-09T13:00:00Z"),
      typeSlug: "notes",
      tagKeys: ["tailwind", "css", "conventions"],
      collectionKeys: ["resources"],
    },

    // ── Commands ─────────────────────────────────────────────────────────
    {
      title: "Docker cleanup",
      contentKind: "TEXT",
      content: "docker system prune -a --volumes",
      language: "bash",
      description: "Remove all unused Docker resources including volumes",
      isFavorite: false,
      isPinned: false,
      lastUsedAt: new Date("2026-06-12T16:00:00Z"),
      typeSlug: "commands",
      tagKeys: ["docker", "devops"],
      collectionKeys: ["devops"],
    },
    {
      title: "git stash with message",
      contentKind: "TEXT",
      content: `git stash push -m "WIP: feature description"`,
      language: "bash",
      description: "Stash changes with a descriptive message",
      isFavorite: false,
      isPinned: false,
      lastUsedAt: new Date("2026-06-09T11:00:00Z"),
      typeSlug: "commands",
      tagKeys: ["git"],
      collectionKeys: ["devops"],
    },
    {
      title: "git log pretty",
      contentKind: "TEXT",
      content: `git log --oneline --graph --decorate --all`,
      language: "bash",
      description: "Visual branch graph in the terminal",
      isFavorite: true,
      isPinned: false,
      lastUsedAt: new Date("2026-06-13T08:30:00Z"),
      typeSlug: "commands",
      tagKeys: ["git"],
      collectionKeys: ["devops"],
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
      collectionKeys: ["devops"],
    },
    {
      title: "npm check outdated",
      contentKind: "TEXT",
      content: `npx npm-check-updates -i`,
      language: "bash",
      description: "Interactive dependency upgrade tool",
      isFavorite: false,
      isPinned: false,
      lastUsedAt: new Date("2026-06-08T10:00:00Z"),
      typeSlug: "commands",
      tagKeys: ["npm", "devops"],
      collectionKeys: ["devops"],
    },
    {
      title: "Prisma migrate dev",
      contentKind: "TEXT",
      content: `npx prisma migrate dev --name <migration-name>`,
      language: "bash",
      description: "Create and apply a new Prisma migration",
      isFavorite: false,
      isPinned: false,
      lastUsedAt: new Date("2026-06-13T18:00:00Z"),
      typeSlug: "commands",
      tagKeys: ["prisma", "database", "devops"],
      collectionKeys: ["devops"],
    },

    // ── Links ────────────────────────────────────────────────────────────
    {
      title: "Tailwind CSS v4 docs",
      contentKind: "URL",
      url: "https://tailwindcss.com/docs",
      description: "Official Tailwind CSS v4 documentation",
      isFavorite: false,
      isPinned: false,
      lastUsedAt: new Date("2026-06-11T08:00:00Z"),
      typeSlug: "links",
      tagKeys: ["tailwind", "css", "docs"],
      collectionKeys: ["react", "resources"],
    },
    {
      title: "Prisma docs",
      contentKind: "URL",
      url: "https://www.prisma.io/docs",
      description: "Official Prisma ORM documentation",
      isFavorite: true,
      isPinned: false,
      lastUsedAt: new Date("2026-06-13T17:00:00Z"),
      typeSlug: "links",
      tagKeys: ["prisma", "database", "docs"],
      collectionKeys: ["resources"],
    },
    {
      title: "Next.js App Router docs",
      contentKind: "URL",
      url: "https://nextjs.org/docs/app",
      description: "Next.js App Router official documentation",
      isFavorite: true,
      isPinned: false,
      lastUsedAt: new Date("2026-06-12T09:00:00Z"),
      typeSlug: "links",
      tagKeys: ["next.js", "docs"],
      collectionKeys: ["nextjs", "resources"],
    },
    {
      title: "shadcn/ui components",
      contentKind: "URL",
      url: "https://ui.shadcn.com/docs/components",
      description: "shadcn/ui component library reference",
      isFavorite: false,
      isPinned: false,
      lastUsedAt: new Date("2026-06-10T11:00:00Z"),
      typeSlug: "links",
      tagKeys: ["react", "docs"],
      collectionKeys: ["react", "resources"],
    },
    {
      title: "TypeScript handbook",
      contentKind: "URL",
      url: "https://www.typescriptlang.org/docs/handbook/intro.html",
      description: "The official TypeScript handbook",
      isFavorite: false,
      isPinned: false,
      lastUsedAt: new Date("2026-06-08T14:00:00Z"),
      typeSlug: "links",
      tagKeys: ["typescript", "docs"],
      collectionKeys: ["typescript", "resources"],
    },
  ]

  for (const item of items) {
    const { typeSlug, tagKeys, collectionKeys, contentKind, ...rest } = item

    await prisma.item.create({
      data: {
        ...rest,
        contentKind,
        userId: user.id,
        itemTypeId: types[typeSlug],
        tags: {
          create: tagKeys.map((k) => ({ tagId: tags[k] })),
        },
        collections: {
          create: collectionKeys.map((k) => ({ collectionId: cols[k] })),
        },
      },
    })
  }

  console.log(`Seeded: 1 user, ${typeData.length} item types, ${tagNames.length} tags, ${collectionData.length} collections, ${items.length} items`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => pool.end())
