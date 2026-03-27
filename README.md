# Tensa

Tensa is an in-progress, block-based CMS project.

## Implemented scope (Phase 1 → 4 baseline)

This repository now contains a runnable end-to-end platform baseline across all roadmap phases:

- **Phase 1 (Foundations)**
  - Block and definition contracts (`src/core/types.js`)
  - Runtime block registry (`src/blocks/registry.js`)
  - Immutable tree helpers (`src/editor/tree.js`)
  - History-aware editor store with undo/redo (`src/editor/store.js`)

- **Phase 2 (Editor infrastructure core)**
  - Schema-to-settings form mapping (`src/cms/schema-to-form.js`)
  - Core block registration and settings field generation (`src/cms/platform.js`)
  - Next.js dashboard and page editor scaffolding (`app/(admin)/...`, `src/editor-ui/EditorShell.tsx`)

- **Phase 3 (Publishing + rendering)**
  - Page lifecycle service with drafts, versions, publish, restore (`src/cms/page-service.js`)
  - Recursive published renderer (`src/cms/renderer.js`)
  - Public slug rendering route (`app/(public)/[slug]/page.tsx`)

- **Phase 4 (Platform features baseline)**
  - Media library (`src/cms/media-library.js`)
  - Role/capability permissions (`src/cms/permissions.js`)
  - Theme and global section settings (`src/cms/theme.js`)
  - Plugin/event hooks for analytics/integrations (`src/cms/plugin-system.js`)

## Run tests

```bash
npm test
```

## Run app (after dependencies are installed)

```bash
npm install
npm run dev
```

Open:

- `http://localhost:3000/dashboard` for admin
- `http://localhost:3000/home` for published page

## Architecture plan

- [`docs/cms-architecture-plan.md`](docs/cms-architecture-plan.md)
