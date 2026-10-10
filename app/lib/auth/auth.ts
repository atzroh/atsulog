import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

import { siteConfig } from "@/app/lib/site-config";

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET environment variable is not set.");
}

const SECRET_KEY = new TextEncoder().encode(process.env.SESSION_SECRET);

const SESSION_COOKIE_NAME = siteConfig.cookie;

const SESSION_DURATION_MS = siteConfig.sessionDurationHours * 60 * 60 * 1000;

/** Verifies a session JWT; returns its payload, or null if invalid. */
export async function decrypt(session: string | undefined) {
  if (!session) return null;
  try {
    const { payload } = await jwtVerify(session, SECRET_KEY, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch {
    return null;
  }
}

export async function createSession() {
  const expires = new Date(Date.now() + SESSION_DURATION_MS);
  const session = await new SignJWT({ authenticated: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expires)
    .sign(SECRET_KEY);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires,
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function isAuthenticated() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const payload = await decrypt(session);
  return !!payload;
}
