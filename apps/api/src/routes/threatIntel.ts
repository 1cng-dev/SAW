import { ilike, or } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { cves, newsArticles } from "@sec1cng/db";

export function registerThreatIntelRoutes(app: FastifyInstance) {
  app.get("/api/threat-intel/lookup", async (request, reply) => {
    const { indicator } = request.query as { indicator?: string };

    if (!indicator || indicator.trim().length === 0) {
      return reply.status(400).send({ error: "Indicator is required" });
    }

    const searchTerm = indicator.trim();

    // Check if it's an IP address, domain, hash, or URL
    const isIP = /^(\d{1,3}\.){3}\d{1,3}$/.test(searchTerm);
    const isDomain = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/.test(searchTerm);
    const isHash = /^[a-fA-F0-9]{32}$|^[a-fA-F0-9]{40}$|^[a-fA-F0-9]{64}$/.test(searchTerm);
    const isURL = /^https?:\/\/.+/i.test(searchTerm);

    // Search in CVE descriptions
    const cveMatches = await app.db
      .select({
        id: cves.id,
        description: cves.description,
        severity: cves.severity,
        publishedDate: cves.publishedDate,
        source: cves.source,
      })
      .from(cves)
      .where(ilike(cves.description, `%${searchTerm}%`))
      .limit(20);

    // Search in news articles
    const newsMatches = await app.db
      .select({
        id: newsArticles.id,
        title: newsArticles.title,
        excerpt: newsArticles.excerpt,
        sourceName: newsArticles.sourceName,
        sourceUrl: newsArticles.sourceUrl,
        publishedDate: newsArticles.publishedDate,
      })
      .from(newsArticles)
      .where(
        or(
          ilike(newsArticles.title, `%${searchTerm}%`),
          ilike(newsArticles.excerpt, `%${searchTerm}%`),
          ilike(newsArticles.sourceUrl, `%${searchTerm}%`)
        )
      )
      .limit(20);

    // Determine verdict based on matches
    let verdict = "unknown";
    let confidence = "low";
    let sources: string[] = [];

    if (cveMatches.length > 0 || newsMatches.length > 0) {
      // Check if any critical/high CVEs mention this indicator
      const criticalMatches = cveMatches.filter((cve) => cve.severity === "critical" || cve.severity === "high");
      
      if (criticalMatches.length > 0) {
        verdict = "malicious";
        confidence = "high";
        sources = criticalMatches.map((cve) => `CVE: ${cve.id}`);
      } else if (cveMatches.length > 0) {
        verdict = "suspicious";
        confidence = "medium";
        sources = cveMatches.map((cve) => `CVE: ${cve.id}`);
      } else if (newsMatches.length > 0) {
        verdict = "suspicious";
        confidence = "low";
        sources = newsMatches.map((news) => `News: ${news.sourceName}`);
      }
    }

    // External API integrations (if keys are provided)
    let externalResults: any[] = [];

    // AbuseIPDB integration
    if (process.env.ABUSEIPDB_API_KEY && isIP) {
      try {
        const response = await fetch(`https://api.abuseipdb.com/api/v2/check?ipAddress=${searchTerm}`, {
          headers: {
            Key: process.env.ABUSEIPDB_API_KEY,
            Accept: "application/json",
          },
        });
        if (response.ok) {
          const data = await response.json();
          externalResults.push({
            source: "AbuseIPDB",
            data: data.data,
          });
          // Update verdict based on AbuseIPDB
          if (data.data?.abuseConfidenceScore > 50) {
            verdict = "malicious";
            confidence = "high";
          } else if (data.data?.abuseConfidenceScore > 25) {
            verdict = "suspicious";
            confidence = "medium";
          }
        }
      } catch (error) {
        console.error("AbuseIPDB API error:", error);
      }
    }

    // VirusTotal integration
    if (process.env.VIRUSTOTAL_API_KEY && isHash) {
      try {
        const response = await fetch(`https://www.virustotal.com/api/v3/files/${searchTerm}`, {
          headers: {
            "x-apikey": process.env.VIRUSTOTAL_API_KEY,
          },
        });
        if (response.ok) {
          const data = await response.json();
          externalResults.push({
            source: "VirusTotal",
            data: data.data,
          });
          // Update verdict based on VirusTotal
          const maliciousCount = data.data?.attributes?.last_analysis_stats?.malicious || 0;
          if (maliciousCount > 5) {
            verdict = "malicious";
            confidence = "high";
          } else if (maliciousCount > 0) {
            verdict = "suspicious";
            confidence = "medium";
          }
        }
      } catch (error) {
        console.error("VirusTotal API error:", error);
      }
    }

    return reply.send({
      indicator: searchTerm,
      indicatorType: isIP ? "ip" : isDomain ? "domain" : isHash ? "hash" : isURL ? "url" : "unknown",
      verdict,
      confidence,
      sources,
      cveMatches,
      newsMatches,
      externalResults,
      hasExternalAPI: !!(process.env.ABUSEIPDB_API_KEY || process.env.VIRUSTOTAL_API_KEY),
    });
  });
}
