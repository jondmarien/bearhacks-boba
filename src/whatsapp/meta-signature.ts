import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Verify Meta `X-Hub-Signature-256` for webhook POST body (raw string).
 * @see https://developers.facebook.com/docs/graph-api/webhooks/getting-started
 */
export function verifyMetaSignature(rawBody: string, signatureHeader: string | undefined, appSecret: string): boolean {
  if (!signatureHeader || !signatureHeader.startsWith("sha256=")) return false;
  const expectedHex = signatureHeader.slice("sha256=".length);
  const hmac = createHmac("sha256", appSecret);
  hmac.update(rawBody, "utf8");
  const digest = hmac.digest();
  let expected: Buffer;
  try {
    expected = Buffer.from(expectedHex, "hex");
  } catch {
    return false;
  }
  if (expected.length !== digest.length) return false;
  return timingSafeEqual(digest, expected);
}

export function shouldVerifyWebhook(): boolean {
  if (process.env.WEBHOOK_SKIP_SIGNATURE_VERIFY === "true") return false;
  return Boolean(process.env.M4D_APP_SECRET);
}
