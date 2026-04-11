# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
make dev          # Start Next.js dev server
npm run build     # Production build
npm run lint      # Run ESLint
```

Environment: copy `.env.local` and set `NEXT_PUBLIC_API_URL` to the backend URL (default: `http://localhost:8000`).

## Architecture

Next.js 16 App Router with TypeScript. Two user roles: **buyer** and **seller**, each with distinct route trees.

**Routing:**
- `/` — product browse (home)
- `/login`, `/register` — auth (buyer or seller registration)
- `/products/[id]` — product details
- `/cart`, `/checkout` — buyer cart and checkout
- `/checkout/success`, `/checkout/pending`, `/checkout/failure` — payment status pages (MercadoPago redirect)
- `/orders`, `/orders/[id]` — buyer order history and order details
- `/profile` — buyer profile
- `/seller` — seller dashboard
- `/seller/products/new` — seller product creation
- `/stores/[storeId]` — public store profile page
- `/stores/[storeId]/mercadopago/connect` — MercadoPago OAuth connection for sellers

**Layer structure:**

```
lib/            # Service layer
  api-client.ts       # apiFetch() — adds Bearer token, throws ApiError on 4xx
  auth-service.ts     # login/register, reads/writes localStorage (auth_token, auth_user)
  product-service.ts  # product CRUD via real backend
  order-service.ts    # order creation, retrieval, status updates
  store-service.ts    # store profile and MercadoPago connection status
  payment-service.ts  # MercadoPago preference creation and payment retrieval
  error-utils.ts      # error message extraction and HTTP status checkers
  mock-services.ts    # fallback mock services for offline dev
  mock-data.ts        # mock data for development
components/     # Reusable UI components
  ui/           # shadcn/ui primitives (do not edit directly)
  site-header.tsx     # Main navigation with role-based menus
  site-footer.tsx     # Footer component
  product-card.tsx    # Product display card
  product-catalog.tsx # Product grid display
  cart-items-list.tsx # Cart items with quantity controls
  cart-summary.tsx    # Cart total and checkout button
  checkout-form.tsx   # Checkout flow form
  checkout-summary.tsx # Order summary in checkout
  seller-orders-table.tsx  # Seller order management
  seller-products-table.tsx # Seller product list
  add-to-cart-button.tsx    # Product card action buttons
contexts/       # React contexts
  auth-context.tsx    # Auth state provider with token validation
app/            # Next.js pages (file-based routing)
hooks/          # Custom hooks (use-mobile, use-toast)
```

**State management:**
- Auth state lives in `localStorage` (`auth_token`, `auth_user`) and React Context (`AuthContext`)
- Cart is in-memory via `cartService` (resets on page refresh)
- `SiteHeader` polls cart state every 1 second for badge updates

**API integration:**
All authenticated requests go through `apiFetch()` in `lib/api-client.ts`. Errors are thrown as `ApiError` instances with:
- `message`: User-friendly error message
- `status`: HTTP status code
- `fields`: Field-level validation errors (if any)
- `rawResponse`: Original response data

Use `error-utils.ts` for extracting error messages and checking error types:
```typescript
import { getErrorMessage, isNotFound, isUnauthorized } from "@/lib/error-utils"
```

The backend base URL comes from `NEXT_PUBLIC_API_URL`.

**Authentication:**
- `AuthContext` provides auth state across the app
- Token validation happens automatically on context mount
- Auto-redirect after login/registration based on user role
- Protected routes check auth state via context

**Payments:**
- MercadoPago Checkout Pro integration
- Order-first flow: order is created before payment
- After order creation, user is redirected to MercadoPago
- Payment status is tracked via `/checkout/success|pending|failure` pages
- Sellers connect their MercadoPago account via OAuth at `/stores/[storeId]/mercadopago/connect`

**Forms:** React Hook Form + Zod validation. Field-level errors are displayed inline.

**UI:** shadcn/ui (new-york style) + Tailwind CSS 4 with OKLch color variables. Dark mode via `next-themes`. Add new shadcn components with `npx shadcn@latest add <component>`.

## Key conventions

- Pages start as server components; add `"use client"` only for interactive features.
- Role-based rendering in `SiteHeader` uses the `auth_user.role` field from localStorage.
- `next.config.mjs` disables TypeScript build errors and image optimization — do not rely on these as a crutch.
- Path alias `@/*` maps to the project root.
