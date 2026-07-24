import type { FastifyInstance } from "fastify";
import { registerCveRoutes } from "./cves";
import { registerNewsRoutes } from "./news";
import { registerVendorRoutes } from "./vendors";
import { registerStatsRoutes } from "./stats";
import { registerAdminRoutes } from "./admin";
import { registerThreatIntelRoutes } from "./threatIntel";
import { registerRansomwareRoutes } from "./ransomware";

export function registerRoutes(app: FastifyInstance) {
  registerCveRoutes(app);
  registerNewsRoutes(app);
  registerVendorRoutes(app);
  registerStatsRoutes(app);
  registerAdminRoutes(app);
  registerThreatIntelRoutes(app);
  registerRansomwareRoutes(app);

  app.get("/api/health", async () => ({ status: "ok" }));
}
