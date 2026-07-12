/**
 * Shared text matching for the command palette and the skills filter.
 *
 * The corpus is full of hyphenated, colon-prefixed identifiers (`ak:code-review`,
 * `agent-browser`). A raw substring match on the query fails the most natural
 * searches a human types: "code review" and "agent browser" both returned nothing.
 * So both sides get normalized to space-separated tokens, and a candidate must
 * contain ALL tokens (AND), not the query as one literal string.
 */

/** `ak:code-review` → `ak code review` */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[:/_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenize(query: string): string[] {
  return normalize(query).split(' ').filter(Boolean);
}

interface Fields {
  /** Highest weight — the thing the user is most likely typing. */
  title: string;
  description?: string;
  /** Keywords, category, aliases. */
  terms?: string;
}

/**
 * Returns 0 when any token is absent from every field. Higher is better.
 */
export function scoreEntry(fields: Fields, tokens: string[]): number {
  if (tokens.length === 0) return 0;

  const title = normalize(fields.title);
  const description = normalize(fields.description ?? '');
  const terms = normalize(fields.terms ?? '');
  const haystack = `${title} ${description} ${terms}`;

  // AND semantics: every token must appear somewhere.
  if (!tokens.every((token) => haystack.includes(token))) return 0;

  const joined = tokens.join(' ');
  let score = 1;

  if (title === joined) score += 100;
  else if (title.startsWith(joined)) score += 60;
  else if (title.includes(joined)) score += 40;

  // Partial credit per token, weighted by which field it landed in.
  for (const token of tokens) {
    if (title.includes(token)) score += 10;
    else if (terms.includes(token)) score += 4;
    else if (description.includes(token)) score += 2;
  }

  return score;
}
