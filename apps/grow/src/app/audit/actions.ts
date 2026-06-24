"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import xss from "xss";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

const RATE_LIMIT_MAX = 5; // max 5 submissions
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_PRIORITY = ["HOT", "WARM", "COLD", "MEDIUM"];
const ALLOWED_SOURCE = ["Website", "Referral", "LinkedIn", "WhatsApp", "Direct", "Audit"];

export type AuditFormResult = { success: boolean; error?: string };

export async function submitAuditForm(formData: FormData): Promise<AuditFormResult> {
  try {
    // 1. Rate limiting
    const ip = getClientIp(await headers());
    if (!rateLimit(`audit:${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS).allowed) {
      return { success: false, error: "Too many requests. Please try again in a few minutes." };
    }

    // 2. Validation & sanitisation
    const sanitize = (val: FormDataEntryValue | null) => xss(String(val ?? "").trim());
    const name = sanitize(formData.get("name"));
    const email = sanitize(formData.get("email"));
    const company = sanitize(formData.get("company"));
    const message = sanitize(formData.get("message"));

    if (!name || !company) {
      return { success: false, error: "Please provide your name and company." };
    }
    if (!EMAIL_RE.test(email)) {
      return { success: false, error: "Please provide a valid email address." };
    }

    const rawPriority = sanitize(formData.get("priority"));
    const rawSource = sanitize(formData.get("source"));
    const priority = ALLOWED_PRIORITY.includes(rawPriority) ? rawPriority : "MEDIUM";
    const source = ALLOWED_SOURCE.includes(rawSource) ? rawSource : "Website";

    // 3. Persist
    await prisma.submission.create({
      data: {
        name,
        email,
        company,
        message,
        status: "new",
        priority,
        source,
      },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (e) {
    console.error("submitAuditForm failed:", e);
    return {
      success: false,
      error: "We couldn't save your request right now. Please try again shortly.",
    };
  }
}
