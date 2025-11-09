const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('./config');

const repo = require('./adapters/repositories/postgres.repository');

async function init() {
  // table/schema is managed by the monolith; nothing to do here
  if (repo && repo.ensureTable) {
    try {
      await repo.ensureTable();
    } catch (err) {
      // ignore
    }
  }
}

async function register({ userId, name, email, password }) {
  if (!email || !password) throw new Error('email and password required');
  const existing = await repo.getUserByEmail(email);
  if (existing) {
    const err = new Error('User exists');
    err.code = 'ALREADY_EXISTS';
    throw err;
  }
  // ID should follow monolith conventions (uuid). If not provided, generate a v4 uuid.
  const { v4: uuidv4 } = require('uuid');
  const id = userId || uuidv4();
  const hashed = await bcrypt.hash(password, 10);
  const user = { userId: id, name: name || null, email, password: hashed };
  await repo.createUser(user);
  return { userId: id, email, name: user.name };
}

async function login({ email, password }) {
  if (!email || !password) throw new Error('email and password required');
  const user = await repo.getUserByEmail(email);
  if (!user) {
    const err = new Error('Invalid credentials');
    err.code = 'INVALID_CREDENTIALS';
    throw err;
  }
  const match = await bcrypt.compare(password, user.password || '');
  if (!match) {
    const err = new Error('Invalid credentials');
    err.code = 'INVALID_CREDENTIALS';
    throw err;
  }
  const token = jwt.sign({ sub: user.userId, email: user.email }, config.jwtSecret, { expiresIn: '8h' });
  return { token, userId: user.userId, email: user.email, name: user.name || null };
}

async function getUserById(userId) {
  return await repo.getUserById(userId);
}

module.exports = { init, register, login, getUserById };
