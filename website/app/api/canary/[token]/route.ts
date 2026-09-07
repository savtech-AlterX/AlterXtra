import type { NextRequest } from "next/server";

/**
 * Canary-token tripwire. A bait credentials file (see .env.production at the
 * repo root) contains a "rotate immediately" link that actually points here.
 * Nobody should ever hit this in normal operation — the app never links to
 * it — so any request means someone found and opened that leaked file.
 *
 * Deliberately returns a boring 404 either way: the alert already fired
 * server-side, and a response that looks like a dead link doesn't tip off
 * whoever tripped it that they were caught.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const webhookUrl = process.env.CANARY_ALERT_WEBHOOK_URL;

  if (webhookUrl) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "unknown";
    const payload = {
      alert: "canary_token_triggered",
      token,
      ip,
      userAgent: request.headers.get("user-agent") ?? "unknown",
      referer: request.headers.get("referer") ?? null,
      triggeredAt: new Date().toISOString(),
    };
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      // Even if the webhook is down, still log server-side so this doesn't
      // vanish silently — check hosting logs if alerts ever stop arriving.
      console.error("Canary token triggered but webhook delivery failed:", e, payload);
    }
  } else {
    console.warn("Canary token triggered but CANARY_ALERT_WEBHOOK_URL is not set — nobody was notified. Token:", token);
  }

  return new Response("Not found", { status: 404 });
}
