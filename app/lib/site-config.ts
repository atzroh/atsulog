export const siteConfig = {
  // Site identity
  title: "Atsulog",
  url: "https://atsulog.com",

  // Home hero: the tagline, and the year counted from ("33 entries since 2026")
  tagline: "A personal log",
  sinceYear: 2026,

  // Author's public accounts — bare identifiers; callers add "@" or the host
  twitter: "atzroh",
  github: "atzroh",
  email: "atzroh[at]gmail.com",

  // Language & region
  htmlLang: "ja",
  locale: "ja-JP",
  timeZone: "Asia/Tokyo",

  // Social sharing
  shareImage: "/share-image.png",

  // Session auth
  cookie: "atsulog-cookie",
  sessionDurationHours: 24,
  loginMaxFailures: 5,
  loginLockMinutes: 15,

  // Article listing
  articlesPerPage: 10,
  feedEntriesCount: 20,
  aboutSlug: "about",
} as const;
