/**
 * Meta WhatsApp Cloud API — thin fetch-based helpers (no official Node SDK).
 * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/get-started
 */

const graphBase = "https://graph.facebook.com";

export type SendTextParams = {
  toE164: string;
  body: string;
};

export function getCloudApiConfig() {
  const token = process.env.CLOUD_API_ACCESS_TOKEN;
  const phoneNumberId = process.env.WA_PHONE_NUMBER_ID;
  const version = process.env.CLOUD_API_VERSION ?? "v23.0";
  if (!token || !phoneNumberId) {
    throw new Error("Missing CLOUD_API_ACCESS_TOKEN or WA_PHONE_NUMBER_ID");
  }
  return { token, phoneNumberId, version };
}

/** Send a plain text message (within 24h service window or per Meta rules). */
export async function sendTextMessage({ toE164, body }: SendTextParams): Promise<Response> {
  const { token, phoneNumberId, version } = getCloudApiConfig();
  const url = `${graphBase}/${version}/${phoneNumberId}/messages`;
  return fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: toE164,
      type: "text",
      text: { body },
    }),
  });
}
