import { Hono } from "hono";
import { desc } from "drizzle-orm";
import { db } from "./db";
import { orders } from "./db/schema";

const app = new Hono();

app.get("/health", (c) => c.json({ ok: true }));

/** Meta webhook verification (GET) */
app.get("/webhook/whatsapp", (c) => {
  const mode = c.req.query("hub.mode");
  const token = c.req.query("hub.verify_token");
  const challenge = c.req.query("hub.challenge");
  const verify = process.env.WEBHOOK_VERIFICATION_TOKEN;
  if (mode === "subscribe" && verify && token === verify && challenge) {
    return c.text(challenge, 200);
  }
  return c.text("Forbidden", 403);
});

/**
 * Meta webhook events (POST). Raw body reserved for X-Hub-Signature-256 (TODO).
 */
app.post("/webhook/whatsapp", async (c) => {
  const raw = await c.req.text();
  try {
    const payload = JSON.parse(raw) as unknown;
    console.info("whatsapp webhook payload", JSON.stringify(payload).slice(0, 500));
  } catch {
    console.warn("webhook: non-JSON body");
  }
  return c.body(null, 200);
});

/** Dev-only: recent orders — protect or remove in production */
app.get("/debug/orders", async (c) => {
  const rows = await db.select().from(orders).orderBy(desc(orders.id)).limit(20);
  return c.json(rows);
});

const port = Number(process.env.PORT) || 3000;
console.log(`Listening on http://127.0.0.1:${port}`);

export default {
  port,
  fetch: app.fetch,
};
