import { siteConfig } from "@/app/lib/site-config";

/**
 * siteConfig.timeZone rather than the host's, so a slug is the same locally and
 * on the server. The locale only supplies latin digits; field order is set below.
 */
const zonedFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: siteConfig.timeZone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

/** Concatenates the requested wall-clock fields, zero-padded. */
function formatZoned(
  date: Date,
  fields: readonly Intl.DateTimeFormatPartTypes[],
): string {
  const values = new Map(
    zonedFormatter.formatToParts(date).map((part) => [part.type, part.value]),
  );

  return fields.map((field) => values.get(field) ?? "").join("");
}

/** YYYYMMDD. */
export function formatDateCompact(date: Date = new Date()): string {
  return formatZoned(date, ["year", "month", "day"]);
}

/** YYYYMMDDHHMMSS; also the slug a draft gets when it is published. */
export function formatDateTimeCompact(date: Date = new Date()): string {
  return formatZoned(date, [
    "year",
    "month",
    "day",
    "hour",
    "minute",
    "second",
  ]);
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleString(siteConfig.locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: siteConfig.timeZone,
  });
}
