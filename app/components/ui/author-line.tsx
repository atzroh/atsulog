import { MapPin } from "lucide-react";
import Image from "next/image";
import type { GitHubProfile } from "@/app/lib/github/github-profile";

/** "Written by" the author, from their GitHub profile; fields left blank on GitHub are skipped. */
export function AuthorLine({ profile }: { profile: GitHubProfile }) {
  const { login, name, bio, location, avatarUrl } = profile;

  return (
    <p className="mb-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
      <span className="inline-flex items-center gap-2">
        Written by
        <Image
          src={avatarUrl}
          alt=""
          width={24}
          height={24}
          className="size-6 rounded-full"
        />
        <span className="font-medium text-foreground">{name ?? login}</span>
      </span>
      {bio && <span className="whitespace-pre-line">{bio}</span>}
      {location && (
        <span className="inline-flex items-center gap-1">
          <MapPin className="size-3.5" aria-hidden="true" />
          {location}
        </span>
      )}
    </p>
  );
}
