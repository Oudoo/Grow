import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

interface LeadPayload {
  name?: string;
  company?: string;
  email?: string;
  message?: string;
}

// This endpoint is public (called by the marketing contact form) and triggers a
// paid outbound WhatsApp message. Cap per-IP volume and clamp field lengths so
// it cannot be turned into a spam/cost-amplification vector.
const MAX_LEADS_PER_WINDOW = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const clamp = (s: string, n: number) => s.slice(0, n).replace(/[\r\n]+/g, " ").trim();

export async function POST(request: Request) {
  const ip = getClientIp(await headers());
  if (!rateLimit(`whatsapp:${ip}`, MAX_LEADS_PER_WINDOW, WINDOW_MS).allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  let data: LeadPayload;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const name = typeof data.name === "string" ? clamp(data.name, 120) : "";
  const company = typeof data.company === "string" ? clamp(data.company, 120) : "";
  const email = typeof data.email === "string" ? clamp(data.email, 160) : "";
  const message = typeof data.message === "string" ? data.message.slice(0, 1000).trim() : "";
  if (!name || !company) {
    return NextResponse.json(
      { success: false, error: "Missing required fields: name, company" },
      { status: 400 }
    );
  }

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;
  const to = process.env.GROW_SALES_WHATSAPP_TO;

  const body =
    `*NEW GROW LEAD*\n` +
    `Name: ${name}\n` +
    `Company: ${company}\n` +
    (email ? `Email: ${email}\n` : "") +
    (message ? `Message: ${message}` : "");

  // If Twilio isn't configured, log the lead instead of failing. This keeps the
  // endpoint functional in development and degrades gracefully in production.
  if (!sid || !token || !from || !to) {
    console.warn("[whatsapp] Twilio not configured; logging lead instead of sending:\n" + body);
    return NextResponse.json({ success: true, delivered: false, reason: "twilio_not_configured" });
  }

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ From: from, To: to, Body: body }),
      }
    );

    if (!res.ok) {
      const detail = await res.text();
      console.error("[whatsapp] Twilio API error:", res.status, detail);
      return NextResponse.json(
        { success: false, error: "Failed to send WhatsApp message" },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, delivered: true });
  } catch (error) {
    console.error("[whatsapp] Webhook error:", error);
    return NextResponse.json({ success: false, error: "Failed to process webhook" }, { status: 500 });
  }
}
