"use client";

import {
  MarkdownToolbar,
  ModeToggle,
} from "@/app/components/markdown/markdown-toolbar";
import { MarkdownRenderer } from "@/app/components/markdown/markdown-renderer";
import { useMarkdownField } from "@/app/lib/markdown/use-markdown-field";

type MarkdownFieldProps = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
};

/**
 * A Markdown editor with a toolbar and a preview toggle; the editing behaviour
 * lives in useMarkdownField.
 */
export function MarkdownField({
  value,
  onChange,
  label = "Content (Markdown)",
}: MarkdownFieldProps) {
  const {
    mode,
    isUploading,
    textareaRef,
    fileInputRef,
    markdownInputRef,
    setMode,
    insertMarkdown,
    handleKeyDown,
    handleFileChange,
    handleMarkdownFileChange,
    handleDrop,
    openImagePicker,
    openMarkdownPicker,
  } = useMarkdownField({ value, onChange });

  return (
    <div className="flex flex-col space-y-4">
      <ModeToggle mode={mode} onToggle={setMode} />

      {mode === "edit" && (
        <div className="flex flex-col space-y-2">
          <MarkdownToolbar
            onAction={insertMarkdown}
            onUploadClick={openImagePicker}
            onMarkdownUploadClick={openMarkdownPicker}
            isUploading={isUploading}
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <input
            type="file"
            ref={markdownInputRef}
            onChange={handleMarkdownFileChange}
            accept=".md,.markdown,text/markdown,text/plain"
            className="hidden"
          />
        </div>
      )}

      <div
        className="w-full"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {mode === "edit" ? (
          // Fixed height with inner scroll: growing to fit the content made the
          // page jump on every keystroke. No fill or frame: the tabs above
          // mark the field, and resize-y keeps the w-full column intact.
          <textarea
            id="content"
            name="content"
            aria-label={label}
            ref={textareaRef}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={handleKeyDown}
            required
            className="w-full h-[70dvh] min-h-72 resize-y overflow-auto py-4 bg-transparent text-sm font-mono focus:outline-none"
          />
        ) : (
          <div className="py-4">
            <MarkdownRenderer content={value} />
            {/* Keeps the content in the form submission while previewing */}
            <textarea name="content" value={value} readOnly hidden />
          </div>
        )}
      </div>
    </div>
  );
}
