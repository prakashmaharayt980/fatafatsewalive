/**
 * Parse a pipe-separated highlights string into an array of trimmed strings.
 * Returns an empty array if input is falsy or empty.
 *
 * @param highlights - Raw highlights string like "6GB RAM | 128GB Storage | 5000mAh"
 * @param limit - Optional max number of items to return (default: all)
 * @returns Array of trimmed highlight strings
 *
 * @example
 * parseHighlights("6GB RAM | 128GB | 5000mAh")       // ["6GB RAM", "128GB", "5000mAh"]
 * parseHighlights("6GB RAM | 128GB | 5000mAh", 2)    // ["6GB RAM", "128GB"]
 * parseHighlights(null)                                // []
 */
export function parseHighlights(highlights: string | null | undefined, limit?: number): string[] {
    if (!highlights) return [];
    const items = highlights
        .split('|')
        .map((s) => s.trim())
        .filter(Boolean);
    return limit ? items.slice(0, limit) : items;
}
