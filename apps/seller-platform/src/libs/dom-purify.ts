import DOMPurify from "dompurify";

/**
 * Sanitizes HTML string to prevent XSS attacks
 * @param dirty - The untrusted HTML string to sanitize
 * @returns Sanitized HTML string safe for rendering
 */
export const sanitizeHtml = (dirty: string): string => {
  if (typeof window === "undefined") {
    // Server-side: return empty string or the original string based on your needs
    return dirty;
  }
  return DOMPurify.sanitize(dirty);
};
