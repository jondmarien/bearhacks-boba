import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { orders } from "../db/schema";
import { formatBatchForVendor } from "../domain/batch-format";
import { requireAdmin } from "../middleware/admin-auth";
import type { OrderNotificationPort } from "../ports/order-notification";
import { sendTextMessage } from "../whatsapp/cloud-api";

const admin = new Hono();

admin.use("*", requireAdmin());

const metaVendorNotifier: OrderNotificationPort = {
  async sendVendorBatch({ text }) {
    const to = process.env.GONGCHA_RECIPIENT_E164;
    if (!to) {
      return { ok: false, error: "GONGCHA_RECIPIENT_E164 not set" };
    }
    if (!process.env.CLOUD_API_ACCESS_TOKEN || !process.env.WA_PHONE_NUMBER_ID) {
      return { ok: false, error: "WhatsApp Cloud API env not configured" };
    }
    try {
      const res = await sendTextMessage({ toE164: to, body: text });
      if (!res.ok) {
        return { ok: false, error: `${res.status} ${await res.text()}` };
      }
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  },
};

/** Preview batch text for a meal window */
admin.get("/batch/:mealWindowId/preview", async (c) => {
  const mealWindowId = c.req.param("mealWindowId");
  const rows = await db.select().from(orders).where(eq(orders.mealWindowId, mealWindowId));
  const received = rows.filter((r) => r.status === "received");
  const text = formatBatchForVendor(mealWindowId, received, {
    eventName: process.env.EVENT_NAME,
    organizerContact: process.env.ORGANIZER_CONTACT,
  });
  return c.json({ mealWindowId, orderCount: received.length, text });
});

/** Send formatted batch to Gong Cha (Meta WhatsApp) */
admin.post("/batch/:mealWindowId/send", async (c) => {
  const mealWindowId = c.req.param("mealWindowId");
  const rows = await db.select().from(orders).where(eq(orders.mealWindowId, mealWindowId));
  const received = rows.filter((r) => r.status === "received");
  const text = formatBatchForVendor(mealWindowId, received, {
    eventName: process.env.EVENT_NAME,
    organizerContact: process.env.ORGANIZER_CONTACT,
  });
  const result = await metaVendorNotifier.sendVendorBatch({
    mealWindowId,
    text,
    orderCount: received.length,
  });
  if (!result.ok) {
    return c.json({ error: result.error }, 502);
  }
  return c.json({ ok: true, mealWindowId, orderCount: received.length });
});

/** CSV export of orders (optional Google Sheets bridge) */
admin.get("/export/orders.csv", async (c) => {
  const mealWindowId = c.req.query("mealWindowId");
  const q = mealWindowId
    ? await db.select().from(orders).where(eq(orders.mealWindowId, mealWindowId))
    : await db.select().from(orders);

  const header = [
    "id",
    "created_at",
    "wa_message_id",
    "wa_from",
    "wa_profile_name",
    "meal_window_id",
    "status",
    "body_text",
    "line_items_json",
  ];
  const escape = (s: string | number | null) => {
    const t = s === null || s === undefined ? "" : String(s);
    if (/[",\n]/.test(t)) return `"${t.replace(/"/g, '""')}"`;
    return t;
  };
  const lines = [header.join(",")];
  for (const r of q) {
    lines.push(
      [
        r.id,
        r.createdAt,
        r.waMessageId,
        r.waFrom,
        r.waProfileName,
        r.mealWindowId,
        r.status,
        r.bodyText,
        r.lineItemsJson,
      ]
        .map(escape)
        .join(","),
    );
  }
  const body = lines.join("\n");
  return c.body(body, 200, {
    "Content-Type": "text/csv; charset=utf-8",
    "Content-Disposition": 'attachment; filename="orders.csv"',
  });
});

export { admin };
