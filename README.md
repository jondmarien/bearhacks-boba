# BearHacks Boba ordering (WhatsApp Cloud API)

Bun + Hono + Drizzle (`bun:sqlite`) backend for hackathon boba orders and Gong Cha batch messages.

## Setup

```bash
bun install
cp .env.example .env
bun run db:generate
bun run db:migrate
bun run dev
```

- Health: `GET /health`
- Meta webhook: `GET|POST /webhook/whatsapp`
- Dev: `GET /debug/orders`

Configure Meta app secrets in `.env`. Use an HTTPS tunnel (e.g. Cloudflare Tunnel, ngrok) for webhook URLs in development.

## Scripts

| Script        | Description                |
| ------------- | -------------------------- |
| `bun run dev` | Hot reload                 |
| `db:generate` | Drizzle migrations (SQL)   |
| `db:migrate`  | Apply migrations           |
| `db:studio`   | Drizzle Studio (optional)  |

Remote: `https://github.com/jondmarien/bearhacks-boba`
