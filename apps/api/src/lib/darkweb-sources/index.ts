import { sampleDarkWebSource } from "./sampleSource";
import type { DarkWebSource } from "./types";

// Plugin registry: wire a real breach-feed/paste-site source in later by
// adding a module here (implementing DarkWebSource) — no route/UI changes
// needed. Only the sample source is registered until one is configured.
export const DARKWEB_SOURCES: DarkWebSource[] = [sampleDarkWebSource];

export * from "./types";
