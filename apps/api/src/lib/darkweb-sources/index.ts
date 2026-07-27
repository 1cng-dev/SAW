import type { FastifyInstance } from "fastify";
import { darkWebInformerSource } from "./darkWebInformer";
import { hibpSource } from "./hibp";
import { abuseChCrossRefSource } from "./abuseChCrossRef";
import { createRansomwareTrackerCrossRefSource } from "./ransomwareTrackerCrossRef";
import type { DarkWebSource } from "./types";

// Plugin registry: adding a new dark-web/breach data source means dropping
// in one new module file here and listing it — no other aggregation/UI code
// changes. Evaluated and excluded during research (documented rather than
// silently dropped): PSBDMP (both known domains unreachable/dead), Dehashed
// and generic Telegram/leak-forum aggregators (no legitimate free public API
// exists for either — Dark Web Informer's own RSS feed already aggregates
// real forum/leak-site announcements, which covers the same need honestly).
export function getDarkWebSources(app: FastifyInstance): DarkWebSource[] {
  return [darkWebInformerSource, hibpSource, abuseChCrossRefSource, createRansomwareTrackerCrossRefSource(app)];
}

export * from "./types";
