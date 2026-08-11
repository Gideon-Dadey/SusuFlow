-- Device tokens (may already exist on environments that used prisma db push)
CREATE TABLE IF NOT EXISTS "user_push_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token" VARCHAR(512) NOT NULL,
    "platform" VARCHAR(20),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "user_push_tokens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_push_tokens_token_key" ON "user_push_tokens"("token");
CREATE INDEX IF NOT EXISTS "user_push_tokens_user_id_idx" ON "user_push_tokens"("user_id");

DO $$ BEGIN
  ALTER TABLE "user_push_tokens"
    ADD CONSTRAINT "user_push_tokens_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "notification_preferences" JSONB;
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "read_at" TIMESTAMPTZ(6);
ALTER TABLE "user_push_tokens" ADD COLUMN IF NOT EXISTS "last_seen_at" TIMESTAMPTZ(6);
ALTER TABLE "user_push_tokens" ADD COLUMN IF NOT EXISTS "app_version" VARCHAR(40);
ALTER TABLE "user_push_tokens" ADD COLUMN IF NOT EXISTS "device_name" VARCHAR(120);

CREATE INDEX IF NOT EXISTS "notifications_user_id_created_at_idx" ON "notifications"("user_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "notifications_user_id_read_at_idx" ON "notifications"("user_id", "read_at");
