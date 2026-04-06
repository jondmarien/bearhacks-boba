import type { Order } from "../db/schema";
import { getMealWindowById } from "./meal-windows";

export type BatchFormatOptions = {
  eventName?: string;
  organizerContact?: string;
};

function lineItemsSummary(lineItemsJson: string | null): string {
  if (!lineItemsJson) return "(no line items)";
  try {
    const parsed = JSON.parse(lineItemsJson) as unknown;
    if (!Array.isArray(parsed)) return lineItemsJson;
    return parsed
      .map((row) => {
        if (typeof row === "object" && row !== null && "summary" in row && typeof (row as { summary: unknown }).summary === "string") {
          return (row as { summary: string }).summary;
        }
        return JSON.stringify(row);
      })
      .join("; ");
  } catch {
    return lineItemsJson;
  }
}

/** Aggregate orders for Gong Cha — plain text for WhatsApp */
export function formatBatchForVendor(mealWindowId: string, rows: Order[], opts: BatchFormatOptions = {}): string {
  const w = getMealWindowById(mealWindowId);
  const eventName = opts.eventName ?? "BearHacks 2026";
  const header = `${eventName} — Gong Cha batch`;
  const windowLine = w ? `${w.label} — pickup ${w.pickupHint}` : `Window: ${mealWindowId}`;
  const count = rows.length;
  const lines = rows.map((r, i) => {
    const who = r.waProfileName ? `${r.waProfileName} (${r.waFrom})` : r.waFrom;
    const li = lineItemsSummary(r.lineItemsJson);
    return `${i + 1}) ${who} — ${li}`;
  });

  const footer = opts.organizerContact ? `\n\nOrganizer: ${opts.organizerContact}` : "";

  return [header, windowLine, `Orders: ${count}`, "", ...lines, footer].filter(Boolean).join("\n");
}
