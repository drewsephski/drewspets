ALTER TABLE "inquiries" ADD COLUMN "sms_attempted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "inquiries" ADD COLUMN "sms_message_sid" text;--> statement-breakpoint
ALTER TABLE "inquiries" ADD COLUMN "sms_error_code" text;