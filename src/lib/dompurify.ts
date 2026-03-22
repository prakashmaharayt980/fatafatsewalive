import DOMPurify from 'isomorphic-dompurify';

/**
 * A safe wrapper for DOMPurify to be used in Next.js App Router.
 * Handles ESM/CJS interop issues (such as Turbopack placing default exports differently)
 * and ensures that it won't crash during SSR or HMR.
 */
export const sanitizeHtml = (html: string, options?: any): string => {
  // Turbopack and ESM modules sometimes import isomorphic-dompurify as a Module object
  // where the actual library is on the `.default` property.
  const sanitizer =
    typeof DOMPurify.sanitize === 'function'
      ? DOMPurify.sanitize
      : typeof (DOMPurify as any).default?.sanitize === 'function'
      ? (DOMPurify as any).default.sanitize
      : null;

  if (!sanitizer) {
    console.error('DOMPurify sanitizer function not found! Returning raw string (unsafe).');
    return html;
  }

  return sanitizer(html, options) as string;
};
