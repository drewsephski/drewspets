ALTER TABLE "rate_limit" ALTER COLUMN "last_request" SET DATA TYPE bigint USING (EXTRACT(EPOCH FROM "last_request") * 1000)::bigint;
