/**
 * Meal windows — BearHacks 2026 (approximate; adjust with food team).
 * Times are US Pacific (PDT, UTC-7) for late April 2026.
 */
export type MealWindowDef = {
  id: string;
  label: string;
  /** ISO 8601 instant when ordering opens */
  opensIso: string;
  /** ISO 8601 instant when ordering closes (before batch send) */
  closesIso: string;
  pickupHint: string;
};

/** Fixed schedule from plan (tune opens/closes to real runbook). */
export const MEAL_WINDOWS: MealWindowDef[] = [
  {
    id: "fri-dinner",
    label: "Friday dinner",
    opensIso: "2026-04-24T17:00:00-07:00",
    closesIso: "2026-04-24T18:25:00-07:00",
    pickupHint: "~7:30–7:45 PM",
  },
  {
    id: "fri-midnight",
    label: "Friday midnight snack",
    opensIso: "2026-04-24T20:00:00-07:00",
    closesIso: "2026-04-24T21:30:00-07:00",
    pickupHint: "~10:45–11:00 PM",
  },
  {
    id: "sat-lunch",
    label: "Saturday lunch",
    opensIso: "2026-04-25T08:00:00-07:00",
    closesIso: "2026-04-25T11:45:00-07:00",
    pickupHint: "~1:00–1:15 PM",
  },
  {
    id: "sat-dinner",
    label: "Saturday dinner",
    opensIso: "2026-04-25T15:00:00-07:00",
    closesIso: "2026-04-25T18:25:00-07:00",
    pickupHint: "~7:30–7:45 PM",
  },
  {
    id: "sat-midnight",
    label: "Saturday midnight snack",
    opensIso: "2026-04-25T20:00:00-07:00",
    closesIso: "2026-04-25T21:30:00-07:00",
    pickupHint: "~10:45–11:00 PM",
  },
  {
    id: "sun-lunch",
    label: "Sunday lunch",
    opensIso: "2026-04-25T23:00:00-07:00",
    closesIso: "2026-04-26T10:45:00-07:00",
    pickupHint: "~12:00–12:15 PM",
  },
  {
    id: "sun-ceremony",
    label: "Sunday closing ceremony snack",
    opensIso: "2026-04-26T12:30:00-07:00",
    closesIso: "2026-04-26T12:55:00-07:00",
    pickupHint: "~2:00–2:15 PM",
  },
];

export function getActiveMealWindow(now: Date = new Date()): MealWindowDef | null {
  const t = now.getTime();
  for (const w of MEAL_WINDOWS) {
    const open = Date.parse(w.opensIso);
    const close = Date.parse(w.closesIso);
    if (t >= open && t <= close) return w;
  }
  return null;
}

export function getMealWindowById(id: string): MealWindowDef | undefined {
  return MEAL_WINDOWS.find((w) => w.id === id);
}
