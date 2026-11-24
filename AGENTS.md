<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project Workflow Rules

- **Always commit when finishing a task**: After completing and verifying any change, always create a clean conventional commit in git before finishing your response. Never leave completed work uncommitted.

## Unified Page Transitions & Loading Convention

All existing and future pages automatically inherit unified transitions and loading states:

- **Automatic page transitions**: `src/app/layout.tsx` wraps all routes in `<PageTransitionShell>` (`src/components/layout/PageTransitionShell.tsx`), keyed by `pathname`, using React 19 `<ViewTransition>` with a CSS fallback for unsupported browsers and full `prefers-reduced-motion` support. Do **not** add per-page entrance animations or nested `template.tsx` transition wrappers.
- **Directional navigation**: Use `<Link transitionTypes={["nav-forward"]}>` when drilling deeper into a detail/sub-view, and `<Link transitionTypes={["nav-back"]}>` on back/breadcrumb links. Peer navigation links (`Navbar`, `BottomNav`) should omit `transitionTypes` so they use the default cross-fade + subtle lift.
- **Unified loading states**: Any new route automatically falls back to `src/app/loading.tsx` (`<PageLoadingShell variant="generic" />`). For a tailored skeleton on a new route, add a `loading.tsx` that renders `<PageLoadingShell variant="..." label="..." />` from `src/components/ui/PageLoadingShell.tsx` (or add a new variant there) so Suspense skeleton handoffs stay consistent across the entire app.
