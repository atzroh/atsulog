"use client";

import { ChevronDown, LayoutGrid, LogOut, UserCog } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { logoutAction } from "@/app/lib/auth/auth-actions";

const ITEM =
  "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium text-muted hover:bg-gray-50 hover:text-foreground transition-colors";

/** Admin dropdown shown while logged in. Closes on outside click, Esc, or item click. */
export function AdminMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="Admin menu"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-0.5 rounded-full bg-gray-100 py-1 pl-1.5 pr-1 text-muted hover:text-foreground transition-colors cursor-pointer"
      >
        <UserCog className="size-4.5" />
        <ChevronDown className="size-3.5" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full mt-2 w-44 rounded-lg border border-gray-200 bg-white p-1.5 shadow-lg"
        >
          <Link
            href="/admin"
            role="menuitem"
            onClick={() => setOpen(false)}
            className={ITEM}
          >
            <LayoutGrid className="size-4" />
            Admin
          </Link>
          <div className="my-1 h-px bg-gray-100" />
          <form action={logoutAction}>
            <button
              type="submit"
              role="menuitem"
              className={`${ITEM} bg-transparent border-none cursor-pointer`}
            >
              <LogOut className="size-4" />
              Logout
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
