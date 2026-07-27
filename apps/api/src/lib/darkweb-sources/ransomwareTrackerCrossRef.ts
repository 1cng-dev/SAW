import { or, ilike } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { ransomwareVictims, ransomwareIocs } from "@sec1cng/db";
import type { DarkWebSource } from "./types";

// Cross-references tracked keywords against the real ransomware.live-synced
// victim-claim and IOC tables already powering the Ransomware Group Tracker
// module — no separate feed, just a different lens on data already in this
// database.
export function createRansomwareTrackerCrossRefSource(app: FastifyInstance): DarkWebSource {
  return {
    name: "Ransomware Group Tracker (cross-reference)",
    isSample: false,
    search: async (keywords: string[]) => {
      const matches = [];
      for (const keyword of keywords) {
        const term = `%${keyword}%`;
        const victims = await app.db
          .select({ name: ransomwareVictims.name, groupName: ransomwareVictims.groupName, publishedDate: ransomwareVictims.publishedDate, description: ransomwareVictims.description })
          .from(ransomwareVictims)
          .where(or(ilike(ransomwareVictims.name, term), ilike(ransomwareVictims.description, term)))
          .limit(10);

        for (const v of victims) {
          matches.push({
            source: "Ransomware Group Tracker (cross-reference)",
            isSample: false,
            dateFound: (v.publishedDate ?? new Date()).toISOString(),
            matchedKeyword: keyword,
            snippet: `Listed as a victim by ransomware group "${v.groupName}": ${v.name}`,
            riskLevel: "critical" as const,
          });
        }

        const iocs = await app.db
          .select({ groupName: ransomwareIocs.groupName, iocType: ransomwareIocs.iocType, iocValue: ransomwareIocs.iocValue, syncedAt: ransomwareIocs.syncedAt })
          .from(ransomwareIocs)
          .where(ilike(ransomwareIocs.iocValue, term))
          .limit(10);

        for (const ioc of iocs) {
          matches.push({
            source: "Ransomware Group Tracker (cross-reference)",
            isSample: false,
            dateFound: ioc.syncedAt.toISOString(),
            matchedKeyword: keyword,
            snippet: `${keyword} appears as a ${ioc.iocType} IOC linked to ransomware group "${ioc.groupName}"`,
            riskLevel: "critical" as const,
          });
        }
      }
      return { matches };
    },
  };
}
