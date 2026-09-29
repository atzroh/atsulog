import { useState, useCallback } from "react";

/**
 * Hook to manage comma-separated tag input with autocomplete suggestions.
 * @param initialValue Initial value for the input field.
 * @param candidates All available tags for suggestions.
 */
export function useTagInput(initialValue: string, candidates: string[] = []) {
  const [value, setValue] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<string[]>(candidates);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setValue(newValue);

      if (candidates.length === 0) return;

      const lastCommaIndex = newValue.lastIndexOf(",");
      const prefix = newValue.substring(0, lastCommaIndex + 1);
      const lastPart = newValue.substring(lastCommaIndex + 1).trim();

      const filtered = candidates.filter((c) =>
        c.toLowerCase().includes(lastPart.toLowerCase()),
      );

      setSuggestions(filtered.map((c) => `${prefix}${prefix ? " " : ""}${c}`));
    },
    [candidates],
  );

  return { value, setValue, suggestions, handleChange };
}
