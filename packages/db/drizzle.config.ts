import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: fileURLToPath(new URL("../../.env", import.meta.url)) });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set (copy .env.example to .env at the repo root)");
}

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
