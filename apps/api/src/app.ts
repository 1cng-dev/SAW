import Fastify from "fastify";
import cors from "@fastify/cors";
import { createDbClient } from "@sec1cng/db";
import { registerRoutes } from "./routes/index";
import "./types";

export function buildApp() {
  const app = Fastify({ logger: true });

  const { db, pool } = createDbClient({ max: 20 });
  app.decorate("db", db);
  app.addHook("onClose", async () => {
    await pool.end();
  });

  app.register(cors, { origin: true });
  registerRoutes(app);

  return app;
}
