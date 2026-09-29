import {
  FeedIcon,
  GitHubIcon,
  MailIcon,
} from "@/app/components/ui/social-icons";
import { siteConfig } from "@/app/lib/site-config";

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
