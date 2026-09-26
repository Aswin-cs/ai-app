/**
 * JurisAI Central Security Module
 * 
 * [SECURITY FEATURE: XSS Prevention & HTML Entity Encoding]
 * [SECURITY FEATURE: Path Traversal & File Name Sanitization]
 * [SECURITY FEATURE: Input Clamping & Information Disclosure Defense]
 */

/**
 * Escape special HTML characters to prevent Cross-Site Scripting (XSS) attacks.
 * Converts characters `&`, `<`, `>`, `"`, and `'` into HTML entity equivalents.
 *
 * @param input Raw value or string to be escaped safely for HTML output.
 * @returns {string} Sanitized string safe for rendering in HTML context.
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
 * Sanitize user-provided file names to prevent path traversal, control character injection,
 * and header pollution when processing uploads or output filenames.
 *
 * @param fileName Raw input filename provided by user or request payload.
 * @returns {string} Clean, safe filename stripped of path traversal sequences and special characters.
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
 * Sanitize and clamp string inputs (e.g., user prompts, query parameters) to prevent memory exhaustion
 * and remove dangerous null bytes.
 *
 * @param input Raw string or unknown input value.
 * @param {number} [maxLength=2000] Maximum allowable character length (defaults to 2000).
 * @returns {string} Cleaned, trimmed, and truncated string.
 */
export function sanitizeString(input: unknown, maxLength: number = 2000): string {
  if (typeof input !== "string") {
    return "";
  }
  // Trim, remove null bytes, and truncate to max length
  return input.replace(/\0/g, "").trim().substring(0, maxLength);
}

/**
 * Formats error messages safely for API responses to prevent infrastructure information disclosure
 * (e.g. stack traces, system paths, environment secrets) in production.
 *
 * @param error Caught error object or exception value.
 * @param {string} [fallbackMessage="An error occurred"] Generic user-facing error message.
 * @returns {string} Safe error message string suitable for JSON response payloads.
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
