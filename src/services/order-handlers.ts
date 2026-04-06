import { eq } from "drizzle-orm";
import { db } from "../db";
import { orders, type NewOrder } from "../db/schema";
import { formatMenuText, parseOrderLine } from "../domain/menu";
import { getActiveMealWindow } from "../domain/meal-windows";
import { sendTextMessage } from "../whatsapp/cloud-api";

async function sendReply(toE164: string, body: string): Promise<void> {
  if (!process.env.CLOUD_API_ACCESS_TOKEN || !process.env.WA_PHONE_NUMBER_ID) {
    console.warn("whatsapp outbound skipped: set CLOUD_API_ACCESS_TOKEN and WA_PHONE_NUMBER_ID");
    return;
  }
  try {
    const res = await sendTextMessage({ toE164, body });
    if (!res.ok) {
      console.error("whatsapp send failed", res.status, await res.text());
    }
  } catch (e) {
    console.error("whatsapp send error", e);
  }
}

function lineItemSummary(item: ReturnType<typeof parseOrderLine>["items"][0]): { summary: string } {
  const tops = item.toppingIds.length ? ` + ${item.toppingIds.join(", ")}` : "";
  const notes = item.notes.length ? ` (${item.notes.join(", ")})` : "";
  return { summary: `${item.quantity}× ${item.drinkLabel}${tops}${notes}` };
}

async function insertOrder(values: NewOrder): Promise<boolean> {
  try {
    await db.insert(orders).values(values);
    return true;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("UNIQUE") || msg.includes("unique")) return false;
    throw e;
  }
}

export async function handleInboundTextMessage(input: {
  waMessageId: string;
  from: string;
  body: string;
  profileName?: string;
}): Promise<void> {
  const existing = await db.select().from(orders).where(eq(orders.waMessageId, input.waMessageId)).limit(1);
  if (existing.length > 0) return;

  const lower = input.body.trim().toLowerCase();
  if (lower === "menu" || lower === "help" || lower === "hi") {
    const ok = await insertOrder({
      createdAt: Date.now(),
      waMessageId: input.waMessageId,
      waFrom: input.from,
      waProfileName: input.profileName ?? null,
      mealWindowId: null,
      bodyText: input.body,
      lineItemsJson: null,
      status: "info",
    });
    if (!ok) return;
    await sendReply(input.from, formatMenuText());
    return;
  }

  const window = getActiveMealWindow();
  const parsed = parseOrderLine(input.body);

  if (parsed.errors.length && parsed.items.length === 0) {
    const ok = await insertOrder({
      createdAt: Date.now(),
      waMessageId: input.waMessageId,
      waFrom: input.from,
      waProfileName: input.profileName ?? null,
      mealWindowId: window?.id ?? null,
      bodyText: input.body,
      lineItemsJson: null,
      status: "parse_error",
    });
    if (!ok) return;
    await sendReply(input.from, `${parsed.errors.join(" ")}\n\n${formatMenuText()}`);
    return;
  }

  if (!window) {
    const ok = await insertOrder({
      createdAt: Date.now(),
      waMessageId: input.waMessageId,
      waFrom: input.from,
      waProfileName: input.profileName ?? null,
      mealWindowId: null,
      bodyText: input.body,
      lineItemsJson: JSON.stringify(parsed.items.map(lineItemSummary)),
      status: "outside_window",
    });
    if (!ok) return;
    await sendReply(input.from, "Ordering is closed for this meal window. Check the schedule with organizers.");
    return;
  }

  const lineItemsJson = JSON.stringify(parsed.items.map(lineItemSummary));

  const ok = await insertOrder({
    createdAt: Date.now(),
    waMessageId: input.waMessageId,
    waFrom: input.from,
    waProfileName: input.profileName ?? null,
    mealWindowId: window.id,
    bodyText: input.body,
    lineItemsJson,
    status: "received",
  });
  if (!ok) return;

  await sendReply(input.from, `Got it — ${window.label}. Pickup ${window.pickupHint}. Reply MENU anytime.`);
}
