import { and, eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { complianceControlStatus } from "@sec1cng/db";
import { COMPLIANCE_FRAMEWORKS } from "@sec1cng/shared";

export function registerComplianceRoutes(app: FastifyInstance) {
  app.get("/api/compliance", async (_request, reply) => {
    const statusRows = await app.db.select().from(complianceControlStatus);
    const statusMap = new Map(statusRows.map((r) => [`${r.framework}:${r.controlId}`, r.completed]));

    const data = COMPLIANCE_FRAMEWORKS.map((framework) => {
      const controls = framework.controls.map((c) => ({
        ...c,
        completed: statusMap.get(`${framework.key}:${c.id}`) ?? false,
      }));
      const completedCount = controls.filter((c) => c.completed).length;
      return {
        key: framework.key,
        name: framework.name,
        controls,
        completedCount,
        totalCount: controls.length,
        progressPct: Math.round((completedCount / controls.length) * 100),
      };
    });

    return reply.send({ data });
  });

  app.put("/api/compliance/:framework/:controlId", async (request, reply) => {
    const { framework, controlId } = request.params as { framework: string; controlId: string };
    const body = request.body as { completed: boolean };

    const [existing] = await app.db
      .select()
      .from(complianceControlStatus)
      .where(and(eq(complianceControlStatus.framework, framework), eq(complianceControlStatus.controlId, controlId)));

    if (existing) {
      const [updated] = await app.db
        .update(complianceControlStatus)
        .set({ completed: body.completed, updatedAt: new Date() })
        .where(eq(complianceControlStatus.id, existing.id))
        .returning();
      return reply.send({ data: updated });
    }

    const [created] = await app.db
      .insert(complianceControlStatus)
      .values({ framework, controlId, completed: body.completed })
      .returning();
    return reply.status(201).send({ data: created });
  });
}
