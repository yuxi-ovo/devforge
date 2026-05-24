---
name: react-frontend
description: Web frontend with React, Next.js, Inertia+React. Covers components, pages, hooks, client state, router, forms, styles, fetch/queries and business UI (tables, filters, modals, pagination). Use when the task touches a component, page, hook, state, route, form or style of the web frontend, even if the backend is Laravel+Inertia or Node. Do not use for pure backend (→ `laravel-backend` / `node-backend`), mobile (→ `mobile-hybrid`), tests (→ `testing-quality`) or infra. Adapts to the framework, router, state, HTTP client, styling system and UI kit of the project.
---

# React / Web Frontend

Existing code rules. Adapt, do not impose.

## Goal

Solve web frontend tasks with minimum change, respecting the real framework, state, styles and UI kit.

## Activation

Use when:
- Component, hook, page, slice, context, route, form or style.
- Inertia+React client side, Next pages/app router.
- Console error, unexpected render, broken hook.

Do not use if:
- It is pure backend → `laravel-backend` / `node-backend`.
- It is hybrid mobile → `mobile-hybrid`.
- It is tests → `testing-quality`.
- It is only analysis → `code-auditor`.

## Flow

1. Read `package.json` → framework, versions, libraries.
2. Detect router, global state, fetch, forms, validation, styles, UI kit, i18n.
3. Detect structure (`src/`, `app/`, feature-based, atomic).
4. Classify task (bug / improvement / feature / analysis).
5. Scope exact files (component, hook, page, slice).
6. Assess impact (consumers, props, parent contexts, routes).
7. Apply minimum change following existing pattern.
8. Validate only what was touched.

## Key rules

- Do not change state library, routing, UI kit, fetch client or styles.
- Reuse components, hooks, layouts, utils before creating new ones.
- Respect current styling system (do not add Tailwind if it is not there).
- `loading/success/error` states if the UI pattern uses them.
- Accessibility: maintain or improve existing level.
- Typing: TS if the project is TS; do not introduce TS without asking.
- Do not change props nor context shape nor query keys without asking.
- Respect backend contract as it arrives.

Detail in [references/detail.md](references/detail.md).

## Business UI

- Respect existing pattern for tables, filters, forms, modals, toasts, pagination.
- Do not redo shared components (`DataTable`, `FormField`, `Dialog`, `Pagination`) without asking.
- Do not change UX by personal preference.
- Error/success messages with the pattern (inline, toast, banner).

## HTTP

- Use the project client (Axios, fetch wrapper, TanStack Query, SWR, server actions, Inertia forms).
- Do not introduce a new client.
- Interceptors, auth header, global handling → use existing ones.
- Handle `401/403/404/422/5xx` with the present UI pattern.

## SSR / RSC / Inertia

- Next App Router → respect server vs client components.
- Inertia → props from controller; `useForm` if the project uses it.
- Avoid client-side fetch when the data already arrives via SSR/RSC/props.

## Optimization

- Correct dependencies in `useEffect`/`useMemo`/`useCallback`.
- Memoize only when it brings measurable value.
- Lazy loading / code splitting per pattern.
- Images: project component (Next Image, etc.).

## Relation with other skills

- If Inertia requires server-side props changes → coordinate with `laravel-backend`.
- If the change needs a test → `testing-quality` afterwards.
- If it is mobile (Ionic/Capacitor) → `mobile-hybrid`.
- If it is only opinion → `code-auditor`.

## Forbidden

- Refactor, rename or change patterns without asking.
- Change framework, router, global state, UI kit, styles.
- Rewrite components that already work.
- Add libraries without need.
- `console.log` in deliverable.

## Delivery format

- Only the affected component, hook or block.
- Minimum DIFF, no re-importing nor rewriting intact.
- Out-of-scope issues: brief note, no fix.

## Final validation

Does it solve it? Does it keep the pattern? Minimum change? Does it break anything outside?
