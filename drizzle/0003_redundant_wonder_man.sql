CREATE TABLE "payment_notifications" (
	"session_id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"amount_cents" integer NOT NULL,
	"currency" text NOT NULL,
	"sms_attempted_at" timestamp with time zone,
	"sms_message_sid" text,
	"sms_error_code" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
