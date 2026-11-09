import type { LucideIcon } from "lucide-react";
import { FIELD_LABEL } from "@/app/components/ui/label-styles";

type FormFieldProps = {
  id: string;
  name?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: "text" | "password";
  required?: boolean;
  placeholder?: string;
  candidates?: string[];
  icon?: LucideIcon;
};

/** An input labelled from its id, with optional datalist suggestions. */
export function FormField({
  id,
  name,
  defaultValue,
  value,
  onChange,
  type = "text",
  required = true,
  placeholder,
  candidates,
  icon: Icon,
}: FormFieldProps) {
  const displayLabel = id.charAt(0).toUpperCase() + id.slice(1);
  const fieldName = name ?? id;
  const listId = `${id}-list`;

  return (
    <div className="flex flex-col space-y-2">
      <label htmlFor={id} className={`${FIELD_LABEL} flex items-center gap-2`}>
        {Icon && (
          <Icon className="size-[13px]" strokeWidth={1.5} aria-hidden="true" />
        )}
        {displayLabel}
        {/* Fields are required unless marked, so only the exceptions say so. */}
        {!required && (
          <span className="ml-auto normal-case tracking-normal text-gray-400">
            Optional
          </span>
        )}
      </label>
      <input
        type={type}
        id={id}
        name={fieldName}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        list={candidates ? listId : undefined}
        autoComplete={candidates ? "off" : undefined}
        className="w-full px-3 py-[9px] bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:border-sky-600 transition-colors placeholder:text-gray-400"
      />
      {candidates && candidates.length > 0 && (
        <datalist id={listId}>
          {candidates.map((candidate) => (
            <option key={candidate} value={candidate} />
          ))}
        </datalist>
      )}
    </div>
  );
}
