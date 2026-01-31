# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fatafat Sewa is a Next.js e-commerce platform for instant delivery in Nepal. It's a full-stack web app with React frontend consuming a REST API backend at `https://api.fatafatsewa.com/api`.

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint
```

## Tech Stack

- **Next.js 16** with App Router, React 19, TypeScript 5 (strict mode disabled)
- **Styling**: Tailwind CSS 4 + MUI 7 + shadcn/ui (Radix primitives)
- **State**: React Context API (no Redux/Zustand)
- **Data fetching**: SWR for client-side, server components for SSR
- **HTTP**: Axios with interceptors for auth token injection/refresh
- **Auth**: Cookie-based JWT (access_token/refresh_token) with Google & Facebook OAuth
- **Path alias**: `@/*` maps to `./src/*`

## Architecture

### Provider Hierarchy (src/app/layout.tsx)

The root layout nests providers in this order:
```
GoogleOAuthProvider → AuthProvider → CartProvider1 → CompareProvider → EmiProvider
```
All global UI (header, footer, chatbot, checkout drawer, wishlist, login modal, toaster) is rendered at the layout level.

### API Service Layer (src/app/api/services/)

All backend communication goes through centralized service modules:
- `client.ts` — Three Axios instances: `apiPublic` (no auth), `apiPrivate` (auto-attaches Bearer token, handles 401 refresh), `n8nApi` (N8N webhooks)
- Domain services: `auth.service.ts`, `product.service.ts`, `category.service.ts`, `cart.service.ts`, `order.service.ts`, `address.service.ts`, `blog.service.ts`, `profile.service.ts`, `misc.service.ts`
- `index.ts` — Barrel export for all services

The `apiPrivate` interceptor automatically refreshes tokens on 401 responses and redirects to `/login` on failure.

### Context Providers (src/app/context/, src/app/checkout/, src/app/emi/)

- **AuthContext** — User session, login/logout, token management via cookies
- **CartContext1** (in checkout/) — Shopping cart & wishlist operations
- **CompareContext** — Product comparison (synced to localStorage, max 5 items)
- **EmiContext** (in emi/) — EMI/financing flow state

### Route Structure (src/app/)

Uses Next.js App Router with dynamic segments:
- `product/[slug]` — Product detail pages with JSON-LD structured data
- `category/[slug]` — Category listing pages
- `blog/[slug]` — Blog post pages
- `compare/[...slug]` — Multi-product comparison
- `checkout/` — Checkout flow with Google Maps & Leaflet address selection
- `emi/applyemi/` — EMI application with document upload & signature pad
- `login/` — Auth pages (rendered as modal from root layout)
- `homepage/` — Homepage section components

### Shared Utilities

- `src/app/CommonVue/` — Date formatting, image helpers, payment utilities
- `src/lib/utils.ts` — Tailwind `cn()` merge helper
- `src/hooks/use-mobile.ts` — Mobile breakpoint detection
- `src/components/ui/` — shadcn/ui component library
- `src/components/LazyLoadSection.tsx` — Intersection Observer wrapper for lazy loading

## Environment Variables

Required `NEXT_PUBLIC_*` variables (validated in `client.ts` via Yup):
- `NEXT_PUBLIC_API_URL` — Backend API base URL
- `NEXT_PUBLIC_API_KEY` — API key sent as `API-Key` header
- `NEXT_PUBLIC_API_N8N_URL` — N8N webhook URL
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — Google OAuth client ID
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — Google Maps API key (optional)

## Key Patterns

- Server components fetch initial data (homepage, product pages) with retry logic; client components handle interactivity
- Forms use Yup validation schemas (see `login/validationSchema.ts`, `emi/applyemi/validationSchemas.js`)
- SEO: `generateMetadata` exports for dynamic pages, JSON-LD structured data, `sitemap.ts` generation
- Images served from allowed remote patterns configured in `next.config.ts` (fatafatsewa.com, R2 CDN, Google, Pexels, Unsplash)
- Nepal-specific location/postal data hardcoded in `checkout/NepalLocations.ts`
