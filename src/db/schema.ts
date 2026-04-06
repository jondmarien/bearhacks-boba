import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

/** Inbound WhatsApp order line persisted for batching / Gong Cha handoff. */
export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  /** Unix ms when the row was created */
  createdAt: integer("created_at", { mode: "number" }).notNull(),
  /** Meta inbound message id (dedup) */
  waMessageId: text("wa_message_id").unique(),
  /** E.164 sender, e.g. 15551234567 */
  waFrom: text("wa_from").notNull(),
  /** Optional display name from WhatsApp profile when available */
  waProfileName: text("wa_profile_name"),
  /** Meal window key from config (e.g. fri-dinner); nullable until parser assigns */
  mealWindowId: text("meal_window_id"),
  /** Raw user message text */
  bodyText: text("body_text").notNull(),
  /** Structured line items JSON (parsed drink + toppings) */
  lineItemsJson: text("line_items_json"),
  /** received | info | parse_error | outside_window | cancelled */
  status: text("status").notNull().default("received"),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
