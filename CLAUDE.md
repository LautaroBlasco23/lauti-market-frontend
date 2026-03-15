# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Next.js dev server
npm run build     # Production build
npm run lint      # Run ESLint
make start        # Interactive mode selection (dev/docker/prod)
```

Environment: copy `.env.local` and set `NEXT_PUBLIC_API_URL` to the backend URL (default: `http://localhost:8000`).

## Architecture

Next.js 16 App Router with TypeScript. Two user roles: **buyer** and **seller**, each with distinct route trees.

**Routing:**
- `/` — product browse (home)
- `/login`, `/register` — auth (buyer or seller registration)
- `/products/[id]`, `/cart`, `/checkout`, `/orders`, `/profile` — buyer flows
- `/seller`, `/seller/products/new` — seller dashboard and product management

**Layer structure:**

```
lib/            # Service layer
  api-client.ts       # apiFetch() — adds Bearer token, throws {error, fields} on 4xx
  auth-service.ts     # login/register, reads/writes localStorage (auth_token, auth_user)
  product-service.ts  # product CRUD via real backend
  mock-services.ts    # fallback mock services for offline dev
components/     # Reusable UI components
  ui/           # shadcn/ui primitives (do not edit directly)
app/            # Next.js pages (file-based routing)
hooks/          # Custom hooks (use-mobile, use-toast)
```

**State management:**
- Auth state lives in `localStorage` (`auth_token`, `auth_user`)
- Cart is in-memory via `cartService` (resets on page refresh)
- `SiteHeader` polls cart state every 1 second for badge updates

**API integration:**
All authenticated requests go through `apiFetch()` in `lib/api-client.ts`. Errors are thrown as `{ error: string, fields?: Record<string, string> }`. The backend base URL comes from `NEXT_PUBLIC_API_URL`.

**Forms:** React Hook Form + Zod validation. Field-level errors are displayed inline.

**UI:** shadcn/ui (new-york style) + Tailwind CSS 4 with OKLch color variables. Dark mode via `next-themes`. Add new shadcn components with `npx shadcn@latest add <component>`.

## Key conventions

- Pages start as server components; add `"use client"` only for interactive features.
- Role-based rendering in `SiteHeader` uses the `auth_user.role` field from localStorage.
- `next.config.mjs` disables TypeScript build errors and image optimization — do not rely on these as a crutch.
- Path alias `@/*` maps to the project root.
