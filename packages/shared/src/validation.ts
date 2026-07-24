import { z } from "zod";
import { SEVERITIES } from "./constants";

export const cveQuerySchema = z.object({
  severity: z.string().optional(), // comma-separated list of SEVERITIES
  vendor: z.string().optional(), // comma-separated list
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  minCvss: z.coerce.number().min(0).max(10).optional(),
  maxCvss: z.coerce.number().min(0).max(10).optional(),
  hasPoc: z.coerce.boolean().optional(),
  isExploited: z.coerce.boolean().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z
    .enum(["publishedDate", "lastModifiedDate", "cvssScore", "trendingScore", "id"])
    .default("publishedDate"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});

export const newsQuerySchema = z.object({
  source: z.string().optional(),
  category: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type CveQuery = z.infer<typeof cveQuerySchema>;
export type NewsQuery = z.infer<typeof newsQuerySchema>;

export function isValidSeverity(value: string): value is (typeof SEVERITIES)[number] {
  return (SEVERITIES as readonly string[]).includes(value);
}
