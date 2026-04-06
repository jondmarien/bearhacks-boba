/** Gong Cha tentative menu (BearHacks food team). */

export type DrinkDef = { id: string; label: string };
export type ToppingDef = { id: string; label: string };

export const DRINKS: DrinkDef[] = [
  { id: "brown-sugar-oolong-milk-tea", label: "Brown sugar oolong milk tea" },
  { id: "classic-pearl-milk-tea", label: "Classic pearl milk tea" },
  { id: "mango-green-tea", label: "Mango Green tea" },
  { id: "qq-peach-green-tea", label: "QQ Peach Green tea" },
  { id: "lychee-oolong-tea", label: "Lychee Oolong tea" },
  { id: "oreo-caramel-coffee-milk-tea", label: "Oreo/Caramel coffee milk tea" },
];

export const TOPPINGS: ToppingDef[] = [
  { id: "pearls", label: "Pearls" },
  { id: "coconut-jelly", label: "Coconut jelly" },
  { id: "grass-jelly", label: "Grass jelly" },
  { id: "white-peach-jelly", label: "White Peach jelly (if available)" },
];

const drinkByLabel = new Map(DRINKS.map((d) => [d.label.toLowerCase(), d]));
const toppingByLabel = new Map(TOPPINGS.map((t) => [t.label.toLowerCase(), t]));

export function formatMenuText(): string {
  const drinkLines = DRINKS.map((d, i) => `${i + 1}. ${d.label}`).join("\n");
  const topLines = TOPPINGS.map((t) => `• ${t.label}`).join("\n");
  return (
    `BearHacks boba menu\n\n` +
    `Drinks:\n${drinkLines}\n\n` +
    `Toppings:\n${topLines}\n\n` +
    `Reply with your order, e.g.:\n` +
    `1x Brown sugar oolong milk tea, pearls, 50% sugar`
  );
}

export type ParsedLineItem = {
  quantity: number;
  drinkId: string;
  drinkLabel: string;
  toppingIds: string[];
  notes: string[];
};

/** Very small parser: quantity + drink name + optional toppings/notes after commas */
export function parseOrderLine(text: string): { items: ParsedLineItem[]; errors: string[] } {
  const errors: string[] = [];
  const trimmed = text.trim();
  if (!trimmed) {
    errors.push("Empty message");
    return { items: [], errors };
  }

  const lower = trimmed.toLowerCase();
  if (lower === "menu" || lower === "help" || lower === "hi") {
    return { items: [], errors: [] };
  }

  const parts = trimmed.split(",").map((p) => p.trim());
  const first = parts[0] ?? "";
  const qtyMatch = /^(\d+)\s*x?\s*(.+)$/i.exec(first);
  if (!qtyMatch) {
    errors.push("Start with quantity and drink, e.g. 1x Brown sugar oolong milk tea");
    return { items: [], errors };
  }

  const quantity = Number(qtyMatch[1]);
  let drinkPart = qtyMatch[2]?.trim() ?? "";
  if (!Number.isFinite(quantity) || quantity < 1) {
    errors.push("Invalid quantity");
    return { items: [], errors };
  }

  let drink = drinkByLabel.get(drinkPart.toLowerCase());
  if (!drink) {
    for (const d of DRINKS) {
      if (drinkPart.toLowerCase().includes(d.label.toLowerCase()) || d.label.toLowerCase().includes(drinkPart.toLowerCase())) {
        drink = d;
        break;
      }
    }
  }
  if (!drink) {
    errors.push(`Unknown drink: "${drinkPart}". Say "menu" for options.`);
    return { items: [], errors };
  }

  const toppingIds: string[] = [];
  const notes: string[] = [];
  for (let i = 1; i < parts.length; i++) {
    const p = parts[i];
    if (!p) continue;
    const pl = p.toLowerCase();
    let matched = false;
    for (const t of TOPPINGS) {
      if (pl.includes(t.label.toLowerCase()) || t.label.toLowerCase().includes(pl)) {
        toppingIds.push(t.id);
        matched = true;
        break;
      }
    }
    if (!matched) notes.push(p);
  }

  return {
    items: [
      {
        quantity,
        drinkId: drink.id,
        drinkLabel: drink.label,
        toppingIds,
        notes,
      },
    ],
    errors: [],
  };
}
