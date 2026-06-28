export interface Env {
  DB: D1Database;
  KAIRO_CACHE?: KVNamespace;
  APP_ENV?: string;
  ADMIN_API_TOKEN?: string;
  KAIRO_BETA_WRITE_TOKEN?: string;
}

export interface ListOptions {
  limit?: number;
}

export async function listRows<T>(
  db: D1Database,
  sql: string,
  bindings: unknown[] = [],
): Promise<T[]> {
  const statement = db.prepare(sql).bind(...bindings);
  const result = await statement.all<T>();
  return result.results ?? [];
}

export async function getRow<T>(
  db: D1Database,
  sql: string,
  bindings: unknown[] = [],
): Promise<T | null> {
  const statement = db.prepare(sql).bind(...bindings);
  return statement.first<T>();
}
