# WordPress-like CMS Architecture Plan

## 1) Product Goal
Build a visual, block-based CMS with a polished editor experience first (MVP), then scale into a more extensible platform.

## 2) Recommended MVP Stack

- **Framework:** Next.js 14+ (App Router), React 18+, TypeScript
- **Editor engine:** TipTap (ProseMirror) for rich text blocks
- **Drag and drop:** `@dnd-kit/core`
- **UI:** Tailwind CSS + Radix UI
- **State:** Zustand for editor state + history
- **Data:** PostgreSQL + Prisma
- **Auth:** NextAuth.js
- **Media storage:** S3-compatible object storage (Cloudflare R2 or AWS S3)
- **Deploy:** Vercel first; self-hosted Node later if needed

## 3) System Architecture

### Runtime split

- **Admin/editor routes:** Client-heavy (interactive editing, drag/drop, block settings)
- **Public routes:** Server-rendered (SSR/ISR) for SEO and fast loads
- **API routes:** Internal APIs for page CRUD, media upload, auth callbacks

### Why this split works

The same codebase serves both authoring and publishing:

- Minimal JavaScript on public pages
- Full interactivity in admin editor
- Shared types and block definitions to avoid drift

## 4) Block Model (Core Data Contract)

Treat every page as a **block tree** serialized to JSON.

```ts
export interface BlockNode {
  id: string;
  type: string;
  props: Record<string, unknown>;
  styles?: Record<string, string | number>;
  children?: BlockNode[];
}
```

Each block type is a registered definition:

```ts
export interface BlockDefinition {
  type: string;
  name: string;
  category: "layout" | "content" | "media" | "form" | "custom";
  propsSchema: object; // JSON Schema
  defaultProps: Record<string, unknown>;
  EditorComponent: React.ComponentType<any>;
  RenderComponent: React.ComponentType<any>;
  canHaveChildren?: boolean;
  allowedChildren?: string[];
  maxChildren?: number;
}
```

## 5) Database Design (MVP)

Use JSONB for the page block tree for fast iteration.

- **Page**
  - `id`, `slug`, `title`, `status` (`draft`/`published`), `blocks` (JSONB), timestamps
- **PageVersion**
  - `id`, `pageId`, `blocks` (JSONB), `createdBy`, `createdAt`
- **Component** (optional for dynamic registry metadata)
  - `type`, `name`, `propsSchema`, `defaultProps`, `isActive`
- **MediaAsset**
  - `id`, `url`, `mime`, `size`, `alt`, timestamps
- **User**
  - auth + role data

## 6) Editor Architecture

### Core UI

- **Block Palette:** draggable block catalog by category
- **Canvas:** live WYSIWYG tree renderer with nested drop zones
- **Settings Panel:** auto-generated controls from JSON schema

### State store (Zustand)

Editor operations should be pure and history-aware:

- `addBlock(parentId, index, block)`
- `moveBlock(sourcePath, destPath)`
- `updateBlockProps(blockId, patch)`
- `deleteBlock(blockId)`
- `selectBlock(blockId | null)`
- `undo()` / `redo()`

Use immutable updates so history snapshots are reliable.

## 7) Rendering Strategy

Each block has two render targets:

- **EditorComponent**: interactive admin rendering (client component)
- **RenderComponent**: lean published rendering (server component)

Public rendering is recursive:

1. Fetch page by slug
2. Parse `blocks` JSON
3. Walk block tree and resolve `RenderComponent` by `type`
4. Emit static/SSR HTML

## 8) Suggested Project Structure

```text
src/
├── app/
│   ├── (public)/
│   │   ├── [slug]/page.tsx
│   │   └── layout.tsx
│   ├── (admin)/
│   │   ├── dashboard/page.tsx
│   │   ├── pages/[id]/edit/page.tsx
│   │   ├── media/page.tsx
│   │   └── settings/page.tsx
│   ├── api/
│   │   ├── pages/route.ts
│   │   ├── media/upload/route.ts
│   │   └── auth/[...nextauth]/route.ts
│   └── layout.tsx
├── blocks/
│   ├── registry.ts
│   ├── heading/
│   │   ├── definition.ts
│   │   ├── Editor.tsx
│   │   └── Render.tsx
│   ├── paragraph/
│   ├── image/
│   ├── columns/
│   └── hero/
├── editor/
│   ├── EditorShell.tsx
│   ├── Canvas.tsx
│   ├── BlockPalette.tsx
│   ├── SettingsPanel.tsx
│   ├── BlockToolbar.tsx
│   ├── store.ts
│   └── dnd/
├── renderer/
│   ├── PageRenderer.tsx
│   └── BlockResolver.tsx
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   └── schema-to-form.ts
└── prisma/
    └── schema.prisma
```

## 9) Delivery Roadmap

### Phase 1 — Foundations

- Prisma schema + migrations
- Block types and registry contracts
- Zustand store with undo/redo
- Basic page CRUD API

**Outcome:** data model and editor core logic are stable.

### Phase 2 — Visual Editor MVP

- Three-panel editor shell
- Drag/drop block insertion + reordering
- Selection state + settings panel generation from schema
- Core blocks: heading, paragraph, image, columns, button

**Outcome:** authors can build pages visually.

### Phase 3 — Publishing + Public Rendering

- Slug-based public routes
- SSR/ISR renderer
- Draft vs published workflow
- Revisions restore flow

**Outcome:** pages are publishable and SEO-friendly.

### Phase 4 — Platform Features

- Media library manager
- Roles/permissions
- Theme settings + global sections
- Performance pass, analytics hooks, plugin extension points

**Outcome:** production-ready CMS baseline.

## 10) Key Implementation Notes

- Prioritize editor state correctness before polishing UI.
- Keep block props schema-driven to avoid custom settings UIs per block.
- Use compound droppable IDs for nested drag/drop (e.g. `column:<id>:slot:<n>`).
- Avoid over-normalizing early; JSONB block trees are ideal for MVP speed.
- Add strict runtime validation for block payloads at API boundaries.

## 11) Recommended Next Build Step

Start with **Phase 1** in this order:

1. Define block/tree TypeScript contracts.
2. Implement Zustand editor store and tests.
3. Add Prisma models for `Page` + `PageVersion`.
4. Build minimal `POST /api/pages` and `GET /api/pages/:id`.

This sequence derisks the hardest subsystem first (editor state correctness).
