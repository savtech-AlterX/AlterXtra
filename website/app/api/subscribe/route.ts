const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Provider-agnostic on purpose: forwards to whatever webhook URL
 * EMAIL_CAPTURE_WEBHOOK_URL points at (Zapier/Make, a Mailchimp/ConvertKit
 * "add subscriber" webhook, your own backend — anything that accepts a JSON
 * POST). Swap this out for a direct SDK call if you standardize on one
 * provider later.
 */
export async function POST(request: Request) {
  let email: unknown;
  try {
    ({ email } = await request.json());
  } catch {
    return Response.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  if (typeof email !== "string" || !EMAIL_RE.test(email)) {
    return Response.json({ ok: false, error: "Enter a valid email address." }, { status: 400 });
  }

  const webhookUrl = process.env.EMAIL_CAPTURE_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn("EMAIL_CAPTURE_WEBHOOK_URL is not set — signup was accepted but not forwarded anywhere:", email);
    return Response.json({ ok: true });
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source: "alterx-website", capturedAt: new Date().toISOString() }),
    });
    if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
    return Response.json({ ok: true });
  } catch (e) {
    console.error("Email capture webhook failed:", e);
    return Response.json({ ok: false, error: "Could not save your email right now. Please try again." }, { status: 502 });
  }
}
