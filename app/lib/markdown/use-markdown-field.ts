import { useCallback, useRef, useState } from "react";
import { uploadImageAction } from "@/app/lib/image/image-actions";
import {
  continueList,
  escapeAltText,
  indentList,
  insertAround,
  type EditResult,
} from "@/app/lib/markdown/markdown-editing";

export type EditMode = "edit" | "preview";

/**
 * The Markdown field's live-textarea side (selection, caret, file inputs);
 * the text transforms live in markdown-editing.ts.
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
   * The timeout lets the controlled textarea re-render first. Zero suffices only
   * because callers are discrete events React commits synchronously; on an
   * async path, switch to flushSync or a layout effect.
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
        insertMarkdown(`![${escapeAltText(result.name)}](${result.url})`);
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
    // Lets the same file be picked again.
    e.target.value = "";
  };

  const onMarkdownFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleMarkdownUpload(file);
    e.target.value = "";
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
    // Top level, not grouped: react-hooks/refs reads a ref behind a property
    // access as touching it during render.
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
