# MagickVoice — Frontend (Next.js 15)

Dark-mode UI for the MagickVoice multi-vendor lead management system. Three surfaces:

- `/login` — sign in
- `/admin/*` — super admin portal (dashboard, manage vendors, generate QR)
- `/vendor/*` — vendor admin portal (customers, dashboard)
- `/register?vendor_id=…` — public registration form opened from a QR scan

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS with `MagickVoice` brand tokens (purple `#a855f7`, teal `#2dd4bf`, dark `#0b0b14`)
- TanStack Query for server state
- Recharts for charts

## Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
# edit .env.local: NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
npm run dev
```

App runs on <http://localhost:3000>. Backend must be running and reachable at `NEXT_PUBLIC_API_BASE_URL`.

## Auth flow

- Login posts to `/auth/login` with `credentials: "include"`. Backend sets an HTTP-only `mv_session` cookie.
- `AuthProvider` (`lib/auth.tsx`) queries `/auth/me` to populate the session.
- `RequireRole` wraps `/admin/*` and `/vendor/*` layouts and redirects:
  - not authed → `/login`
  - wrong role → the user's correct portal home
- Logout clears the cookie via `/auth/logout` and routes back to `/login`.

## Scan-tracking note (important)

The public `/register` page is intentionally a **client component**. The `GET /public/vendors/:id` call (which inserts a `scan_events` row server-side) only fires when JS executes — so server-side link-preview crawlers (WhatsApp, Slack, etc.) and headless bots that don't run JS do NOT inflate scan counts.

If you ever refactor `/register` to fetch the vendor in a server component, you'll start counting crawler hits as scans. Don't.

## Routes

| Path                              | Auth         |
|-----------------------------------|--------------|
| `/login`                          | public       |
| `/admin/dashboard`                | super_admin  |
| `/admin/vendors`                  | super_admin  |
| `/admin/vendors/new`              | super_admin  |
| `/admin/vendors/:id/edit`         | super_admin  |
| `/admin/qr`                       | super_admin  |
| `/vendor/dashboard`               | vendor_admin |
| `/vendor/customers`               | vendor_admin |
| `/register?vendor_id=…`           | public       |

## Brand tokens (Tailwind)

- `bg-bg` `#0b0b14` — page background
- `bg-bg-elevated` `#15151f` — card surface
- `text-brand-purple` `#a855f7` — primary
- `text-brand-teal` `#2dd4bf` — accent
- `border-border` `#26262e` — subtle borders
- `text-muted` `#a1a1aa` — secondary text

Reusable classes in `app/globals.css`:

- `.pill-primary` — purple gradient pill button
- `.pill-ghost` — outlined pill button
- `.surface` — card surface
- `.input-base` — text inputs
- `.chip` — chip selector (with `data-selected` styling)

## Scripts

```bash
npm run dev        # dev server (port 3000)
npm run build      # production build
npm run start      # serve the production build
npm run typecheck  # tsc --noEmit
npm run lint       # next lint
```
