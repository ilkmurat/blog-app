---
name: inkwell-frontend
description: Work on the Inkwell blog-app frontend (React 19 + TypeScript + Vite) and the full-stack Docker setup. Use when adding or changing pages/screens (blog, chat, admin panel tabs), API client calls, auth/likes UI, nginx proxying, or when running the whole Inkwell stack.
---

# Inkwell blog-app (frontend + stack entry point)

React SPA served by nginx. Talks to `blog-api` via `/api/` and to `blog-agent` via `/agent/` (same origin, no
CORS). `docker-compose.yml` here includes `../blog-api` and `../blog-agent` — run the whole stack from this repo.
Screens and roles are listed in `README.md`.

## Run and verify
```bash
docker compose up -d --build            # full stack (needs Ollama on the host for chat)
docker compose up -d --build web        # after frontend changes (the image contains the built app)
npm run build && npm run lint           # must both be clean (tsc + vite build, oxlint)
npm run dev                             # :5173 with /api and /agent proxies
```
Verify UI changes in a real browser (headless Chrome via CDP works well: drive clicks/inputs, read DOM, take
screenshots, capture console errors). Set React input values through the native value setter + an `input` event.

## Conventions
- Data fetching: `useApi(load, deps)` from `src/lib/hooks.ts` + `<Status state>` for loading/error/404.
  Refetch by bumping a `version` counter in deps. No global store.
- API calls only through `src/lib/api.ts` (`api.*`); it attaches the bearer token set by `AuthProvider`
  (`src/lib/auth.tsx`, token in localStorage with try/catch). Types mirror the API contract in `src/lib/types.ts`.
- Chat streaming: `src/lib/chat.ts` parses SSE from `POST /agent/v1/chat` (events `tool_start`, `tool_end`,
  `token`, `done`, `error`). Add a label to `TOOL_LABELS` in `pages/Chat.tsx` for each new MCP tool.
- Admin screens live under `/admin` in `pages/admin/`; `AdminLayout` guards (login form / not-admin message) and
  renders the tabs — add a `NavLink` there and a `<Route>` in `App.tsx` for a new tab.
- Show admin-only actions only when `user?.is_admin`; the API enforces permissions anyway.
- Styling: plain CSS in `src/index.css` using the `:root` variables (light/dark). Reuse `.button`, `.form`,
  `.card`, `.table`, `.tabs`, `.category-badge`, `.status-badge`.
- Chat Markdown: only `/…` (in-app `Link`) and `http(s)` links render as links; anything else is plain text.
- nginx: `/api/` allows 25 MB bodies (HR PDFs); `/agent/` has buffering off for SSE and sets `X-Real-IP`
  (used by the agent's rate limit).

## Gotchas
- Effects must not return non-functions: `useEffect(() => window.scrollTo(0, 0))` crashed the app because newer
  Chrome returns a Promise from `scrollTo`. Always use braces.
- `BrowserRouter` + `base` from `VITE_BASE`: nginx `try_files … /index.html` and GitHub Pages `404.html` provide the
  SPA fallback; keep asset URLs absolute (`/favicon.svg`).
- `oxlint` cannot verify `useApi`'s dynamic deps; the two `eslint-disable-next-line` comments there are intentional.
- Do not `source` another project's `.env` in the shell: a `COMPOSE_PROJECT_NAME` in it retargets `docker compose`.
