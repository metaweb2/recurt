import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// The pool must never throw at module-load time: Next.js evaluates every
// route/page module during the build (and on Vercel, DATABASE_URL is not
// always present at build time). Actual DB queries fail gracefully and the
// callers already catch those errors; the placeholder connection string is
// only used so module evaluation never crashes.
const databaseUrl = process.env.DATABASE_URL;

const globalForDb = globalThis as typeof globalThis & {
  __enterpriseRecruitmentPool?: Pool;
};

export const pool =
  globalForDb.__enterpriseRecruitmentPool ??
  new Pool({
    connectionString: databaseUrl ?? "postgresql://localhost:5432/app_db", // placeholder; connects lazily on first query
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__enterpriseRecruitmentPool = pool;
}

export const db = drizzle(pool);
