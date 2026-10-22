"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { headers } from "next/headers";
import { createSession, deleteSession } from "@/app/lib/auth/auth";
import { siteConfig } from "@/app/lib/site-config";
import { redirect } from "next/navigation";

const MAX_FAILURES = siteConfig.loginMaxFailures;
const LOCK_WINDOW_MS = siteConfig.loginLockMinutes * 60 * 1000;
/** Past this many clients, expired entries are swept. */
const SWEEP_THRESHOLD = 10_000;

/** Failed attempts per client, in memory: a restart clears them. */
const failures = new Map<string, { count: number; resetAt: number }>();

/** Checks the password against ADMIN_PASSWORD (.env.local or the environment). */
export async function loginAction(formData: FormData) {
  const client = await clientAddress();
  if (isLocked(client)) {
    redirect("/login?error=locked");
  }

  const password = formData.get("password");

  if (typeof password === "string" && passwordMatches(password)) {
    failures.delete(client);
    await createSession();
    redirect("/edit");
  }
  recordFailure(client);
  redirect("/login?error=invalid");
}

export async function logoutAction() {
  await deleteSession();
  redirect("/login");
}

/** The rightmost X-Forwarded-For entry, the one the reverse proxy appends. */
async function clientAddress(): Promise<string> {
  const forwarded = (await headers()).get("x-forwarded-for");
  return forwarded?.split(",").at(-1)?.trim() || "unknown";
}

/** Hashed first, as timingSafeEqual needs equal lengths. */
function passwordMatches(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;

  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(password), digest(expected));
}

function isLocked(client: string): boolean {
  const entry = failures.get(client);
  if (!entry) return false;
  if (entry.resetAt <= Date.now()) {
    failures.delete(client);
    return false;
  }
  return entry.count >= MAX_FAILURES;
}

function recordFailure(client: string) {
  const now = Date.now();
  const entry = failures.get(client);
  if (entry && entry.resetAt > now) {
    entry.count++;
    return;
  }

  if (failures.size >= SWEEP_THRESHOLD) {
    for (const [key, value] of failures) {
      if (value.resetAt <= now) failures.delete(key);
    }
  }
  failures.set(client, { count: 1, resetAt: now + LOCK_WINDOW_MS });
}
