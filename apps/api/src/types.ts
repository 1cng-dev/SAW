import type { Db } from "@sec1cng/db";

declare module "fastify" {
  interface FastifyInstance {
    db: Db;
  }
}
