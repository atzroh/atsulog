"use client";

import { useEffect } from "react";

/** Toggles GA's opt-out flag, which also stops an already loaded gtag.js. */
export function GaOptOut({
  gaId,
  disabled,
}: {
  gaId: string;
  disabled: boolean;
}) {
  useEffect(() => {
    (window as unknown as Record<string, unknown>)[`ga-disable-${gaId}`] =
      disabled;
  }, [gaId, disabled]);

  return null;
}
