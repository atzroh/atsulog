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
  const { states, handlers, textareaRef, fileInputRef, markdownInputRef } =
    useMarkdownField({ value, onChange });

  return (
    <div className="flex flex-col space-y-[1rem]">
      <div className="flex items-center justify-between border-b border-gray-100 pb-[0.5rem]">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {label}
        </label>
        <ModeToggle mode={states.mode} onToggle={handlers.setMode} />
      </div>

      {states.mode === "edit" && (
        <div className="flex flex-col space-y-[0.5rem]">
          <MarkdownToolbar
            onAction={handlers.insertMarkdown}
            onUploadClick={handlers.openImagePicker}
            onMarkdownUploadClick={handlers.openMarkdownPicker}
            isUploading={states.isUploading}
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlers.onFileChange}
            accept="image/*"
            className="hidden"
          />
          <input
            type="file"
            ref={markdownInputRef}
            onChange={handlers.onMarkdownFileChange}
            accept=".md,.markdown,text/markdown,text/plain"
            className="hidden"
          />
        </div>
      )}

      <div
        className="w-full"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handlers.onDrop}
      >
        {states.mode === "edit" ? (
          // Fixed height with inner scroll: growing to fit the content made the
          // page jump on every keystroke. transition-shadow animates only the
          // focus ring, and resize-y keeps the w-full column intact.
          <textarea
            id="content"
            name="content"
            ref={textareaRef}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={handlers.handleKeyDown}
            required
            className="w-full h-[70dvh] min-h-[18rem] resize-y overflow-auto p-[1rem] bg-gray-50/50 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/10 transition-shadow"
          />
        ) : (
          <div className="p-[1rem] bg-white">
            <MarkdownRenderer content={value} />
            {/* Keeps the content in the form submission while previewing */}
            <textarea name="content" value={value} readOnly hidden />
          </div>
        )}
      </div>
    </div>
  );
}

