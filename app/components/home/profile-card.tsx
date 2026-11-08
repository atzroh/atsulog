import { ArrowRight, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { GitHubProfile } from "@/app/lib/github/github-profile";
import { siteConfig } from "@/app/lib/site-config";
import { HomeSection } from "@/app/components/home/home-section";

/** The author's GitHub profile; fields left blank on GitHub are skipped. */
export function ProfileCard({ profile }: { profile: GitHubProfile }) {
  const { login, name, bio, location, avatarUrl } = profile;

  return (
    <HomeSection title="Profile">
      <div className="flex items-center gap-5">
        <Image
          src={avatarUrl}
          alt=""
          width={64}
          height={64}
          className="size-16 shrink-0 rounded-full ring-1 ring-sky-200 ring-offset-2"
        />
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-lg font-bold tracking-tight">{name ?? login}</p>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-gray-600">
            {bio && <span className="whitespace-pre-line">{bio}</span>}
            {location && (
              <span className="inline-flex items-center gap-1 text-muted">
                <MapPin className="size-3.5" aria-hidden="true" />
                {location}
              </span>
            )}
          </p>
        </div>
        <Link
          href={`/articles/${siteConfig.aboutSlug}`}
          className="group inline-flex shrink-0 items-center gap-1 rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700 hover:border-sky-500 hover:bg-sky-500 hover:text-white"
        >
          About
          <ArrowRight
            className="size-3 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      </div>
    </HomeSection>
  );
}
