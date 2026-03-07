import { neon } from "@neondatabase/serverless";

let _sql: ReturnType<typeof neon> | null = null;

function getClient() {
  if (_sql) return _sql;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  _sql = neon(databaseUrl);
  return _sql;
}

export function sql(
  strings: TemplateStringsArray,
  ...values: unknown[]
): ReturnType<ReturnType<typeof neon>> {
  const client = getClient();
  return client(strings, ...values);
}

