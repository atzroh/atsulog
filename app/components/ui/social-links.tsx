"use client";

import { Check, Copy, X } from "lucide-react";
import { useRef, useState } from "react";
import {
  FeedIcon,
  GitHubIcon,
  MailIcon,
} from "@/app/components/ui/social-icons";
import { siteConfig } from "@/app/lib/site-config";

/**
 * Footer links in display order. siteConfig holds bare handles, so hosts are
 * added here. The email is not a link; see SocialLinks.
 */
const LINKS = [
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

const ICON_BUTTON = "text-muted hover:text-sky-600";

/**
 * Footer icon links, plus an envelope opening a dialog with the "[at]" address
 * and a copy button instead of a mailto: link. Icons are size-5 (header: 4.5)
 * for the tap target; hover transitions come from the `a` rule in globals.css.
 */
export function SocialLinks() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      // The page only ever holds "[at]"; the real address exists on copy.
      await navigator.clipboard.writeText(
        siteConfig.email.replace("[at]", "@"),
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked; the address is still selectable in the dialog.
    }
  };

  return (
    <>
      <nav aria-label="Social links" className="flex items-center gap-5">
        {LINKS.slice(0, 1).map(renderLink)}
        <button
          type="button"
          aria-label="Email"
          aria-haspopup="dialog"
          onClick={() => dialogRef.current?.showModal()}
          className={`${ICON_BUTTON} cursor-pointer`}
        >
          <MailIcon className="size-5" />
        </button>
        {LINKS.slice(1).map(renderLink)}
      </nav>
      <dialog
        ref={dialogRef}
        aria-label="Email address"
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current.close();
        }}
        onClose={() => setCopied(false)}
        className="m-auto max-w-[calc(100%-2rem)] rounded-lg bg-background p-0 text-foreground normal-case tracking-normal backdrop:bg-gray-900/25"
      >
        <div className="flex flex-col gap-5 px-8 pt-7 pb-6">
          <div className="flex items-center gap-2.5">
            <MailIcon className="size-4 text-muted" />
            <h2 className="text-[11px] uppercase tracking-[0.32em] text-muted">
              Email
            </h2>
            <button
              type="button"
              aria-label="Close"
              onClick={() => dialogRef.current?.close()}
              className="ml-auto text-gray-400 hover:text-sky-600 cursor-pointer"
            >
              <X className="size-4" strokeWidth={1.5} />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <p className="select-all text-lg tracking-[0.02em]">
              {siteConfig.email}
            </p>
            <button
              type="button"
              aria-label={copied ? "Copied" : "Copy email address"}
              onClick={copyEmail}
              className={`ml-auto ${ICON_BUTTON} cursor-pointer`}
            >
              {copied ? (
                <Check className="size-4" strokeWidth={1.5} />
              ) : (
                <Copy className="size-4" strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}

function renderLink({ href, label, Icon, external }: (typeof LINKS)[number]) {
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
