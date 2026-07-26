import type { DarkWebMatch, DarkWebSource } from "./types";

// No real breach-notification/paste-site feed is wired in yet. This source
// exists purely to demonstrate the pluggable interface and UI — every result
// it returns is deterministic sample data, clearly flagged isSample: true so
// the UI can badge it and callers can't mistake it for a real finding.
const SAMPLE_TEMPLATES: { source: string; snippetTemplate: string; riskLevel: DarkWebMatch["riskLevel"] }[] = [
  { source: "Sample: Paste Site Index", snippetTemplate: '...credential dump referencing "{keyword}" found in a combolist paste...', riskLevel: "high" },
  { source: "Sample: Breach Notification Feed", snippetTemplate: 'A third-party breach notification mentioned "{keyword}" among affected records.', riskLevel: "medium" },
  { source: "Sample: Forum Mention", snippetTemplate: 'Underground forum post referencing "{keyword}" in a discussion thread.', riskLevel: "low" },
];

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export const sampleDarkWebSource: DarkWebSource = {
  name: "Sample Data Generator",
  isSample: true,
  search: async (keywords: string[]) => {
    const results: DarkWebMatch[] = [];
    for (const keyword of keywords) {
      const seed = hashString(keyword);
      const matchCount = seed % 3; // deterministic 0-2 matches per keyword, not random noise on every poll
      for (let i = 0; i < matchCount; i++) {
        const template = SAMPLE_TEMPLATES[(seed + i) % SAMPLE_TEMPLATES.length];
        const daysAgo = (seed + i * 7) % 60;
        results.push({
          source: template.source,
          isSample: true,
          dateFound: new Date(Date.now() - daysAgo * 86400000).toISOString(),
          matchedKeyword: keyword,
          snippet: template.snippetTemplate.replace("{keyword}", keyword),
          riskLevel: template.riskLevel,
        });
      }
    }
    return results;
  },
};
