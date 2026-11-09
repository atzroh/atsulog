import {
  Eye,
  FileText,
  Image as ImageIcon,
  Loader2,
  Pencil,
} from "lucide-react";
import { TOOLBAR_GROUPS } from "@/app/components/markdown/toolbar-items";
import type { EditMode } from "@/app/lib/markdown/use-markdown-field";

const BUTTON_STYLES =
  "p-1.5 hover:text-sky-600 transition-colors cursor-pointer";

/** Thin strokes, like the other icons in the editor. */
const ICON = { className: "size-4", strokeWidth: 1.5 };

/** The vertical hairline drawn between button groups. */
function Divider() {
  return <div className="w-px h-4 bg-gray-200 mx-1" aria-hidden="true" />;
}

export function MarkdownToolbar({
  onAction,
  onUploadClick,
  onMarkdownUploadClick,
  isUploading,
}: {
  onAction: (prefix: string, suffix?: string, placeholder?: string) => void;
  onUploadClick: () => void;
  onMarkdownUploadClick: () => void;
  isUploading: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1 p-1 bg-white border border-gray-200 rounded-lg w-fit mx-auto">
      {TOOLBAR_GROUPS.map((group, groupIdx) => (
        <div key={groupIdx} className="flex items-center">
          {groupIdx > 0 && <Divider />}
          <div className="flex items-center gap-0.5">
            {group.map((item) => (
              <button
                key={item.title}
                type="button"
                onClick={() =>
                  onAction(item.prefix, item.suffix, item.placeholder)
                }
                className={`text-muted ${BUTTON_STYLES}`}
                title={item.title}
              >
                <item.icon {...ICON} />
              </button>
            ))}
          </div>
        </div>
      ))}

      <Divider />

      <button
        type="button"
        onClick={onUploadClick}
        disabled={isUploading}
        className={`text-muted disabled:opacity-50 ${BUTTON_STYLES}`}
        title="Upload Image"
      >
        {isUploading ? (
          <Loader2 {...ICON} className="size-4 animate-spin" />
        ) : (
          <ImageIcon {...ICON} />
        )}
      </button>
      <button
        type="button"
        onClick={onMarkdownUploadClick}
        className={`text-muted ${BUTTON_STYLES}`}
        title="Load Markdown"
      >
        <FileText {...ICON} />
      </button>
    </div>
  );
}

export function ModeToggle({
  mode,
  onToggle,
}: {
  mode: EditMode;
  onToggle: (mode: EditMode) => void;
}) {
  const tabs = [
    { mode: "edit", label: "Edit", Icon: Pencil },
    { mode: "preview", label: "Preview", Icon: Eye },
  ] as const;

  // Underlined tabs on a hairline; they also title the body field.
  return (
    <div className="flex gap-6 border-b border-gray-200">
      {tabs.map(({ mode: tabMode, label, Icon }) => {
        const isCurrent = mode === tabMode;
        return (
          <button
            key={tabMode}
            type="button"
            aria-pressed={isCurrent}
            onClick={() => onToggle(tabMode)}
            className={`-mb-px flex items-center gap-2 border-b py-2.5 text-[11px] uppercase tracking-[0.18em] transition-colors cursor-pointer ${
              isCurrent
                ? "border-foreground text-foreground"
                : "border-transparent text-muted hover:text-sky-600"
            }`}
          >
            <Icon
              className="size-[13px]"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            {label}
          </button>
        );
      })}
    </div>
  );
}
