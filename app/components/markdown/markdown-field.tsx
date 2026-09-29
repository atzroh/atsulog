"use client";

import {
  MarkdownToolbar,
  ModeToggle,
} from "@/app/components/markdown/markdown-toolbar";
import { MarkdownRenderer } from "@/app/components/markdown/markdown-renderer";
import { useMarkdownField } from "@/app/lib/markdown/use-markdown-field";

// --- Types ---

/**
 * Props for the MarkdownField component.
 */
export type MarkdownFieldProps = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
};

// --- Main Component ---

/**
 * A composite component that provides a Markdown editor with a live preview toggle and toolbar.
 * The editing behaviour lives in useMarkdownField; this assembles the pieces.
 * @param props - Component props.
 * @returns The Markdown field component.
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
          <Editor
            textareaRef={textareaRef}
            value={value}
            onChange={onChange}
            onKeyDown={handlers.handleKeyDown}
          />
        ) : (
          <Preview content={value} />
        )}
      </div>
    </div>
  );
}

// --- Internal Sub-components ---

/**
 * The actual textarea for editing Markdown.
 *
 * The height is fixed and the document scrolls inside it, the way an editor
 * pane behaves. It used to grow to fit its content from a `useEffect` in
 * useMarkdownField, which is what made the page lurch on every keystroke:
 * measuring meant setting `height: auto` first, and reading `scrollHeight` back
 * forced a layout while the document was momentarily collapsed to a fraction of
 * its height. The browser clamped `scrollY` into that shorter document and did
 * not put it back when the height was restored. `transition-all` compounded it
 * by animating the height the effect had just written, and `overflow-hidden`
 * meant the caret left the box while it did — so the window scrolled to chase
 * it. Nothing here changes the document's height any more, so there is no
 * scroll for the browser to correct: `transition-shadow` covers the focus ring
 * and nothing else, and the caret is followed inside this box.
 *
 * Dropping the measurement also hands the resize grip back — it was being
 * overwritten on every keystroke. `resize-y` keeps it to the axis that cannot
 * break the `w-full` column.
 */
function Editor({
  textareaRef,
  value,
  onChange,
  onKeyDown,
}: {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}) {
  return (
    <textarea
      id="content"
      name="content"
      ref={textareaRef}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={onKeyDown}
      required
      className="w-full h-[70dvh] min-h-[18rem] resize-y overflow-auto p-[1rem] bg-gray-50/50 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/10 transition-shadow"
    />
  );
}

/**
 * The preview display for rendered Markdown.
 */
function Preview({ content }: { content: string }) {
  return (
    <div className="p-[1rem] bg-white">
      <MarkdownRenderer content={content} />
      {/* Hidden textarea to ensure the form still submits the content even in preview mode */}
      <textarea name="content" value={content} readOnly hidden />
    </div>
  );
}
