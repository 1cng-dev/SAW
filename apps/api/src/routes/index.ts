import type { FastifyInstance } from "fastify";
import { registerCveRoutes } from "./cves";
import { registerNewsRoutes } from "./news";
import { registerVendorRoutes } from "./vendors";
import { registerStatsRoutes } from "./stats";
import { registerAdminRoutes } from "./admin";

export function registerRoutes(app: FastifyInstance) {
  registerCveRoutes(app);
  registerNewsRoutes(app);
  registerVendorRoutes(app);
  registerStatsRoutes(app);
  registerAdminRoutes(app);

  app.get("/api/health", async () => ({ status: "ok" }));
}
