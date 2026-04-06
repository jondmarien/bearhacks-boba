/** Narrow types for Meta WhatsApp webhook `messages` entries */

export type InboundTextMessage = {
  id: string;
  from: string;
  type: "text";
  text: { body: string };
};

export type InboundUnknownMessage = {
  id: string;
  from: string;
  type: string;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

/** Extract text messages from a webhook POST JSON body */
export function extractInboundTextMessages(payload: unknown): {
  messages: InboundTextMessage[];
  contactsByWaId: Map<string, string>;
} {
  const contactsByWaId = new Map<string, string>();
  const messages: InboundTextMessage[] = [];

  if (!isRecord(payload) || payload.object !== "whatsapp_business_account") {
    return { messages, contactsByWaId };
  }

  const entry = payload.entry;
  if (!Array.isArray(entry)) return { messages, contactsByWaId };

  for (const ent of entry) {
    if (!isRecord(ent)) continue;
    const changes = ent.changes;
    if (!Array.isArray(changes)) continue;
    for (const ch of changes) {
      if (!isRecord(ch)) continue;
      const value = ch.value;
      if (!isRecord(value)) continue;

      const contacts = value.contacts;
      if (Array.isArray(contacts)) {
        for (const c of contacts) {
          if (!isRecord(c)) continue;
          const wa = c.wa_id;
          const profile = c.profile;
          if (typeof wa === "string" && isRecord(profile) && typeof profile.name === "string") {
            contactsByWaId.set(wa, profile.name);
          }
        }
      }

      const msgs = value.messages;
      if (!Array.isArray(msgs)) continue;
      for (const m of msgs) {
        if (!isRecord(m)) continue;
        const id = m.id;
        const from = m.from;
        const type = m.type;
        const text = m.text;
        if (typeof id !== "string" || typeof from !== "string" || type !== "text") continue;
        if (!isRecord(text) || typeof text.body !== "string") continue;
        messages.push({ id, from, type: "text", text: { body: text.body } });
      }
    }
  }

  return { messages, contactsByWaId };
}
