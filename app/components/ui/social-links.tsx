import { siteConfig } from "@/app/lib/site-config";

/**
 * Props for the brand marks below.
 */
type IconProps = {
  className?: string;
};

/**
 * Twitter's bird mark.
 * Path from Simple Icons 9.21.0 (CC0) — the last release that still ships the
 * bird, as v10 replaced it with the X mark.
 */
// function TwitterIcon({ className }: IconProps) {
//   return (
//     <svg
//       viewBox="0 0 24 24"
//       fill="currentColor"
//       className={className}
//       aria-hidden="true"
//     >
//       <path d="M21.543 7.104c.015.211.015.423.015.636 0 6.507-4.954 14.01-14.01 14.01v-.003A13.94 13.94 0 0 1 0 19.539a9.88 9.88 0 0 0 7.287-2.041 4.93 4.93 0 0 1-4.6-3.42 4.916 4.916 0 0 0 2.223-.084A4.926 4.926 0 0 1 .96 9.167v-.062a4.887 4.887 0 0 0 2.235.616A4.928 4.928 0 0 1 1.67 3.148 13.98 13.98 0 0 0 11.82 8.292a4.929 4.929 0 0 1 8.39-4.49 9.868 9.868 0 0 0 3.128-1.196 4.941 4.941 0 0 1-2.165 2.724A9.828 9.828 0 0 0 24 4.555a10.019 10.019 0 0 1-2.457 2.549z" />
//     </svg>
//   );
// }

/**
 * GitHub's Octocat mark.
 * Path from Simple Icons 9.21.0 (CC0).
 */
function GitHubIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

/**
 * The RSS mark, standing for the site's Atom feed. Taken from the envelope's
 * set, as it leaves the same margin: Simple Icons' mark fills the whole box and
 * looks a size larger than its neighbours.
 * Path from Material Design Icons 7.4.47 (Apache-2.0).
 */
function FeedIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M6.18,15.64A2.18,2.18 0 0,1 8.36,17.82C8.36,19 7.38,20 6.18,20C5,20 4,19 4,17.82A2.18,2.18 0 0,1 6.18,15.64M4,4.44A15.56,15.56 0 0,1 19.56,20H16.73A12.73,12.73 0 0,0 4,7.27V4.44M4,10.1A9.9,9.9 0 0,1 13.9,20H11.07A7.07,7.07 0 0,0 4,12.93V10.1Z" />
    </svg>
  );
}

/**
 * A filled envelope, kept solid so it sits evenly beside the two brand marks —
 * both of which only exist as filled silhouettes.
 * Path from Material Design Icons 7.4.47 (Apache-2.0).
 */
function MailIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z" />
    </svg>
  );
}

/**
 * The author's public accounts, in the order they appear in the footer.
 * siteConfig holds the two social handles as bare identifiers, so their hosts
 * are assembled here; the contact form is already a full URL.
 */
const links = [
  // {
  //   href: `https://twitter.com/${siteConfig.twitter}`,
  //   label: "Twitter",
  //   Icon: TwitterIcon,
  //   external: true,
  // },
  {
    href: `https://github.com/${siteConfig.github}`,
    label: "GitHub",
    Icon: GitHubIcon,
    external: true,
  },
  {
    href: siteConfig.contactForm,
    label: "Contact",
    Icon: MailIcon,
    external: true,
  },
  {
    href: "/feed.xml",
    label: "Feed",
    Icon: FeedIcon,
    external: false,
  },
];

/**
 * A row of icon links to the author's Twitter, GitHub, and email address, and
 * to the site's feed.
 * Rendered above the copyright line in the site footer.
 *
 * The icons carry no visible label, so each link is named by aria-label and the
 * marks are drawn a step larger than the header's (size-5 vs size-4.5) to keep
 * the tap target comfortable. Hover colours transition via the `a` rule in
 * globals.css, so no transition class is needed here.
 * @returns The social links navigation element.
 */
export function SocialLinks() {
  return (
    <nav
      aria-label="Social links"
      className="flex items-center justify-center gap-6 mb-4"
    >
      {links.map(({ href, label, Icon, external }) => (
        <a
          key={label}
          href={href}
          aria-label={label}
          className="text-muted hover:text-foreground"
          {...(external && { target: "_blank", rel: "noopener noreferrer" })}
        >
          <Icon className="size-5" />
        </a>
      ))}
    </nav>
  );
}
