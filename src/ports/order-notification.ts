/**
 * Optional integrations (e.g. OpenClaw gateway) can implement this port
 * without coupling to Meta Cloud API internals.
 */
export type VendorBatchPayload = {
  mealWindowId: string;
  text: string;
  orderCount: number;
};

export interface OrderNotificationPort {
  /** Send a pre-formatted batch message to the vendor channel */
  sendVendorBatch(payload: VendorBatchPayload): Promise<{ ok: boolean; error?: string }>;
}
