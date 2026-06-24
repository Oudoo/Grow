"use server";

import { login } from "@/lib/auth";
import { headers } from "next/headers";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export interface LoginResult {
  success: boolean;
  error?: string;
}

export async function loginAction(password: string): Promise<LoginResult> {
  const ip = getClientIp(await headers());
  if (!rateLimit(`login:${ip}`, MAX_ATTEMPTS, WINDOW_MS).allowed) {
    return { success: false, error: "Too many attempts. Please try again later." };
  }

  const ok = await login(password);
  if (!ok) {
    return { success: false, error: "Invalid security access code." };
  }
  return { success: true };
}
