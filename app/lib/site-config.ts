export const siteConfig = {
  // Site identity
  title: "Atsulog",
  url: "https://atsulog.com",

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
<<<<<<< HEAD
  articlesPerPage: 10,
  recentArticlesCount: 3,
=======
  articlesPerPage: 6,
>>>>>>> refactor/remove-home-stats-and-recent
  feedEntriesCount: 20,
  aboutSlug: "about",
} as const;
