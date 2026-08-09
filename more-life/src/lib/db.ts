import postgres from "postgres";

declare global {
  var __sql: ReturnType<typeof postgres> | undefined;
}

function create() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return postgres(url, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    // Supabase's transaction pooler (port 6543) does not support prepared statements
    prepare: process.env.DATABASE_NO_PREPARE !== "1",
  });
}

// Reuse the connection pool across hot reloads / serverless invocations.
export const sql = globalThis.__sql ?? (globalThis.__sql = create());
