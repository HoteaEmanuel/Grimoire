## Current Feature

Dashboard Phase 3 — Main content area

## Status

In Progress

## Goals

- 4 stats cards at the top: total items, total collections, favorite items, favorite collections
- Recent Collections section
- Pinned Items section
- 10 Recent Items section
- Use mock data from `src/lib/mock-data.js`

## Notes

- Reference screenshot: `context/screenshots/dashboard-ui-main.png`
- Stats cards are not in the screenshot but are required
- Import mock data directly until database is implemented

## History

- **Initial setup - 2026-06-13** — Initial Next.js 15 + Tailwind CSS v4 project setup. Initialized git repository, connected to remote, and pushed to `main`.
- **Dashboard Phase 1 - 2026-06-13** — shadcn/ui initialization, `/dashboard` route, dark warm-brown theme, top bar with search + New Item + New Collection buttons, sidebar and main area placeholders.
- **Dashboard Phase 2 - 2026-06-13** — Collapsible sidebar with desktop collapse toggle and mobile Sheet drawer. Item types list with per-type item counts. Collapsible Collections section with Favorites and Recent sub-groups. User avatar footer. Extracted `Header`, `Sidebar`, `SidebarContent`, `SidebarCollapsibleSection`, `SidebarNavItem`, `SidebarCollectionItem`, `SidebarSection`, `SidebarUserFooter` components. Installed shadcn tooltip, avatar, separator, sheet, and collapsible.
