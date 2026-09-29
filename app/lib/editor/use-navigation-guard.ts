import { useEffect } from "react";

/**
 * A hook that warns the user when they try to navigate away with unsaved changes.
 * @param isDirty - Whether there are unsaved changes.
 * @param message - The message to show in the confirmation dialog.
 */
export function useNavigationGuard(
  isDirty: boolean,
  message = "You have unsaved changes. Are you sure you want to leave?",
) {
  useEffect(() => {
    if (!isDirty) return;

    // Handle browser refresh or tab close
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Modern standard: call preventDefault to trigger the confirmation dialog
      e.preventDefault();
    };

    // Handle internal link clicks (Next.js Link, etc.)
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");

      if (anchor && anchor.href) {
        // Create a URL object to normalize the href
        const url = new URL(anchor.href, window.location.origin);

        // Only warn if it's a different path (internal or external)
        const isSamePath =
          url.origin === window.location.origin &&
          url.pathname === window.location.pathname &&
          url.search === window.location.search;

        if (!isSamePath) {
          if (!window.confirm(message)) {
            e.preventDefault();
            e.stopPropagation();
          }
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    // Use capture to intercept the click before other handlers
    document.addEventListener("click", handleClick, true);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleClick, true);
    };
  }, [isDirty, message]);
}
