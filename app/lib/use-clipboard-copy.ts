import { useState } from "react";

/** Copies text and raises `copied` for two seconds; a blocked clipboard is ignored. */
export function useClipboardCopy() {
  const [copied, setCopied] = useState(false);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked; callers leave the text selectable instead.
    }
  };

  return { copied, copy, reset: () => setCopied(false) };
}
