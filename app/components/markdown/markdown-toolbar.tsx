import {
  Eye,
  FileText,
  Image as ImageIcon,
  Loader2,
  Pencil,
} from "lucide-react";
import { toolbarGroups } from "@/app/components/markdown/toolbar-items";
import type { EditMode } from "@/app/lib/markdown/use-markdown-field";

const BUTTON_STYLES =
  "p-[0.375rem] hover:text-black hover:bg-gray-100 rounded-md transition-colors";

/** The vertical hairline drawn between button groups. */
function Divider() {
  return (
    <div
      className="w-px h-[1rem] bg-gray-200 mx-[0.25rem]"
      aria-hidden="true"
    />
  );
}

/**
 * Toolbar for Markdown syntax helpers.
 */
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
    <div className="flex flex-wrap items-center gap-[0.25rem] p-[0.25rem] bg-white border border-gray-100 rounded-lg shadow-sm w-fit mx-auto">
      {toolbarGroups.map((group, groupIdx) => (
        <div key={groupIdx} className="flex items-center">
          {groupIdx > 0 && <Divider />}
          <div className="flex items-center gap-[0.125rem]">
            {group.map((item) => (
              <button
                key={item.title}
                type="button"
                onClick={() =>
                  onAction(item.prefix, item.suffix, item.placeholder)
                }
                className={`text-gray-500 ${BUTTON_STYLES}`}
                title={item.title}
              >
                <item.icon className="size-[1rem]" />
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
        className={`text-gray-700 disabled:opacity-50 ${BUTTON_STYLES}`}
        title="Upload Image"
      >
        {isUploading ? (
          <Loader2 className="size-[1rem] animate-spin" />
        ) : (
          <ImageIcon className="size-[1rem]" />
        )}
      </button>
      <button
        type="button"
        onClick={onMarkdownUploadClick}
        className={`text-gray-700 ${BUTTON_STYLES}`}
        title="Load Markdown"
      >
        <FileText className="size-[1rem]" />
      </button>
    </div>
  );
}

/**
 * A toggle button to switch between Edit and Preview modes.
 */
export function ModeToggle({
  mode,
  onToggle,
}: {
  mode: EditMode;
  onToggle: (mode: EditMode) => void;
}) {
  const isEdit = mode === "edit";

  return (
    <div className="flex bg-gray-100 p-[0.25rem] rounded-lg">
      <button
        type="button"
        onClick={() => onToggle("edit")}
        className={`flex items-center px-[0.75rem] py-[0.25rem] text-xs font-medium rounded-md transition-all ${
          isEdit
            ? "bg-white text-black shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        <Pencil className="size-[0.75rem] mr-[0.375rem]" />
        Edit
      </button>
      <button
        type="button"
        onClick={() => onToggle("preview")}
        className={`flex items-center px-[0.75rem] py-[0.25rem] text-xs font-medium rounded-md transition-all ${
          !isEdit ? "bg-white text-black shadow-sm" : "text-gray-700"
        }`}
      >
        <Eye className="size-[0.75rem] mr-[0.375rem]" />
        Preview
      </button>
    </div>
  );
}
