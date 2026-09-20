CREATE TABLE IF NOT EXISTS "tokens" (
	"token_hash" bytea PRIMARY KEY,
	"user_id" integer NOT NULL,
	"expiry" timestamp(0) with time zone NOT NULL,
	"scope" text DEFAULT 'authentication' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY,
	"email" varchar(255) NOT NULL UNIQUE,
	"username" varchar(100) NOT NULL UNIQUE,
	"password" varchar(255) NOT NULL,
	"p_level" varchar(50) DEFAULT '1' NOT NULL,
	"rank" varchar(50) DEFAULT 'unranked' NOT NULL,
	"bio" text DEFAULT '' NOT NULL,
	"total_score" integer DEFAULT 0 NOT NULL,
	"avatar_url" text DEFAULT '' NOT NULL,
	"bg_class" varchar(250) DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_login" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tokens" ADD CONSTRAINT "tokens_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;