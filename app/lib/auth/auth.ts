import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

import { siteConfig } from "@/app/lib/site-config";

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET environment variable is not set.");
}

const SECRET_KEY = new TextEncoder().encode(process.env.SESSION_SECRET);

const SESSION_COOKIE_NAME = siteConfig.cookie;

const SESSION_DURATION_MS = siteConfig.sessionDurationHours * 60 * 60 * 1000;

/**
 * Encrypts a payload into a JWT.
 * @param payload - The data to include in the session.
 * @param expires - When the token should stop being accepted.
 * @returns The encrypted JWT string.
 */
async function encrypt(payload: Record<string, unknown>, expires: Date) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expires)
    .sign(SECRET_KEY);
}

/**
 * Decrypts and verifies a JWT.
 * @param session - The JWT string to verify.
 * @returns The decrypted payload or null if invalid.
 */
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

/**
 * Creates a new session and sets the session cookie.
 */
export async function createSession() {
  const expires = new Date(Date.now() + SESSION_DURATION_MS);
  const session = await encrypt({ authenticated: true }, expires);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expires,
    sameSite: "lax",
    path: "/",
  });
}

/**
 * Deletes the session cookie.
 */
export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Checks if the current request has a valid session.
 * @returns True if authenticated, false otherwise.
 */
export async function isAuthenticated() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const payload = await decrypt(session);
  return !!payload;
}
