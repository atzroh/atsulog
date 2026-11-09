"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";

import { RING_BUTTON } from "@/app/components/editor/image-list-styles";
import { deleteImageAction } from "@/app/lib/image/image-actions";

/** Deletes an unused image after the user confirms. */
export function ImageDeleteButton({ hash }: { hash: string }) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (!window.confirm(`Delete "${hash}"? This cannot be undone.`)) return;
    startTransition(async () => {
      try {
        await deleteImageAction(hash);
      } catch (error) {
        console.error("Delete failed:", error);
        alert("Failed to delete image.");
      }
    });
  };

  return (
    <button
      type="button"
      aria-label="Delete"
      onClick={handleClick}
      disabled={isPending}
      className={`${RING_BUTTON} hover:border-red-700 hover:text-red-700`}
    >
      <Trash2 className="size-[15px]" strokeWidth={1.5} aria-hidden="true" />
    </button>
  );
}
