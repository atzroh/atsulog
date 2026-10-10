/**
 * Text transforms behind the Markdown editor's toolbar and keys. Pure: each
 * takes text plus a selection and returns the new text and caret to apply.
 */

/** A rewritten value and the selection to restore once it is applied. */
export type EditResult = {
  value: string;
  selectionStart: number;
  selectionEnd: number;
};

/** Two spaces, matching what the toolbar's list buttons emit. */
const INDENT = "  ";

/** `indent`, `marker`, `content` of a list item — `- foo`, `1. foo`, `  * foo`. */
const LIST_ITEM = /^(\s*)([-*+]|\d+\.)\s+(.*)$/;

/** The caret's line up to the caret: list handling goes by what precedes it. */
function lineBeforeCursor(value: string, caret: number): string {
  const before = value.substring(0, caret);
  return before.substring(before.lastIndexOf("\n") + 1);
}

function caretAt(value: string, position: number): EditResult {
  return { value, selectionStart: position, selectionEnd: position };
}

/** Escapes the characters that would end a Markdown alt text early. */
export function escapeAltText(text: string): string {
  return text.replace(/[\\[\]]/g, "\\$&");
}

/**
 * Wraps the selection in `prefix`/`suffix`, falling back to `placeholder` when
 * nothing is selected. The returned selection covers the wrapped text but not
 * the delimiters, so typing immediately replaces the placeholder.
 */
export function insertAround(
  value: string,
  start: number,
  end: number,
  prefix: string,
  suffix: string = "",
  placeholder: string = "",
): EditResult {
  const inserted = value.substring(start, end) || placeholder;
  const selectionStart = start + prefix.length;

  return {
    value:
      value.substring(0, start) +
      prefix +
      inserted +
      suffix +
      value.substring(end),
    selectionStart,
    selectionEnd: selectionStart + inserted.length,
  };
}

/**
 * Handles Enter inside a list: opens the next item, or ends the list when the
 * current item is empty.
 * @returns null when the caret is not in a list, so Enter can behave normally.
 */
export function continueList(
  value: string,
  start: number,
  end: number,
): EditResult | null {
  const currentLine = lineBeforeCursor(value, start);
  const match = currentLine.match(LIST_ITEM);
  if (!match) return null;

  const [, indent, marker, content] = match;

  // Enter on an empty item ends the list: drop the marker, keep the newline.
  if (content.trim() === "") {
    const startOfLine = start - currentLine.length;
    return caretAt(
      value.substring(0, startOfLine) + "\n" + value.substring(end),
      startOfLine + 1,
    );
  }

  // Ordered lists count up; bullets all continue as "-" whatever was typed.
  const nextMarker = /\d+\./.test(marker) ? `${parseInt(marker) + 1}.` : "-";
  const insertion = `\n${indent}${nextMarker} `;

  return caretAt(
    value.substring(0, start) + insertion + value.substring(end),
    start + insertion.length,
  );
}

/**
 * Handles Tab and Shift+Tab: shifts the current list item one level, or inserts
 * a plain indent when the caret is not in a list.
 * @returns null when there is nothing to do (Shift+Tab outside a list).
 */
export function indentList(
  value: string,
  start: number,
  end: number,
  outdent: boolean,
): EditResult | null {
  const currentLine = lineBeforeCursor(value, start);
  const match = currentLine.match(LIST_ITEM);

  if (!match) {
    if (outdent) return null;
    return caretAt(
      value.substring(0, start) + INDENT + value.substring(end),
      start + INDENT.length,
    );
  }

  const [, indent, marker, content] = match;
  const startOfLine = start - currentLine.length;

  const nextIndent = outdent
    ? indent.substring(indent.length >= INDENT.length ? INDENT.length : 0)
    : indent + INDENT;
  // Bullets normalise to "-" so a nested level never mixes markers.
  const nextMarker = ["-", "*", "+"].includes(marker) ? "-" : marker;
  const line = `${nextIndent}${nextMarker} ${content}`;

  return caretAt(
    value.substring(0, startOfLine) + line + value.substring(end),
    startOfLine + line.length,
  );
}
