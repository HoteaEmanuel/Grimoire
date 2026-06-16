# Coding Standards

## TypeScript

- Strict mode enabled
- No `any` types - use proper typing or `unknown`
- Define interfaces for all props, API responses, and data models
- Use type inference where obvious, explicit types where helpful

## React

- Functional components only (no class components)
- Use hooks for state and side effects
- Keep components focused - one job per component
- Extract reusable logic into custom hooks

## Next.js

- Server components by default
- Only use `'use client'` when needed (interactivity, hooks, browser APIs)
- Use Server Actions for form submissions and simple mutations
- Use API routes when you need:
  - Webhooks (Stripe, GitHub, etc.)
  - File uploads with progress tracking
  - Long-running operations
  - Specific HTTP status codes or headers
  - Endpoints for future mobile/CLI clients
  - Third-party integrations
- Otherwise, fetch data directly in server components
- Dynamic routes for item/collection pages

## Tailwind CSS v4

**CRITICAL**: We are using Tailwind CSS v4, which uses CSS-based configuration.

- **DO NOT** create `tailwind.config.ts` or `tailwind.config.js` files (those are for v3)
- All theme configuration must be done in CSS using the `@theme` directive in `src/app/globals.css`
- Use CSS custom properties for colors, spacing, etc.
- No JavaScript-based config allowed

Example v4 configuration:

```css
@import "tailwindcss";

@theme {
  --color-primary: oklch(50% 0.2 250);
}
```

## Naming

- Components: PascalCase (`ItemCard.tsx`)
- Files: Match component name or kebab-case
- Functions: camelCase
- Constants: SCREAMING_SNAKE_CASE
- Types/Interfaces: PascalCase (no prefix)

## Styling

- Tailwind CSS for all styling
- Use shadcn/ui components where applicable
- No inline styles
- Dark mode first, light mode as option

## Database

- Use Prisma ORM for all database operations
- Always use `prisma migrate dev` for schema changes (not `db push`)
- Run `prisma migrate status` before committing to verify migrations are in sync
- Production deployments must run `prisma migrate deploy` before the app starts

## Data Fetching

- Server components fetch directly with Prisma
- Client components use Server Actions
- Validate all inputs with Zod

## Error Handling

- Use try/catch in Server Actions
- Return `{ success, data, error }` pattern from actions
- Display user-friendly error messages via toast

## Testing

- Framework: **Vitest** — server actions and utilities only, no component tests
- Test files: `src/**/*.test.ts` (never inside `src/components/`)
- Environment: `node` — do not use jsdom or browser APIs in tests
- Co-locate tests with source when possible: `src/lib/auth-constants.test.ts` alongside `src/lib/auth-constants.ts`

**Mocking:**
- Global mocks for `next/headers`, `next/cache`, `@/lib/prisma`, and `@/auth` are registered in `src/tests/setup.ts`
- Control return values per test with `vi.mocked(prisma.user.findUnique).mockResolvedValue(...)`
- Always call `vi.clearAllMocks()` in `beforeEach` if a test file shares mock state

**What to test:**
- Pure utility functions (validation, formatting, hashing)
- Server action logic: auth checks, input validation, error branches
- DB helper functions in `src/lib/db/` — mock Prisma, assert correct query args

**What not to test:**
- React components or hooks
- Next.js routing or middleware
- Third-party library internals

**Commands:**
```bash
npm run test            # single run
npm run test:watch      # watch mode
npm run test:coverage   # coverage report (src/lib + src/actions only)
```

## File Organization

- Components: `src/components/[feature]/ComponentName.tsx`
- Pages: `src/app/[route]/page.tsx`
- Server Actions: `src/actions/[feature].ts`
- Types: `src/types/[feature].ts`
- Lib/Utils: `src/lib/[utility].ts`
- Tests: `src/[feature]/[file].test.ts` (mirror source path)
- Test setup: `src/tests/setup.ts`