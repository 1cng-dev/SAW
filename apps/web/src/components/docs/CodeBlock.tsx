import { Box, Text } from "@chakra-ui/react";

// Lightweight regex-based JSON token coloring — avoids pulling in a full
// syntax-highlighting dependency (Prism/Shiki) for a single docs page.
function highlightJson(json: string): { text: string; color: string }[] {
  const tokens: { text: string; color: string }[] = [];
  const pattern = /("(?:\\.|[^"\\])*")(\s*:)?|(\btrue\b|\bfalse\b|\bnull\b)|(-?\d+\.?\d*)|([{}[\],])|(\s+)/g;
  let match: RegExpExecArray | null;
  let lastIndex = 0;

  while ((match = pattern.exec(json)) !== null) {
    if (match.index > lastIndex) tokens.push({ text: json.slice(lastIndex, match.index), color: "#e2e8f0" });
    const [full, str, colon, keyword, num, punct] = match;
    if (str) tokens.push({ text: str, color: colon ? "#f97316" : "#22d3ee" });
    if (colon) tokens.push({ text: colon, color: "#e2e8f0" });
    if (keyword) tokens.push({ text: keyword, color: "#a78bfa" });
    if (num) tokens.push({ text: num, color: "#a78bfa" });
    if (punct) tokens.push({ text: punct, color: "#64748b" });
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < json.length) tokens.push({ text: json.slice(lastIndex), color: "#e2e8f0" });
  return tokens;
}

export function JsonBlock({ code }: { code: string }) {
  const tokens = highlightJson(code);
  return (
    <Box as="pre" fontFamily="mono" fontSize="xs" bg="charcoal.900" borderWidth="1px" borderColor="border.default" borderRadius="md" p={4} overflowX="auto" whiteSpace="pre">
      {tokens.map((t, i) => <Text as="span" key={i} color={t.color}>{t.text}</Text>)}
    </Box>
  );
}

export function HttpBlock({ method, path }: { method: string; path: string }) {
  const methodColors: Record<string, string> = { GET: "#22c55e", POST: "#f97316", PATCH: "#eab308", DELETE: "#dc2626" };
  return (
    <Box fontFamily="mono" fontSize="sm" bg="charcoal.900" borderWidth="1px" borderColor="border.default" borderRadius="md" p={3} mb={3}>
      <Text as="span" color={methodColors[method] ?? "#e2e8f0"} fontWeight="bold">{method}</Text>
      <Text as="span" color="#e2e8f0" ml={2}>{path}</Text>
    </Box>
  );
}
