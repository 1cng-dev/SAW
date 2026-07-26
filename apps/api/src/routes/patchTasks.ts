import { desc, eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { patchTasks, cves, assets } from "@sec1cng/db";

export function registerPatchTaskRoutes(app: FastifyInstance) {
  app.get("/api/patch-tasks", async (_request, reply) => {
    const rows = await app.db
      .select({
        id: patchTasks.id,
        cveId: patchTasks.cveId,
        assetId: patchTasks.assetId,
        status: patchTasks.status,
        dueDate: patchTasks.dueDate,
        notes: patchTasks.notes,
        createdAt: patchTasks.createdAt,
        updatedAt: patchTasks.updatedAt,
        cveSeverity: cves.severity,
        cvePublishedDate: cves.publishedDate,
        cveDescription: cves.description,
        assetName: assets.name,
      })
      .from(patchTasks)
      .leftJoin(cves, eq(patchTasks.cveId, cves.id))
      .leftJoin(assets, eq(patchTasks.assetId, assets.id))
      .orderBy(desc(patchTasks.createdAt));

    return reply.send({ data: rows });
  });

  app.post("/api/patch-tasks", async (request, reply) => {
    const body = request.body as { cveId?: string; assetId?: string; status?: string; dueDate?: string; notes?: string };
    if (!body.cveId && !body.assetId) {
      return reply.status(400).send({ error: "At least one of cveId or assetId is required" });
    }

    if (body.cveId) {
      const [cve] = await app.db.select({ id: cves.id }).from(cves).where(eq(cves.id, body.cveId));
      if (!cve) return reply.status(400).send({ error: `CVE ${body.cveId} not found in the database` });
    }

    const [created] = await app.db
      .insert(patchTasks)
      .values({
        cveId: body.cveId || null,
        assetId: body.assetId || null,
        status: (body.status as any) ?? "not_started",
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        notes: body.notes?.trim() || null,
      })
      .returning();

    return reply.status(201).send({ data: created });
  });

  app.patch("/api/patch-tasks/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Partial<{ status: string; dueDate: string | null; notes: string }>;

    const [updated] = await app.db
      .update(patchTasks)
      .set({
        ...(body.status !== undefined ? { status: body.status as any } : {}),
        ...(body.dueDate !== undefined ? { dueDate: body.dueDate ? new Date(body.dueDate) : null } : {}),
        ...(body.notes !== undefined ? { notes: body.notes } : {}),
        updatedAt: new Date(),
      })
      .where(eq(patchTasks.id, id))
      .returning();

    if (!updated) return reply.status(404).send({ error: "Patch task not found" });
    return reply.send({ data: updated });
  });

  app.delete("/api/patch-tasks/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    await app.db.delete(patchTasks).where(eq(patchTasks.id, id));
    return reply.status(204).send();
  });
}
