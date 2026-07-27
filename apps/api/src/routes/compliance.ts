import { and, eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { complianceControlStatus } from "@sec1cng/db";
import { COMPLIANCE_FRAMEWORKS } from "@sec1cng/shared";

export function registerComplianceRoutes(app: FastifyInstance) {
  app.get("/api/compliance", async (_request, reply) => {
    const statusRows = await app.db.select().from(complianceControlStatus);
    const statusMap = new Map(statusRows.map((r) => [`${r.framework}:${r.controlId}`, r]));

    const data = COMPLIANCE_FRAMEWORKS.map((framework) => {
      const controls = framework.controls.map((c) => {
        const row = statusMap.get(`${framework.key}:${c.id}`);
        return {
          ...c,
          status: row?.status ?? "incomplete",
          notes: row?.notes ?? null,
          updatedAt: row?.updatedAt ?? null,
        };
      });
      const completedCount = controls.filter((c) => c.status === "complete").length;
      const notApplicableCount = controls.filter((c) => c.status === "not_applicable").length;
      const applicableCount = controls.length - notApplicableCount;
      return {
        key: framework.key,
        name: framework.name,
        controls,
        completedCount,
        notApplicableCount,
        totalCount: controls.length,
        progressPct: applicableCount > 0 ? Math.round((completedCount / applicableCount) * 100) : 0,
      };
    });

    return reply.send({ data });
  });

  app.put("/api/compliance/:framework/:controlId", async (request, reply) => {
    const { framework, controlId } = request.params as { framework: string; controlId: string };
    const body = request.body as { status?: string; notes?: string };

    const [existing] = await app.db
      .select()
      .from(complianceControlStatus)
      .where(and(eq(complianceControlStatus.framework, framework), eq(complianceControlStatus.controlId, controlId)));

    const updates: { status?: any; notes?: string | null; updatedAt: Date } = { updatedAt: new Date() };
    if (body.status !== undefined) updates.status = body.status;
    if (body.notes !== undefined) updates.notes = body.notes || null;

    if (existing) {
      const [updated] = await app.db
        .update(complianceControlStatus)
        .set(updates)
        .where(eq(complianceControlStatus.id, existing.id))
        .returning();
      return reply.send({ data: updated });
    }

    const [created] = await app.db
      .insert(complianceControlStatus)
      .values({ framework, controlId, status: body.status as any, notes: body.notes || null })
      .returning();
    return reply.status(201).send({ data: created });
  });
}
