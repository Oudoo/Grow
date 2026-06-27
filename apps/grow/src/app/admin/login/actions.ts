"use server";

import { login } from "@/lib/login";
import { headers } from "next/headers";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export interface LoginResult {
  success: boolean;
  error?: string;
  landing?: string;
}

export async function loginAction(email: string, password: string): Promise<LoginResult> {
  const ip = getClientIp(await headers());
  if (!rateLimit(`login:${ip}`, MAX_ATTEMPTS, WINDOW_MS).allowed) {
    return { success: false, error: "Too many attempts. Please try again later." };
  }

  const result = await login(email, password);
  if (!result.ok) {
    return { success: false, error: result.error ?? "Invalid email or password." };
  }
  return { success: true, landing: result.landing ?? "/admin" };
}
