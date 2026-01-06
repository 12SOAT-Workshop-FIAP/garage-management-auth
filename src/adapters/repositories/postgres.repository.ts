import { Pool } from "pg";
import config from "../../infrastructure/config";
import { IUser } from "../../domain/entities/user.entity";

const pool = config.postgresUrl
  ? new Pool({
      connectionString: config.postgresUrl,
      ssl: {
        rejectUnauthorized: false,
      },
    })
  : null;

export async function ensureTable(): Promise<void> {
  // No-op: schema managed by monolith
  if (!pool) return;
  return;
}

export async function getUserById(userId: string): Promise<IUser | null> {
  if (!pool)
    throw new Error("Database connection string (POSTGRES_URL) is missing!");
  const { rows } = await pool.query(
    'SELECT id as "userId", name, email, password, "isActive", created_at as "createdAt", updated_at as "updatedAt" FROM users WHERE id = $1 LIMIT 1',
    [userId]
  );
  return rows[0] || null;
}

export async function getUserByEmail(email: string): Promise<IUser | null> {
  if (!pool)
    throw new Error("Database connection string (POSTGRES_URL) is missing!");
  const { rows } = await pool.query(
    'SELECT id as "userId", name, email, password, "isActive", created_at as "createdAt", updated_at as "updatedAt" FROM users WHERE email = $1 LIMIT 1',
    [email]
  );
  return rows[0] || null;
}

export async function createUser(user: {
  userId: string;
  name: string | null;
  email: string;
  password: string;
}): Promise<{
  userId: string;
  name: string | null;
  email: string;
  password: string;
}> {
  if (!pool) throw new Error("Database pool not initialized");
  const { userId, name, email, password } = user;
  await pool.query(
    "INSERT INTO users(id, name, email, password) VALUES($1, $2, $3, $4)",
    [userId, name, email, password]
  );
  return user;
}
