"use client";

import { useSyncExternalStore } from "react";
import { Newspaper, BookOpen, Folder, Tag, Calendar, Eye } from "lucide-react";
import { getTaxonomies } from "@/app/lib/article/article-utils";
import { siteConfig } from "@/app/lib/site-config";
import type { ArticleMetadata } from "@/app/lib/article/article-types";

/** Latest clock reading shared by every subscriber. Empty until the first tick. */
let clockSnapshot = "";

/**
 * Subscribes to the wall clock, notifying React only when the displayed time changes.
 * @param onChange - Callback invoked when the snapshot becomes stale.
 * @returns An unsubscribe function that stops the timer.
 */
function subscribeToClock(onChange: () => void) {
  const tick = () => {
    const next = new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
    if (next === clockSnapshot) return;
    clockSnapshot = next;
    onChange();
  };
  tick();
  const timer = setInterval(tick, 1000);
  return () => clearInterval(timer);
}

/**
 * Reads the current time on the client. Renders empty on the server and during
 * hydration so the markup stays identical on both sides.
 * @returns The current time as HH:MM, or an empty string before hydration.
 */
function useCurrentTime() {
  return useSyncExternalStore(
    subscribeToClock,
    () => clockSnapshot,
    () => "",
  );
}

/**
 * A Zsh terminal-style display for site statistics.
 * Mimics real shell output with consistent font and prompt.
 * @param props - Component props containing articles.
 * @returns A Zsh-style terminal list of statistics.
 */
export function SiteStats({ articles }: { articles: ArticleMetadata[] }) {
  const currentTime = useCurrentTime();

  const taxonomies = getTaxonomies(articles);
  const launchedAt = taxonomies.launchedAt;
  const commandName = siteConfig.title.toLowerCase();

  const stats = [
    ...(launchedAt
      ? [
          {
            label: "launched at",
            value: new Date(launchedAt).toLocaleDateString("en-CA"), // YYYY-MM-DD
            icon: Calendar,
          },
        ]
      : []),
    {
      label: "views",
      value: taxonomies.totalViews.toLocaleString(),
      icon: Eye,
    },
    { label: "articles", value: articles.length, icon: Newspaper },
    { label: "series", value: taxonomies.series.length, icon: BookOpen },
    { label: "categories", value: taxonomies.category.length, icon: Folder },
    { label: "tags", value: taxonomies.tags.length, icon: Tag },
  ];

  const separator = "=";

  return (
    <section className="flex justify-center py-4 md:py-6">
      <div className="w-full font-mono text-sm md:text-base">
        {/* Zsh Prompt Line (Creative Engineer Style) */}
        <div className="flex flex-wrap items-center gap-x-2 mb-6">
          <span className="text-sky-600 font-bold">~/mylife</span>
          <span className="text-gray-400">in</span>
          <span className="text-emerald-600 font-bold">
            {siteConfig.locale}
          </span>
          <span className="text-emerald-600 font-bold ml-1">&gt;</span>
          <span className="text-gray-900">{commandName} --info</span>
          {currentTime && (
            <span className="ml-auto text-gray-400 hidden sm:inline">
              at {currentTime}
            </span>
          )}
        </div>

        {/* Shell Output Area */}
        <div className="space-y-2 pl-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-3 text-gray-700"
            >
              <div className="flex items-center gap-3 shrink-0">
                <stat.icon className="size-4 text-gray-400" />
                <span className="whitespace-nowrap">{stat.label}</span>
              </div>
              <div className="flex-1 overflow-hidden whitespace-nowrap text-gray-200 px-2 select-none tracking-widest">
                {separator.repeat(100)}
              </div>
              <div className="shrink-0">
                <span className="text-emerald-600 font-bold">{stat.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
