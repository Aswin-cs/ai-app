/**
 * JurisAI Central Security Module
 * 
 * [SECURITY FEATURE: XSS Prevention & HTML Entity Encoding]
 * [SECURITY FEATURE: Path Traversal & File Name Sanitization]
 * [SECURITY FEATURE: Input Clamping & Information Disclosure Defense]
 */

/**
 * Escape special HTML characters to prevent Cross-Site Scripting (XSS) attacks.
 */
export function escapeHtml(input: unknown): string {
  if (input === null || input === undefined) {
    return "";
  }
  const str = String(input);
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Sanitize user-provided file names to prevent path traversal and script injection in headers/logs.
 */
export function sanitizeFileName(fileName: string): string {
  if (!fileName || typeof fileName !== "string") {
    return "uploaded_document";
  }

  // Remove control characters, slash/backslash, path traversal sequences
  const sanitized = fileName
    .replace(/^[\/\\]+/, "")           // Remove leading slashes
    .replace(/[\/\\]/g, "_")            // Replace remaining slashes with underscore
    .replace(/\.\.+/g, "")              // Prevent path traversal ..
    .replace(/^[_\.]+/g, "")            // Trim leading dots/underscores
    .replace(/[^\w\s\.\-\(\)]/gi, "_") // Replace suspicious characters
    .trim();

  const finalName = sanitized.length > 100 ? sanitized.substring(0, 100) : sanitized;
  return !finalName || /^_+$/.test(finalName) ? "uploaded_document" : finalName;
}

/**
 * Sanitize and clamp string inputs (e.g., user prompts, queries).
 */
export function sanitizeString(input: unknown, maxLength: number = 2000): string {
  if (typeof input !== "string") {
    return "";
  }
  // Trim, remove null bytes, and truncate to max length
  return input.replace(/\0/g, "").trim().substring(0, maxLength);
}

/**
 * Formats error messages safely for API responses to prevent information disclosure
 * (e.g. stack traces, system paths, environment secrets).
 */
export function safeErrorMessage(error: unknown, fallbackMessage: string = "An error occurred"): string {
  if (process.env.NODE_ENV === "development") {
    if (error instanceof Error) return error.message;
    if (typeof error === "string") return error;
  }
  // In production, return generic user-friendly messages for known operational errors,
  // or fallback to prevent leaking infrastructure details.
  if (error instanceof Error) {
    const msg = error.message;
    // Allow safe user-facing validation messages
    if (
      msg.includes("File too large") ||
      msg.includes("Unsupported file type") ||
      msg.includes("Unauthorized") ||
      msg.includes("Access denied") ||
      msg.includes("Invalid case ID") ||
      msg.includes("Case not found")
    ) {
      return msg;
    }
  }
  return fallbackMessage;
}
