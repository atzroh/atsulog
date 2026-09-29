/**
 * Text transforms behind the Markdown editor's toolbar and key handling.
 *
 * Nothing here touches React or the DOM: each function takes the current text
 * plus a selection and returns the text it should become plus where the caret
 * should land. The caller is responsible for applying both.
 */

/** A rewritten value and the selection to restore once it is applied. */
export type EditResult = {
  value: string;
  selectionStart: number;
  selectionEnd: number;
};

/** Indent / outdent step. Two spaces, matching what the toolbar's list buttons emit. */
const INDENT = "  ";

/** `indent`, `marker`, `content` of a list item — `- foo`, `1. foo`, `  * foo`. */
const LIST_ITEM = /^(\s*)([-*+]|\d+\.)\s+(.*)$/;

/**
 * The text from the start of the caret's line up to the caret itself.
 * Deliberately excludes anything after the caret: a list item is only
 * "continued" or "indented" on the strength of what precedes the cursor.
 */
function lineBeforeCursor(value: string, caret: number): string {
  const before = value.substring(0, caret);
  return before.substring(before.lastIndexOf("\n") + 1);
}

/** Collapses the caret to a single point. */
function caretAt(value: string, position: number): EditResult {
  return { value, selectionStart: position, selectionEnd: position };
}

/**
 * Escapes the characters that would terminate a Markdown alt text early.
 * The backslash must be handled first to avoid double-escaping.
 */
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
