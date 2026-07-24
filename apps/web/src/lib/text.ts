const ENTITY_MAP: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
};

/**
 * Some upstream sources (Cisco advisories in particular) embed raw HTML
 * entities in otherwise-plain-text description fields. Decode the common
 * ones so they render as text, not literal "&nbsp;" — this only substitutes
 * known entities and never interprets markup, so it's safe to use outside
 * dangerouslySetInnerHTML.
 */
export function decodeHtmlEntities(text: string): string {
  return text.replace(/&(?:nbsp|amp|lt|gt|quot|#39|apos);/g, (match) => ENTITY_MAP[match] ?? match);
}
