import "server-only";

import { siteConfig } from "@/app/lib/site-config";

export type GitHubProfile = {
  login: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  avatarUrl: string;
};

/** Fields of GET /users/{username} that the profile uses. */
type UserResponse = {
  login: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  avatar_url: string;
};

/** Once a day: unauthenticated calls are capped at 60 an hour per IP. */
const REVALIDATE_SECONDS = 60 * 60 * 24;

/** Keeps a slow GitHub from holding up the page. */
const TIMEOUT_MS = 5000;

/** The author's public GitHub profile, or null when it can't be fetched. */
export async function getGitHubProfile(): Promise<GitHubProfile | null> {
  try {
    const res = await fetch(
      `https://api.github.com/users/${siteConfig.github}`,
      {
        headers: { Accept: "application/vnd.github+json" },
        next: { revalidate: REVALIDATE_SECONDS },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      },
    );
    if (!res.ok) return null;
    const user = (await res.json()) as UserResponse;
    return {
      login: user.login,
      name: user.name,
      bio: user.bio,
      location: user.location,
      avatarUrl: user.avatar_url,
    };
  } catch {
    return null;
  }
}
