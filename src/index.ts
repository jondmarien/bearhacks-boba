import { Hono } from "hono";
import { desc } from "drizzle-orm";
import { db } from "./db";
import { orders } from "./db/schema";
import { extractInboundTextMessages } from "./whatsapp/inbound";
import { shouldVerifyWebhook, verifyMetaSignature } from "./whatsapp/meta-signature";
import { handleInboundTextMessage } from "./services/order-handlers";
import { admin } from "./routes/admin";

const app = new Hono();

app.get("/health", (c) => c.json({ ok: true }));

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

app.post("/webhook/whatsapp", async (c) => {
  const raw = await c.req.text();
  const secret = process.env.M4D_APP_SECRET ?? "";

  if (shouldVerifyWebhook()) {
    const sig = c.req.header("X-Hub-Signature-256");
    if (!verifyMetaSignature(raw, sig, secret)) {
      return c.text("Invalid signature", 403);
    }
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw) as unknown;
  } catch {
    return c.text("Bad Request", 400);
  }

  const { messages, contactsByWaId } = extractInboundTextMessages(payload);
  for (const m of messages) {
    const profile = contactsByWaId.get(m.from);
    await handleInboundTextMessage({
      waMessageId: m.id,
      from: m.from,
      body: m.text.body,
      profileName: profile,
    });
  }

  return c.body(null, 200);
});

app.route("/admin", admin);

app.get("/debug/orders", async (c) => {
  const rows = await db.select().from(orders).orderBy(desc(orders.id)).limit(50);
  return c.json(rows);
});

const port = Number(process.env.PORT) || 3000;
console.log(`Listening on http://127.0.0.1:${port}`);

export default {
  port,
  fetch: app.fetch,
};
