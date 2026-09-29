export const siteConfig = {
  // Site identity
  title: "Atsulog",
  url: "https://atsulog.com",

  // Author's public accounts — bare identifiers; callers add "@" or the host
  twitter: "atzroh",
  github: "atzroh",

  // Contact goes through a Google Form instead of a published address, so the
  // markup carries nothing for harvesters to scrape. Stored as a full URL —
  // unlike the handles above, there is no host for the caller to assemble.
  contactForm: "https://forms.gle/gRH1uf3XdhNxuR1g7",

  // Language & region
  htmlLang: "ja",
  locale: "ja-JP",
  timeZone: "Asia/Tokyo",

  // Social sharing
  shareImage: "/share-image.png",

  // Session auth
  cookie: "atsulog-cookie",
  sessionDurationHours: 24,

  // Article listing
  articlesPerPage: 6,
  recentArticlesCount: 3,
  feedEntriesCount: 20,
  aboutSlug: "about",
} as const;
