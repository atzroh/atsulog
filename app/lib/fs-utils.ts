import path from "node:path";

/** Where the database, uploaded images and link-card cache live. */
export const DATA_DIR = path.join(process.cwd(), "data");

export function isNotFound(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ENOENT"
  );
}
