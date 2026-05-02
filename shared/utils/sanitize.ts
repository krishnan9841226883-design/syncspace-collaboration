/**
 * SyncSpace — Input Sanitization Utility
 * Provides XSS prevention and input validation helpers.
 * Used across both frontend and backend for consistent security.
 * 
 * @module sanitize
 * @security Critical — modifying these functions requires security review
 */

/**
 * Escapes HTML special characters to prevent XSS injection.
 * Converts `<`, `>`, `&`, `"`, `'` to their HTML entity equivalents.
 * 
 * @param input - Raw string input from user
 * @returns Sanitized string safe for HTML rendering
 * 
 * @example
 * ```typescript
 * escapeHtml('<script>alert("xss")</script>')
 * // Returns: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
 * ```
 */
export function escapeHtml(input: string): string {
  const htmlEntities: Readonly<Record<string, string>> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return input.replace(/[&<>"'/]/g, (char) => htmlEntities[char] || char);
}

/**
 * Sanitizes a string by trimming whitespace and removing control characters.
 * Preserves newlines and standard whitespace for text areas.
 * 
 * @param input - Raw user input
 * @param maxLength - Maximum allowed string length (default: 5000)
 * @returns Cleaned string with control characters removed
 */
export function sanitizeText(input: string, maxLength: number = 5000): string {
  if (typeof input !== 'string') return '';
  // Remove control characters except newline and tab
  return input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim()
    .slice(0, maxLength);
}

/**
 * Validates and sanitizes an email address format.
 * Does not verify deliverability — only checks structural validity.
 * 
 * @param email - Email address to validate
 * @returns Whether the email has valid format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validates a URL against allowed protocols.
 * Prevents javascript: and data: protocol injection.
 * 
 * @param url - URL string to validate
 * @param allowedProtocols - List of allowed URL protocols
 * @returns Whether the URL uses an allowed protocol
 */
export function isValidUrl(
  url: string,
  allowedProtocols: readonly string[] = ['https:', 'http:']
): boolean {
  try {
    const parsed = new URL(url);
    return allowedProtocols.includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Creates a debounced version of a function.
 * Delays execution until after `delay` milliseconds of inactivity.
 * Improves efficiency by reducing API calls from rapid input events.
 * 
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds (default: 300)
 * @returns Debounced function with cancel method
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number = 300
): T & { cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout>;

  const debounced = ((...args: unknown[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  }) as T & { cancel: () => void };

  debounced.cancel = () => clearTimeout(timeoutId);

  return debounced;
}
