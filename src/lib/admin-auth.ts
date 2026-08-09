import { createHmac, createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "lagusion_admin";
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

function sessionToken(): string {
  const secret = process.env.AUTH_SECRET || "";
  return secret
    ? createHmac("sha256", secret).update("lagusion-admin").digest("hex")
    : "";
}

function safeEqual(left: string, right: string): boolean {
  const leftHash = createHash("sha256").update(left).digest();
  const rightHash = createHash("sha256").update(right).digest();
  return timingSafeEqual(leftHash, rightHash);
}

export function verifyAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || "";
  return Boolean(expected && process.env.AUTH_SECRET && safeEqual(password, expected));
}

export function verifyAdminToken(token: string): boolean {
  const expected = sessionToken();
  return Boolean(expected && token && safeEqual(token, expected));
}

export function createAdminToken(): string {
  return sessionToken();
}

export async function isAdmin(): Promise<boolean> {
  return verifyAdminToken((await cookies()).get(ADMIN_COOKIE)?.value || "");
}
