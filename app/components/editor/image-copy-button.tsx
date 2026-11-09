"use client";

import { Check, Copy } from "lucide-react";

import { RING_BUTTON } from "@/app/components/editor/image-list-styles";
import { useClipboardCopy } from "@/app/lib/use-clipboard-copy";

/** Copies a Markdown reference to the image; the alt text is left empty. */
export function ImageCopyButton({ url }: { url: string }) {
  const { copied, copy } = useClipboardCopy();

  const Icon = copied ? Check : Copy;
  return (
    <button
      type="button"
      aria-label={copied ? "Copied" : "Copy Markdown"}
      onClick={() => copy(`![](${url})`)}
      className={`${RING_BUTTON} hover:border-sky-600 hover:text-sky-600`}
    >
      <Icon className="size-[15px]" strokeWidth={1.5} aria-hidden="true" />
    </button>
  );
}
