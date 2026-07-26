import type { FastifyInstance } from "fastify";
import { registerCveRoutes } from "./cves";
import { registerNewsRoutes } from "./news";
import { registerVendorRoutes } from "./vendors";
import { registerStatsRoutes } from "./stats";
import { registerAdminRoutes } from "./admin";
import { registerThreatIntelRoutes } from "./threatIntel";
import { registerRansomwareRoutes } from "./ransomware";
import { registerOsintRoutes } from "./osint";
import { registerAssetRoutes } from "./assets";
import { registerIncidentRoutes } from "./incidents";
import { registerPatchTaskRoutes } from "./patchTasks";
import { registerDarkWebRoutes } from "./darkweb";
import { registerPhishingRoutes } from "./phishing";
import { registerMalwareRoutes } from "./malware";
import { registerComplianceRoutes } from "./compliance";
import { registerAlertRuleRoutes } from "./alertRules";
import { registerTeamUserRoutes } from "./teamUsers";

export function registerRoutes(app: FastifyInstance) {
  registerCveRoutes(app);
  registerNewsRoutes(app);
  registerVendorRoutes(app);
  registerStatsRoutes(app);
  registerAdminRoutes(app);
  registerThreatIntelRoutes(app);
  registerRansomwareRoutes(app);
  registerOsintRoutes(app);
  registerAssetRoutes(app);
  registerIncidentRoutes(app);
  registerPatchTaskRoutes(app);
  registerDarkWebRoutes(app);
  registerPhishingRoutes(app);
  registerMalwareRoutes(app);
  registerComplianceRoutes(app);
  registerAlertRuleRoutes(app);
  registerTeamUserRoutes(app);

  app.get("/api/health", async () => ({ status: "ok" }));
}
