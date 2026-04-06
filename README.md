# BearHacks Boba ordering (WhatsApp Cloud API)

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
