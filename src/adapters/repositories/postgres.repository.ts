import { Pool } from 'pg';
import config from '../../infrastructure/config';
import { IUser } from '../../domain/entities/user.entity';

const pool = config.postgresUrl ? new Pool({ connectionString: config.postgresUrl }) : null;

export async function ensureTable(): Promise<void> {
  // No-op: schema managed by monolith
  if (!pool) return;
  return;
}

export async function getUserById(userId: string): Promise<IUser | null> {
  if (!pool) return null;
  const { rows } = await pool.query(
    'SELECT id as "userId", name, email, cpf, password, "isActive", created_at as "createdAt", updated_at as "updatedAt" FROM users WHERE id = $1 LIMIT 1',
    [userId]
  );
  return rows[0] || null;
}

export async function getUserByEmail(email: string): Promise<IUser | null> {
  if (!pool) return null;
  const { rows } = await pool.query(
    'SELECT id as "userId", name, email, cpf, password, "isActive", created_at as "createdAt", updated_at as "updatedAt" FROM users WHERE email = $1 LIMIT 1',
    [email]
  );
  return rows[0] || null;
}

export async function createUser(user: {
  userId: string;
  name: string | null;
  email: string;
  cpf: string | null;
  password: string;
}): Promise<{ userId: string; name: string | null; email: string; cpf: string | null; password: string }> {
  if (!pool) throw new Error('Database pool not initialized');
  const { userId, name, email, cpf, password } = user;
  await pool.query(
    'INSERT INTO users(id, name, email, cpf, password) VALUES($1, $2, $3, $4, $5)',
    [userId, name, email, cpf, password]
  );
  return user;
}

export async function getUserByCpf(cpf: string): Promise<IUser | null> {
  if (!pool) return null;
  const { rows } = await pool.query(
    'SELECT id as "userId", name, email, cpf, password, "isActive", created_at as "createdAt", updated_at as "updatedAt" FROM users WHERE cpf = $1 LIMIT 1',
    [cpf]
  );
  return rows[0] || null;
}
