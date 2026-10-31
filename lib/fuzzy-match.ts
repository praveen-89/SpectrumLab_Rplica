// The original's search widget (ninja-keys) highlights matches with a
// sequential fuzzy scan — each character of the query, in order, matched
// against the next occurrence in the target text (not a substring match).
// E.g. query "publications" against "...application to signal..." matches
// the p/l/i/c/a/t/i/o/n inside "application" plus the trailing s in
// "signal", each highlighted individually. This reproduces that exactly,
// confirmed against the live site's own highlighted output.

/** Case-insensitive sequential fuzzy match. Returns the matched character indices into `text` (in order), or null if not every character of `query` was found in sequence. */
export function fuzzyMatch(text: string, query: string): number[] | null {
  if (!query) return [];
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const indices: number[] = [];
  let searchFrom = 0;
  for (const char of lowerQuery) {
    const index = lowerText.indexOf(char, searchFrom);
    if (index === -1) return null;
    indices.push(index);
    searchFrom = index + 1;
  }
  return indices;
}
