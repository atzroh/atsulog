import { useEffect } from "react";

/** Asks for confirmation before leaving the page with unsaved changes. */
export function useNavigationGuard(
  isDirty: boolean,
  message = "You have unsaved changes. Are you sure you want to leave?",
) {
  useEffect(() => {
    if (!isDirty) return;

    // Refresh or tab close.
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // preventDefault alone triggers the browser's own dialog.
      e.preventDefault();
    };

    // Client-side navigation (next/link) never fires beforeunload.
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");

      if (anchor && anchor.href) {
        const url = new URL(anchor.href, window.location.origin);

        // A link to this same page (a #hash, say) loses nothing.
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
    // Capture, so this runs before Link's own handler navigates.
    document.addEventListener("click", handleClick, true);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleClick, true);
    };
  }, [isDirty, message]);
}
