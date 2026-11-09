"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { RING_BUTTON } from "@/app/components/editor/image-list-styles";

/** Copies a Markdown reference to the image; the alt text is left empty. */
export function ImageCopyButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(`![](${url})`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked; nothing else to do here.
    }
  };

  const Icon = copied ? Check : Copy;
  return (
    <button
      type="button"
      aria-label={copied ? "Copied" : "Copy Markdown"}
      onClick={handleClick}
      className={`${RING_BUTTON} hover:border-sky-600 hover:text-sky-600`}
    >
      <Icon className="size-[15px]" strokeWidth={1.5} aria-hidden="true" />
    </button>
  );
}
