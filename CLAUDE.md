# CLAUDE.md

# DevStash

A developer based experience hub for saving prompts, code snippets, commands, links, files, images, custom types and a lot more. Centralizes the development workflow.x Built with Next.js 16, React 19, TypeScript and Tailwind CSS v4.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Context Files

Read the following to get the full context of the project:
- @context/project-overview.md
- @context/coding-standards.md
- @context/ai-interaction.md
- @context/current-feature.md


## Commands

```bash
npm run dev      # start dev server (localhost:3000)
npm run build    # production build
npm run lint     # run ESLint
```

## Stack

- **Next.js 16** with App Router (`src/app/`)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4** — configured via PostCSS; styles live in `src/app/globals.css` with `@import "tailwindcss"`
- **Geist** fonts loaded via `next/font/google`, exposed as CSS variables `--font-geist-sans` and `--font-geist-mono`

## Structure

All routes are file-based under `src/app/`. The root layout (`layout.tsx`) wraps every page and applies global fonts and styles. Pages export a default React component — no pages router, no `getServerSideProps`.


## Neon MCP

When using Neon MCP tools, always default to:
- **Project:** `grimoire` (ID: `proud-queen-90298396`)
- **Branch:** `development` (ID: `br-restless-moon-asemkg8b`)

NEVER use the `production` branch (ID: `br-falling-butterfly-asmcel0i`) unless explicitly told to do so.
