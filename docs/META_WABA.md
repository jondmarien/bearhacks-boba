# Meta WhatsApp Business (Cloud API) — operator checklist

Use this when configuring the hackathon bot in [Meta for Developers](https://developers.facebook.com/).

## 1. App & WhatsApp product

1. Create or select a **Meta app** with the **WhatsApp** product.
2. Add a **WhatsApp Business Account** and a business phone number (use the **test number** while developing).

## 2. Tokens

- Prefer a **long-lived** system user token for production (`CLOUD_API_ACCESS_TOKEN`).
- Note **`WA_PHONE_NUMBER_ID`** (Graph API “from” id) and **`CLOUD_API_VERSION`** (e.g. `v23.0`).

## 3. Webhook

1. Expose **HTTPS** `GET` + `POST` on `/webhook/whatsapp` (tunnel: Cloudflare, ngrok, etc.).
2. In the app dashboard, set:
   - **Callback URL** — your public base + `/webhook/whatsapp`
   - **Verify token** — must match `WEBHOOK_VERIFICATION_TOKEN` in `.env`
3. Subscribe to **`messages`** (and optionally message status fields).

## 4. Signature verification

- Set **`M4D_APP_SECRET`** (app secret from the app dashboard).
- The server validates `X-Hub-Signature-256` on every `POST`.
- Local testing only: set `WEBHOOK_SKIP_SIGNATURE_VERIFY=true` (never in production).

## 5. Messaging rules (Gong Cha)

- **User-initiated**: After someone messages your WABA number, you typically have a **24-hour session** for **non-template** replies.
- **Store owner**: If Gong Cha has **not** messaged your number recently, you may need an **approved template** for the first outbound, or do a **pre-event “hello”** from their phone to your WABA to open the session.
- **Cost**: Conversations are billed per Meta’s [pricing](https://developers.facebook.com/docs/whatsapp/pricing/) for your region; hackathon volume is usually small.

## 6. Env mapping

| Dashboard / Meta        | `.env` variable                 |
| ----------------------- | ------------------------------- |
| Phone number ID         | `WA_PHONE_NUMBER_ID`          |
| Permanent access token    | `CLOUD_API_ACCESS_TOKEN`      |
| App secret              | `M4D_APP_SECRET`               |
| Webhook verify token    | `WEBHOOK_VERIFICATION_TOKEN`  |
| Gong Cha E.164 (admin send) | `GONGCHA_RECIPIENT_E164`   |
