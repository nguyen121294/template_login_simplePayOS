CREATE TABLE "payments" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"amount" double precision NOT NULL,
	"status" text NOT NULL,
	"plan" text DEFAULT 'plus' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"price" double precision NOT NULL,
	"days" integer NOT NULL,
	"description" text,
	"features" text[],
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"subscription_id" text,
	"subscription_status" text DEFAULT 'inactive',
	"subscription_expires_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;