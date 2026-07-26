import { desc, eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { teamUsers } from "@sec1cng/db";

export function registerTeamUserRoutes(app: FastifyInstance) {
  app.get("/api/team-users", async (_request, reply) => {
    const rows = await app.db.select().from(teamUsers).orderBy(desc(teamUsers.createdAt));
    return reply.send({ data: rows });
  });

  app.post("/api/team-users", async (request, reply) => {
    const body = request.body as { name?: string; email?: string; role?: string };
    if (!body.name?.trim() || !body.email?.trim()) {
      return reply.status(400).send({ error: "name and email are required" });
    }
    try {
      const [created] = await app.db
        .insert(teamUsers)
        .values({ name: body.name.trim(), email: body.email.trim(), role: (body.role as any) ?? "viewer" })
        .returning();
      return reply.status(201).send({ data: created });
    } catch (error) {
      return reply.status(409).send({ error: "A user with that email already exists" });
    }
  });

  app.patch("/api/team-users/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as { role?: string };
    const [updated] = await app.db.update(teamUsers).set(body as any).where(eq(teamUsers.id, id)).returning();
    if (!updated) return reply.status(404).send({ error: "User not found" });
    return reply.send({ data: updated });
  });

  app.delete("/api/team-users/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    await app.db.delete(teamUsers).where(eq(teamUsers.id, id));
    return reply.status(204).send();
  });
}
