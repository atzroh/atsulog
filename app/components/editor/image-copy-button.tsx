"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/app/components/ui/button";

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

  return (
    <Button
      variant="outline"
      icon={copied ? Check : Copy}
      onClick={handleClick}
    >
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}
