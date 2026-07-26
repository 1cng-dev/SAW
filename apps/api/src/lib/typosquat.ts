const COMMON_TLDS = ["com", "net", "org", "io", "co", "info", "biz", "xyz", "app"];

const HOMOGLYPHS: Record<string, string[]> = {
  o: ["0"],
  l: ["1", "i"],
  i: ["1", "l"],
  e: ["3"],
  a: ["4"],
  s: ["5"],
  g: ["9"],
  b: ["6"],
  t: ["7"],
};

function splitDomain(domain: string): { name: string; tld: string } {
  const parts = domain.split(".");
  return { name: parts[0], tld: parts.slice(1).join(".") };
}

function characterSwaps(name: string): string[] {
  const out: string[] = [];
  for (let i = 0; i < name.length - 1; i++) {
    const arr = name.split("");
    [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
    out.push(arr.join(""));
  }
  return out;
}

function hyphenations(name: string): string[] {
  const out: string[] = [];
  for (let i = 1; i < name.length; i++) {
    out.push(`${name.slice(0, i)}-${name.slice(i)}`);
  }
  return out;
}

function homoglyphSubstitutions(name: string): string[] {
  const out = new Set<string>();
  for (let i = 0; i < name.length; i++) {
    const ch = name[i].toLowerCase();
    const subs = HOMOGLYPHS[ch];
    if (subs) {
      for (const s of subs) out.add(name.slice(0, i) + s + name.slice(i + 1));
    }
  }
  if (name.toLowerCase().includes("rn")) out.add(name.replace(/rn/gi, "m"));
  if (name.toLowerCase().includes("m")) out.add(name.replace(/m/gi, "rn"));
  return Array.from(out);
}

function tldSwaps(name: string, currentTld: string): string[] {
  return COMMON_TLDS.filter((t) => t !== currentTld).map((t) => `${name}.${t}`);
}

export interface TypoVariation {
  domain: string;
  variationType: "character_swap" | "hyphenation" | "tld_swap" | "homoglyph";
}

// Generates a bounded set of typosquat/homoglyph variations for a brand
// domain, prioritizing the most realistic phishing vectors (homoglyphs, TLD
// swaps) since checking each one costs a real RDAP lookup — capped so a
// single "add watch" doesn't fire off dozens of upstream requests.
export function generateTypoVariations(domain: string, maxTotal = 30): TypoVariation[] {
  const { name, tld } = splitDomain(domain.toLowerCase().trim());
  const variations: TypoVariation[] = [];

  for (const v of homoglyphSubstitutions(name)) variations.push({ domain: `${v}.${tld}`, variationType: "homoglyph" });
  for (const v of tldSwaps(name, tld)) variations.push({ domain: v, variationType: "tld_swap" });
  for (const v of characterSwaps(name).slice(0, 8)) variations.push({ domain: `${v}.${tld}`, variationType: "character_swap" });
  for (const v of hyphenations(name).slice(0, 6)) variations.push({ domain: `${v}.${tld}`, variationType: "hyphenation" });

  const unique = new Map<string, TypoVariation>();
  for (const v of variations) {
    if (v.domain !== domain && !unique.has(v.domain)) unique.set(v.domain, v);
  }

  return Array.from(unique.values()).slice(0, maxTotal);
}
