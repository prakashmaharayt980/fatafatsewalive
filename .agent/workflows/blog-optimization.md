---
description: Blog optimization workflow and expectations for the Fatafat Sewa blog pages
---

# Blog Optimization Workflow

## Expectations

When working on blog pages (`/blogs` listing and `/blogs/[slug]` details), follow these rules:

### 1. No UI Changes
- Do NOT alter the visual design, colors, or layout of existing components
- Optimize only the internal code structure, performance, and SEO

### 2. Caching Strategy
- Blog banner, latest articles, and deal products are cached server-side in `src/app/context/BlogPageData.ts` using `unstable_cache` with a **3600-second (1 hour)** revalidation
- Never add duplicate API calls for data already in `getBlogPageData()`
- Use the cached data as `initialData` props to client components

### 3. Lazy Loading Pattern
- Use `LazyLoadSection` (from `@/components/LazyLoadSection`) for all below-fold sections
- Always provide a `fallback` skeleton with appropriate height and `animate-pulse`
- `BlogProductBasket` already uses `useInView` + SWR internally — do not double-wrap

### 4. Code Reuse Patterns
- Use `SectionHeader` component for all section headers (accent bar + title + optional link)
- Use `FeaturedArticleCard` for featured article grids with variants: `hero`, `compact`, `tall`
- Use `youtubeData.ts` constants for YouTube video data — never hardcode inline
- Use `BlogCard` for standard blog card grids

### 5. Server / Client Separation
- `page.tsx` files are **server components** — handle data fetching, caching, metadata, and JSON-LD here
- `*Client.tsx` files are **client components** — handle interactivity, state, and UI rendering
- Never fetch data in client components that can be passed from the server

### 6. SEO Focus
- Ensure proper semantic HTML: `section`, `article`, `nav`, `h1`-`h3` hierarchy
- All `Image` components must have meaningful `alt` text and proper `sizes` attribute
- Include JSON-LD structured data in server `page.tsx` files
- Ensure text color contrast meets WCAG AA standards

### 7. Responsiveness
- All grids must be responsive (mobile-first)
- Complex CSS grids (like the 5-item featured grid) must have mobile fallbacks
- Use Tailwind responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`

### 8. Never Use Browser Agent
- Do NOT use the browser agent tool unless explicitly instructed by the user
