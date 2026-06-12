"use server";

import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import xss from "xss";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const ALLOWED_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export async function submitPublicTicketAction(formData: FormData) {
  // Rate limiting (this is a public, unauthenticated endpoint).
  const ip = getClientIp(await headers());
  if (!rateLimit(`ticket:${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS).allowed) {
    throw new Error("Too many requests. Please try again later.");
  }

  // Sanitize all input (parity with the audit form).
  const sanitize = (val: FormDataEntryValue | null) => xss(String(val ?? "").trim());
  const clientName = sanitize(formData.get("clientName"));
  const title = sanitize(formData.get("title"));
  const description = sanitize(formData.get("description"));
  const rawPriority = sanitize(formData.get("priority")) || "MEDIUM";
  const priority = ALLOWED_PRIORITIES.includes(rawPriority) ? rawPriority : "MEDIUM";

  if (!clientName || !title || !description) {
    throw new Error("Missing required fields");
  }

  await prisma.ticket.create({
    data: {
      clientName,
      title,
      description,
      priority,
      status: "OPEN"
    }
  });
}
