import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

// Dark fintech-terminal theme by default; light mode still available via toggle.
const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const severity = {
  critical: { 500: "#dc2626", 600: "#b91c1c" },
  high: { 500: "#ea580c", 600: "#c2410c" },
  medium: { 500: "#ca8a04", 600: "#a16207" },
  low: { 500: "#2563eb", 600: "#1d4ed8" },
  unknown: { 500: "#64748b", 600: "#475569" },
};

// Warm amber/orange — active nav, primary buttons, key numeric highlights, chart accent lines.
const accent = {
  50: "#fff7ed",
  400: "#fb923c",
  500: "#f97316",
  600: "#ea580c",
  700: "#c2410c",
};

// Secondary chart/status accents so charts aren't monochrome.
const teal = { 400: "#22d3ee", 500: "#0891b2" };
const purple = { 400: "#a78bfa", 500: "#7c3aed" };

export const theme = extendTheme({
  config,
  fonts: {
    heading: `'Inter', system-ui, sans-serif`,
    body: `'Inter', system-ui, sans-serif`,
    mono: `'JetBrains Mono', ui-monospace, monospace`,
  },
  colors: {
    severity,
    accent,
    teal,
    purple,
    charcoal: {
      900: "#0a0a0a", // page background
      800: "#131313", // panel background
      700: "#1a1a1a", // card surface
      600: "#2a2a2a", // borders
    },
  },
  semanticTokens: {
    colors: {
      "bg.canvas": { default: "gray.50", _dark: "charcoal.900" },
      "bg.surface": { default: "white", _dark: "charcoal.700" },
      "bg.panel": { default: "gray.50", _dark: "charcoal.800" },
      "border.default": { default: "gray.200", _dark: "charcoal.600" },
      "text.primary": { default: "gray.900", _dark: "gray.100" },
      "text.muted": { default: "gray.600", _dark: "gray.400" },
      "accent.solid": { default: "accent.600", _dark: "accent.500" },
    },
  },
  styles: {
    global: {
      "html, body": {
        bg: "bg.canvas",
        color: "text.primary",
      },
    },
  },
  components: {
    Table: {
      variants: {
        simple: {
          th: {
            textTransform: "uppercase",
            fontSize: "xs",
            letterSpacing: "wide",
            color: "text.muted",
            borderColor: "border.default",
          },
          td: { borderColor: "border.default" },
        },
      },
    },
    Button: {
      baseStyle: { borderRadius: "lg", fontWeight: "semibold" },
      variants: {
        solid: (props: { colorScheme: string }) =>
          props.colorScheme === "gray"
            ? {}
            : {
                bg: "accent.solid",
                color: "white",
                _hover: { bg: "accent.600", _disabled: { bg: "accent.solid" } },
                _active: { bg: "accent.700" },
              },
      },
      defaultProps: { colorScheme: "orange" },
    },
    Badge: {
      baseStyle: { borderRadius: "md" },
    },
    Switch: {
      baseStyle: {
        track: { _checked: { bg: "accent.solid" } },
      },
    },
  },
});
