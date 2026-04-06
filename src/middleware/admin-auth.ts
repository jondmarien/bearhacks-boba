import type { Context, Next } from "hono";

export function requireAdmin() {
  return async (c: Context, next: Next) => {
    const key = process.env.ADMIN_API_KEY;
    if (!key) {
      return c.json({ error: "ADMIN_API_KEY not configured" }, 503);
    }
    const auth = c.req.header("Authorization");
    const bearer = auth?.startsWith("Bearer ") ? auth.slice("Bearer ".length) : undefined;
    const headerKey = c.req.header("X-Admin-Key");
    const token = bearer ?? headerKey;
    if (!token || token !== key) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    await next();
  };
}
