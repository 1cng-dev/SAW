import type { FastifyInstance } from "fastify";
import { ransomwareGroups, ransomwareVictims } from "@sec1cng/db";

// Real org-provided endpoint: https://api-pro.ransomware.live/docs
// (no /v2 prefix despite some example snippets — confirmed against the live API)
const RANSOMWARE_LIVE_API_KEY = process.env.RANSOMWARE_LIVE_API_KEY;
const RANSOMWARE_LIVE_API_URL = "https://api-pro.ransomware.live";

function ransomwareApiHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    ...(RANSOMWARE_LIVE_API_KEY ? { "X-Api-Key": RANSOMWARE_LIVE_API_KEY } : {}),
  };
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

interface RansomwareLiveGroup {
  group: string;
  altname: string | null;
  victims: number;
}

interface RansomwareLiveVictim {
  id: string;
  discovered?: string;
  attackdate?: string;
  website?: string;
  country?: string;
  description?: string;
  victim: string;
  group: string;
}

export async function syncRansomwareData(app: FastifyInstance) {
  if (!RANSOMWARE_LIVE_API_KEY) {
    app.log.warn("skipped: no RANSOMWARE_LIVE_API_KEY configured");
    return { skipped: true };
  }

  try {
    app.log.info("Starting ransomware data sync...");
    await syncGroups(app);
    await syncVictims(app);
    app.log.info("Ransomware data sync completed successfully");
  } catch (error) {
    app.log.error({ error: String(error) }, "Ransomware data sync failed");
    throw error;
  }
}

async function syncGroups(app: FastifyInstance) {
  const response = await fetch(`${RANSOMWARE_LIVE_API_URL}/groups`, {
    headers: ransomwareApiHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Ransomware.live API error (groups): ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as { groups: RansomwareLiveGroup[] };
  const groups = data.groups ?? [];

  app.log.info(`Syncing ${groups.length} ransomware groups...`);

  for (const group of groups) {
    const slug = slugify(group.group);
    const row = {
      name: group.group,
      slug,
      description: group.altname ? `Also known as: ${group.altname}` : null,
      victims: group.victims ?? 0,
      syncedAt: new Date(),
      updatedAt: new Date(),
    };

    await app.db
      .insert(ransomwareGroups)
      .values(row)
      .onConflictDoUpdate({
        target: [ransomwareGroups.slug],
        set: row,
      });
  }

  app.log.info(`Successfully synced ${groups.length} ransomware groups`);
}

async function syncVictims(app: FastifyInstance) {
  const response = await fetch(`${RANSOMWARE_LIVE_API_URL}/victims/recent`, {
    headers: ransomwareApiHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Ransomware.live API error (victims/recent): ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as { victims: RansomwareLiveVictim[] };
  const victims = data.victims ?? [];

  app.log.info(`Syncing ${victims.length} ransomware victims...`);

  for (const victim of victims) {
    const publishedRaw = victim.discovered ?? victim.attackdate ?? null;
    const row = {
      externalId: victim.id,
      groupName: victim.group,
      name: victim.victim,
      description: victim.description ?? null,
      publishedDate: publishedRaw ? new Date(publishedRaw) : null,
      website: victim.website ?? null,
      country: victim.country ?? null,
      syncedAt: new Date(),
      updatedAt: new Date(),
    };

    await app.db
      .insert(ransomwareVictims)
      .values(row)
      .onConflictDoUpdate({
        target: [ransomwareVictims.externalId],
        set: row,
      });
  }

  app.log.info(`Successfully synced ${victims.length} ransomware victims`);
}
