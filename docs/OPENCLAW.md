# OpenClaw (optional)

This service uses **Meta WhatsApp Cloud API** directly for reliability and hackathon-friendly hosting.

**OpenClaw** often connects via **WhatsApp Web (Baileys)** or other gateways — that is a **different** integration than the Cloud API and usually **does not share** the same phone number setup.

## Extension point

The port [`OrderNotificationPort`](../src/ports/order-notification.ts) describes how to send a **vendor batch** (formatted text + metadata). The default implementation uses Cloud API (`sendTextMessage` to `GONGCHA_RECIPIENT_E164`).

To experiment with OpenClaw later:

1. Implement `OrderNotificationPort` to call your OpenClaw gateway (HTTP RPC, CLI, etc.) instead of Meta’s Graph API.
2. Wire that implementation where `metaVendorNotifier` is constructed in [`src/routes/admin.ts`](../src/routes/admin.ts), or inject via a small factory.

Keep Cloud API as the **primary** path for hackers → WABA; use OpenClaw only if you explicitly want a separate agent workflow.
