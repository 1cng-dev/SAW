CREATE TYPE "public"."severity" AS ENUM('critical', 'high', 'medium', 'low', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."sync_status" AS ENUM('success', 'partial', 'failed');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cves" (
	"id" text PRIMARY KEY NOT NULL,
	"description" text,
	"cvss_score" numeric,
	"cvss_vector" text,
	"severity" "severity" DEFAULT 'unknown' NOT NULL,
	"cwe_id" text,
	"published_date" timestamp with time zone,
	"last_modified_date" timestamp with time zone,
	"vendor" text,
	"affected_products" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"references" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_exploited_in_wild" boolean DEFAULT false NOT NULL,
	"has_poc" boolean DEFAULT false NOT NULL,
	"source" text NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"trending_score" numeric DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "news_articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"excerpt" text,
	"source_name" text NOT NULL,
	"source_url" text NOT NULL,
	"category" text,
	"published_date" timestamp with time zone,
	"related_cve_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "news_articles_source_url_unique" UNIQUE("source_url")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vendor_advisories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_name" text NOT NULL,
	"title" text NOT NULL,
	"url" text NOT NULL,
	"related_cve_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"published_date" timestamp with time zone,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "vendor_advisories_url_unique" UNIQUE("url")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sync_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_name" text NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"finished_at" timestamp with time zone,
	"records_fetched" integer DEFAULT 0 NOT NULL,
	"records_inserted" integer DEFAULT 0 NOT NULL,
	"records_updated" integer DEFAULT 0 NOT NULL,
	"status" "sync_status" NOT NULL,
	"error_message" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sync_state" (
	"job_name" text PRIMARY KEY NOT NULL,
	"last_sync_timestamp" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cves_trending_score_idx" ON "cves" USING btree ("trending_score");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cves_severity_idx" ON "cves" USING btree ("severity");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cves_vendor_idx" ON "cves" USING btree ("vendor");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cves_published_date_idx" ON "cves" USING btree ("published_date");