import { desc, eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { incidents, incidentComments } from "@sec1cng/db";

export function registerIncidentRoutes(app: FastifyInstance) {
  app.get("/api/incidents", async (_request, reply) => {
    const rows = await app.db.select().from(incidents).orderBy(desc(incidents.createdAt));
    return reply.send({ data: rows });
  });

  app.get("/api/incidents/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const [incident] = await app.db.select().from(incidents).where(eq(incidents.id, id));
    if (!incident) return reply.status(404).send({ error: "Incident not found" });

    const comments = await app.db
      .select()
      .from(incidentComments)
      .where(eq(incidentComments.incidentId, id))
      .orderBy(incidentComments.createdAt);

    return reply.send({ data: incident, comments });
  });

  app.post("/api/incidents", async (request, reply) => {
    const body = request.body as {
      title: string;
      description?: string;
      severity?: string;
      assignee?: string;
      relatedCveIds?: string[];
      relatedIocs?: string[];
    };
    if (!body.title?.trim()) return reply.status(400).send({ error: "title is required" });

    const [created] = await app.db
      .insert(incidents)
      .values({
        title: body.title.trim(),
        description: body.description?.trim() || null,
        severity: (body.severity as any) ?? "unknown",
        assignee: body.assignee?.trim() || null,
        relatedCveIds: body.relatedCveIds ?? [],
        relatedIocs: body.relatedIocs ?? [],
      })
      .returning();

    return reply.status(201).send({ data: created });
  });

  app.patch("/api/incidents/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Partial<{
      title: string;
      description: string;
      severity: string;
      status: string;
      assignee: string;
      relatedCveIds: string[];
      relatedIocs: string[];
    }>;

    const [updated] = await app.db
      .update(incidents)
      .set({ ...body, updatedAt: new Date() } as any)
      .where(eq(incidents.id, id))
      .returning();

    if (!updated) return reply.status(404).send({ error: "Incident not found" });
    return reply.send({ data: updated });
  });

  app.delete("/api/incidents/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    await app.db.delete(incidents).where(eq(incidents.id, id));
    return reply.status(204).send();
  });

  app.post("/api/incidents/:id/comments", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as { author?: string; body?: string };
    if (!body.body?.trim()) return reply.status(400).send({ error: "body is required" });

    const [created] = await app.db
      .insert(incidentComments)
      .values({ incidentId: id, author: body.author?.trim() || "Anonymous", body: body.body.trim() })
      .returning();

    return reply.status(201).send({ data: created });
  });
}
