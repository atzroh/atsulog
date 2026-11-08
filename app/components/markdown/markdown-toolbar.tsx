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
  "p-1.5 hover:text-foreground hover:bg-gray-100 rounded-md transition-colors";

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
    <div className="flex flex-wrap items-center gap-1 p-1 bg-white border border-gray-100 rounded-lg shadow-sm w-fit mx-auto">
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
                <item.icon className="size-4" />
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
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <ImageIcon className="size-4" />
        )}
      </button>
      <button
        type="button"
        onClick={onMarkdownUploadClick}
        className={`text-muted ${BUTTON_STYLES}`}
        title="Load Markdown"
      >
        <FileText className="size-4" />
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
  const isEdit = mode === "edit";

  return (
    <div className="flex bg-gray-100 p-1 rounded-lg">
      <button
        type="button"
        onClick={() => onToggle("edit")}
        className={`flex items-center px-3 py-1 text-xs font-medium rounded-md transition-colors ${
          isEdit
            ? "bg-white text-foreground shadow-sm"
            : "text-muted hover:text-foreground"
        }`}
      >
        <Pencil className="size-3 mr-1.5" />
        Edit
      </button>
      <button
        type="button"
        onClick={() => onToggle("preview")}
        className={`flex items-center px-3 py-1 text-xs font-medium rounded-md transition-colors ${
          !isEdit ? "bg-white text-foreground shadow-sm" : "text-muted"
        }`}
      >
        <Eye className="size-3 mr-1.5" />
        Preview
      </button>
    </div>
  );
}
