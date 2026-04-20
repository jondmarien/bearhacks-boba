# BearHacks Boba ordering (WhatsApp Cloud API)

> ## ⚠️ Deprecated — do not deploy
>
> This Bun + Hono service is no longer the source of truth for BearHacks 2026
> boba ordering. The WhatsApp Cloud API integration has been retired in favour
> of an in-portal flow. The new system lives across three places:
>
> - **Backend (FastAPI + Supabase Postgres):** `bearhacks-backend`
>   - Hacker API: `routers/boba.py` → `/boba/menu`, `/boba/windows`, `/boba/orders/me`, `POST/PATCH/DELETE /boba/orders[/{id}]`
>   - Admin API: `routers/admin_boba.py` → `/admin/boba/windows`, `/admin/boba/orders`, `/admin/boba/orders/prep-summary`, `/admin/boba/orders/pickup-list`, `/admin/boba/orders/export.csv`, `POST /admin/boba/orders/{id}/fulfill`
>   - Domain: `core/boba/{menu.py,meal_windows.py,formatting.py}` (timezone: `America/Toronto`)
>   - Migration: `supabase/migrations/*_create_boba_orders.sql`
> - **Hacker portal (Next.js):** `bearhacks-web/apps/me`
>   - Always-visible status: `components/boba-status-card.tsx`
>   - Order page: `app/boba/page.tsx` (TanStack Form + Zod)
> - **Admin portal (Next.js):** `bearhacks-web/apps/admin`
>   - Dashboard tile: `app/page.tsx` (super-admin gated)
>   - Food-team console: `app/boba-orders/page.tsx` (TanStack Table v8)
>
> The menu (`src/domain/menu.ts`), meal windows (`src/domain/meal-windows.ts`),
> and Gong Cha batch text idea were ported into Python equivalents inside
> `bearhacks-backend/core/boba/`. This repo is kept around only as a reference
> for the original WhatsApp/SQLite design and **should not be redeployed**.

Bun + Hono + Drizzle (`bun:sqlite`) backend for hackathon boba orders and Gong Cha batch messages.

## Setup

```bash
bun install
cp .env.example .env
bun run db:migrate
bun run dev
```

After changing `src/db/schema.ts`, run `bun run db:generate` and migrate again.

### Docs

- [Meta / WABA checklist](docs/META_WABA.md)
- [OpenClaw extension point](docs/OPENCLAW.md)

## HTTP routes

| Route | Auth | Description |
| ----- | ---- | ----------- |
| `GET /health` | — | Liveness |
| `GET /webhook/whatsapp` | Meta challenge | Webhook verification |
| `POST /webhook/whatsapp` | `X-Hub-Signature-256` | Inbound messages → DB + auto-reply |
| `GET /debug/orders` | — | Last 50 rows (remove/protect in prod) |
| `GET /admin/batch/:mealWindowId/preview` | Admin | JSON preview of batch text |
| `POST /admin/batch/:mealWindowId/send` | Admin | Send batch to `GONGCHA_RECIPIENT_E164` |
| `GET /admin/export/orders.csv` | Admin | CSV (`?mealWindowId=` optional) |

**Admin auth:** `Authorization: Bearer <ADMIN_API_KEY>` or `X-Admin-Key: <ADMIN_API_KEY>`.

Meal window ids: `fri-dinner`, `fri-midnight`, `sat-lunch`, `sat-dinner`, `sat-midnight`, `sun-lunch`, `sun-ceremony` (see `src/domain/meal-windows.ts`).

Configure Meta secrets in `.env`. Use HTTPS (Cloudflare Tunnel, ngrok, etc.) for webhooks in development.

## Scripts

| Script | Description |
| ------ | ----------- |
| `bun run dev` | Hot reload |
| `db:generate` | Drizzle SQL migrations |
| `db:migrate` | Apply migrations |
| `db:studio` | Drizzle Studio |

Repo: [github.com/jondmarien/bearhacks-boba](https://github.com/jondmarien/bearhacks-boba)
