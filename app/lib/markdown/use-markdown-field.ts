import { useCallback, useRef, useState } from "react";
import { uploadImageAction } from "@/app/lib/image/image-actions";
import {
  continueList,
  escapeAltText,
  indentList,
  insertAround,
  type EditResult,
} from "@/app/lib/markdown/markdown-editing";

/**
 * Valid modes for the editor.
 */
export type EditMode = "edit" | "preview";

/**
 * Hook to manage the state and logic for the Markdown field.
 * The text transforms themselves live in markdown-editing.ts; what is here is
 * the part that needs a live textarea — the selection, the caret, and the
 * file inputs.
 */
export function useMarkdownField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [mode, setMode] = useState<EditMode>("edit");
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const markdownInputRef = useRef<HTMLInputElement>(null);

  /**
   * Pushes an edit up and restores the caret afterwards. The timeout is what
   * makes it stick: the textarea is controlled, so setting the selection before
   * React has re-rendered the new value would simply be overwritten.
   *
   * A zero delay is enough because every caller reaches here from a discrete
   * event — a keydown, or a click on a toolbar button — and React commits those
   * updates synchronously, so the DOM already carries the new value by the time
   * the next macrotask runs. That is the whole of the guarantee, and it is worth
   * naming because it is not a property of the timeout itself: move this call
   * behind a transition or any async path and the wait stops being long enough.
   * Switch it to `flushSync` around the `onChange`, or park the selection in a
   * ref and restore it from a `useLayoutEffect`, before doing so.
   */
  const applyEdit = useCallback(
    (result: EditResult, refocus = false) => {
      onChange(result.value);
      setTimeout(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        if (refocus) textarea.focus();
        textarea.setSelectionRange(result.selectionStart, result.selectionEnd);
      }, 0);
    },
    [onChange],
  );

  const insertMarkdown = useCallback(
    (prefix: string, suffix: string = "", placeholder: string = "") => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      applyEdit(
        insertAround(
          value,
          textarea.selectionStart,
          textarea.selectionEnd,
          prefix,
          suffix,
          placeholder,
        ),
        // The click landed on a toolbar button, so focus has to come back.
        true,
      );
    },
    [value, applyEdit],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const { selectionStart, selectionEnd, value: current } = textarea;

      if (e.key === "Enter" && !e.shiftKey) {
        const result = continueList(current, selectionStart, selectionEnd);
        // Outside a list, Enter is left to the browser.
        if (!result) return;
        e.preventDefault();
        applyEdit(result);
        return;
      }

      if (e.key === "Tab") {
        // Always swallowed, even when nothing changes, so Tab never walks focus
        // out of the editor mid-document.
        e.preventDefault();
        const result = indentList(
          current,
          selectionStart,
          selectionEnd,
          e.shiftKey,
        );
        if (result) applyEdit(result);
      }
    },
    [applyEdit],
  );

  const handleImageUpload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file.");
        return;
      }

      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("image", file);
        const result = await uploadImageAction(formData);
        // Insert as an image link: ![filename](/path/to/image)
        insertMarkdown(
          `![${escapeAltText(result.name)}](${result.url})`,
          "",
          "",
        );
      } catch (error) {
        console.error("Upload failed:", error);
        alert("Failed to upload image.");
      } finally {
        setIsUploading(false);
      }
    },
    [insertMarkdown],
  );

  const handleMarkdownUpload = useCallback(
    (file: File) => {
      const lowerName = file.name.toLowerCase();
      const isMarkdown =
        lowerName.endsWith(".md") ||
        lowerName.endsWith(".markdown") ||
        file.type === "text/markdown" ||
        file.type === "text/plain";

      if (!isMarkdown) {
        alert("Please upload a markdown (.md) file.");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          onChange(reader.result);
          return;
        }

        alert("Failed to read the markdown file.");
      };
      reader.onerror = () => {
        console.error("Failed to read markdown file:", reader.error);
        alert("Failed to read the markdown file.");
      };
      reader.readAsText(file);
    },
    [onChange],
  );

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
    // Reset input so the same file can be uploaded again if needed
    if (e.target) e.target.value = "";
  };

  const onMarkdownFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleMarkdownUpload(file);
    if (e.target) e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageUpload(file);
  };

  return {
    states: {
      mode,
      isUploading,
    },
    // Refs stay at the top level rather than in a group of their own: reaching
    // one through a property access reads to the react-hooks/refs lint rule as
    // touching a ref during render.
    textareaRef,
    fileInputRef,
    markdownInputRef,
    handlers: {
      setMode,
      insertMarkdown,
      handleKeyDown,
      onFileChange,
      onMarkdownFileChange,
      onDrop,
      openImagePicker: () => fileInputRef.current?.click(),
      openMarkdownPicker: () => markdownInputRef.current?.click(),
    },
  };
}
