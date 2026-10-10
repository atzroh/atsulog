import type { LucideIcon } from "lucide-react";

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

/**
 * A reusable input field with a label derived from its id.
 * Supports optional autocomplete candidates via datalist.
 */
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
      <label
        htmlFor={id}
        className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center"
      >
        {Icon && <Icon className="size-3 mr-1.5" />}
        {displayLabel}
        {required && (
          <span className="text-red-500 ml-1" aria-hidden="true">
            *
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
        className="w-full px-[1rem] py-[0.5rem] bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-gray-400"
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
