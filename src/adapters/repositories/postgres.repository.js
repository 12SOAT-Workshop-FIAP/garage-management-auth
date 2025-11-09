const { Pool } = require('pg');
const config = require('../../infrastructure/config');

const pool = config.postgresUrl ? new Pool({ connectionString: config.postgresUrl }) : null;

async function ensureTable() {
  // No-op: schema managed by monolith
  if (!pool) return;
  return;
}

async function getUserById(userId) {
  if (!pool) return null;
  const { rows } = await pool.query(
    'SELECT id as "userId", name, email, password, is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt" FROM users WHERE id = $1 LIMIT 1',
    [userId]
  );
  return rows[0] || null;
}

async function getUserByEmail(email) {
  if (!pool) return null;
  const { rows } = await pool.query(
    'SELECT id as "userId", name, email, password, is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt" FROM users WHERE email = $1 LIMIT 1',
    [email]
  );
  return rows[0] || null;
}

async function createUser(user) {
  if (!pool) return null;
  const { userId, name, email, password } = user;
  await pool.query(
    'INSERT INTO users(id, name, email, password, is_active) VALUES($1,$2,$3,$4,$5)',
    [userId, name, email, password, true]
  );
  return user;
}

module.exports = { ensureTable, getUserById, getUserByEmail, createUser };
