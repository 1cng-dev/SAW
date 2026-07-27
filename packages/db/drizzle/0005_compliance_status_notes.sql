CREATE TYPE "public"."compliance_status" AS ENUM('incomplete', 'complete', 'not_applicable');--> statement-breakpoint
ALTER TABLE "compliance_control_status" ADD COLUMN "status" "compliance_status" DEFAULT 'incomplete' NOT NULL;--> statement-breakpoint
ALTER TABLE "compliance_control_status" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "compliance_control_status" DROP COLUMN "completed";
