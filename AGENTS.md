<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# Fatafat Sewa - Project Context

## Project Overview
- **Type**: E-commerce platform (Next.js 16)
- **Domain**: fatafatsewa.com
- **Market**: Nepal - Electronics, Mobile, Laptops
- **Features**: EMI, Exchange, Free Delivery, Pre-order

## Tech Stack
- Next.js 16.2.1 with App Router
- React 19 with Compiler
- Tailwind CSS
- TypeScript
- Zustand for state

## Code Standards
- Use `??` (nullish coalescing) instead of `||` for defaults
- Use `'use cache'` with `cacheLife()` for server components
- Keep interfaces named `Props` (short, no verbose names)
- No duplicate interfaces across files
- Clean imports - no empty lines between import groups
- No comments in production code
- Use object state pattern: `{ width, activeDot, ready }` not multiple `useState`
- Extract shared logic into hooks: `app/homepage/hooks/`
- Use `Array.from({ length: n }, (_, i) => ...)` not `[...Array(n)].map`

## State Management Pattern
```tsx
// Good - single state object
const [state, setState] = useState<State>({ width: 0, ready: false });
const updateState = (updates: Partial<State>) => setState(prev => ({ ...prev, ...updates }));

// Bad - multiple useState
const [width, setWidth] = useState(0);
const [ready, setReady] = useState(false);
```

## Component Structure
```
app/homepage/
  hooks/
    useBasketState.ts    # Shared state logic
  BasketCard.tsx         # Without image
  BasketCardwithImage.tsx # With side image
  interface.ts           # Shared types (minimal)
```

## AI Workflow
- **Claude**: Code, refactoring, architecture
- **Gemini**: Research, docs search
- `/seosir` - SEO audit
- `/coach` - Progress tracking
- `/context` - Load project context

## Session History
### 2026-03-30
- Created seosir SEO agent
- Cleaned homepage (removed unused props)
- Added `use cache` to server components
- Fixed `||` to `??` across codebase
- Consolidated BasketCard state into hooks
- Created `useBasketState` hook for shared logic
- Cleaned ProductCard (removed comments, simplified)

## Current Focus
- Exchange Products feature (in progress)
- Checkout Success page (modified)
- Homepage optimization (done)

## Quick Commands
- `/seosir` - Run SEO audit
- `/coach` - See progress
- Build: `yarn build`
- Dev: `yarn dev`

<!-- END:nextjs-agent-rules -->
