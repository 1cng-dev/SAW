import { fileURLToPath } from "node:url";
import { config } from "dotenv";

// apps/worker runs from its own package directory in dev, so dotenv's default
// cwd-based lookup won't find the repo-root .env — load it explicitly.
config({ path: fileURLToPath(new URL("../../../../.env", import.meta.url)) });
