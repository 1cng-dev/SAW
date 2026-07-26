import { desc, eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { alertRules } from "@sec1cng/db";

export function registerAlertRuleRoutes(app: FastifyInstance) {
  app.get("/api/alert-rules", async (_request, reply) => {
    const rows = await app.db.select().from(alertRules).orderBy(desc(alertRules.createdAt));
    return reply.send({ data: rows });
  });

  app.post("/api/alert-rules", async (request, reply) => {
    const body = request.body as { triggerType?: string; channel?: string; destination?: string };
    if (!body.triggerType || !body.channel || !body.destination?.trim()) {
      return reply.status(400).send({ error: "triggerType, channel, and destination are required" });
    }
    const [created] = await app.db
      .insert(alertRules)
      .values({ triggerType: body.triggerType, channel: body.channel as any, destination: body.destination.trim() })
      .returning();
    return reply.status(201).send({ data: created });
  });

  app.patch("/api/alert-rules/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as { enabled?: boolean };
    const [updated] = await app.db.update(alertRules).set(body).where(eq(alertRules.id, id)).returning();
    if (!updated) return reply.status(404).send({ error: "Alert rule not found" });
    return reply.send({ data: updated });
  });

  app.delete("/api/alert-rules/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    await app.db.delete(alertRules).where(eq(alertRules.id, id));
    return reply.status(204).send();
  });
}
