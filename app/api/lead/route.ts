import { NextResponse } from "next/server";

// Server-side proxy to GoHighLevel (or any CRM) webhook.
// Keeps the real URL out of the browser and lets you swap it via .env.local.
//
// Required env: GHL_WEBHOOK_URL=https://services.leadconnectorhq.com/hooks/...

export const runtime = "nodejs";

type LeadPayload = {
  stage: "lead" | "survey_complete";
  firstName?: string;
  email?: string;
  phone?: string;
  answers?: Record<string, string>;
  recommended_product?: string;
  source?: string;
  submittedAt?: string;
};

export async function POST(request: Request) {
  const webhookUrl = process.env.GHL_WEBHOOK_URL;

  let body: LeadPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  // Always stamp these so the CRM record is consistent.
  const enriched: LeadPayload = {
    source: "mbranch-funnel",
    submittedAt: new Date().toISOString(),
    ...body,
  };

  // If no webhook is configured yet, accept the lead so the funnel keeps working
  // in dev. Log it so you can verify the payload.
  if (!webhookUrl) {
    console.warn("[api/lead] GHL_WEBHOOK_URL not set — payload not forwarded:", enriched);
    return NextResponse.json({ ok: true, forwarded: false });
  }

  try {
    const upstream = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(enriched),
    });

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => "");
      console.error("[api/lead] Upstream error:", upstream.status, text);
      // Don't surface upstream errors to the user — we don't want to block the funnel.
      return NextResponse.json({ ok: true, forwarded: false });
    }

    return NextResponse.json({ ok: true, forwarded: true });
  } catch (err) {
    console.error("[api/lead] Network error forwarding lead:", err);
    return NextResponse.json({ ok: true, forwarded: false });
  }
}
