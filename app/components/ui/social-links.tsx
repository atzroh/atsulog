"use client";

import { Check, Copy } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/app/components/ui/button";
import {
  FeedIcon,
  GitHubIcon,
  MailIcon,
} from "@/app/components/ui/social-icons";
import { siteConfig } from "@/app/lib/site-config";

/**
 * The author's public accounts, in the order they appear in the footer.
 * siteConfig holds the two social handles as bare identifiers, so their hosts
 * are assembled here. The email address is not a link; see SocialLinks.
 */
const links = [
  {
    href: `https://github.com/${siteConfig.github}`,
    label: "GitHub",
    Icon: GitHubIcon,
    external: true,
  },
  {
    href: "/feed.xml",
    label: "Feed",
    Icon: FeedIcon,
    external: false,
  },
];

const ICON_BUTTON = "text-muted hover:text-foreground";

/**
 * A row of icon links to the author's GitHub account and the site's feed, plus
 * an envelope button that opens a dialog with the email address.
 * Rendered above the copyright line in the site footer.
 *
 * The icons carry no visible label, so each link is named by aria-label and the
 * marks are drawn a step larger than the header's (size-5 vs size-4.5) to keep
 * the tap target comfortable. Hover colours transition via the `a` rule in
 * globals.css, so no transition class is needed here. The address stays in its
 * "[at]" form and is not a mailto: link; the envelope opens a dialog that shows
 * it with a copy icon instead.
 * @returns The social links navigation element.
 */
export function SocialLinks() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(siteConfig.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked; the address is still selectable in the dialog.
    }
  };

  return (
    <>
      <nav
        aria-label="Social links"
        className="flex items-center justify-center gap-6 mb-4"
      >
        {links.slice(0, 1).map(renderLink)}
        <button
          type="button"
          aria-label="Email"
          aria-haspopup="dialog"
          onClick={() => dialogRef.current?.showModal()}
          className={`${ICON_BUTTON} cursor-pointer`}
        >
          <MailIcon className="size-5" />
        </button>
        {links.slice(1).map(renderLink)}
      </nav>
      <dialog
        ref={dialogRef}
        aria-label="Email address"
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current.close();
        }}
        onClose={() => setCopied(false)}
        className="m-auto rounded-lg border border-gray-200 bg-background p-0 text-foreground normal-case backdrop:bg-black/30"
      >
        <div className="flex flex-col items-center gap-3 px-8 py-6">
          <h2 className="text-lg font-medium text-foreground">Mail</h2>
          <div className="flex items-center gap-3 rounded-md border border-gray-300 bg-gray-100 px-3 py-2">
            <p className="select-all text-base">{siteConfig.email}</p>
            <button
              type="button"
              aria-label="Copy email address"
              onClick={copyEmail}
              className={`${ICON_BUTTON} cursor-pointer`}
            >
              {copied ? (
                <Check className="size-4" />
              ) : (
                <Copy className="size-4" />
              )}
            </button>
          </div>
          <Button variant="outline" onClick={() => dialogRef.current?.close()}>
            Close
          </Button>
        </div>
      </dialog>
    </>
  );
}

function renderLink({ href, label, Icon, external }: (typeof links)[number]) {
  return (
    <a
      key={label}
      href={href}
      aria-label={label}
      className={ICON_BUTTON}
      {...(external && { target: "_blank", rel: "noopener noreferrer" })}
    >
      <Icon className="size-5" />
    </a>
  );
}
