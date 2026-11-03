"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/app/components/ui/button";
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
    <Button
      variant="outline"
      icon={Trash2}
      onClick={handleClick}
      disabled={isPending}
    >
      Delete
    </Button>
  );
}
