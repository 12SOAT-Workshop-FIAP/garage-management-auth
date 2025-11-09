// Lightweight adapter to new service layers
const express = require('express');
const serverless = require('serverless-http');
const auth = require('./src/authService');
const config = require('./src/config');

const app = express();
app.use(express.json());

// initialize (create tables when using Postgres)
auth.init().catch((err) => console.error('Auth init error', err));

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [, token] = authHeader.split(' ');
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    const jwt = require('jsonwebtoken');
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

app.post('/register', async (req, res) => {
  try {
    const { userId, name, email, password } = req.body || {};
    const result = await auth.register({ userId, name, email, password });
    return res.status(201).json(result);
  } catch (err) {
    if (err.code === 'ALREADY_EXISTS') return res.status(409).json({ error: 'User already exists' });
    console.error(err);
    return res.status(500).json({ error: err.message || 'Could not create user' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const result = await auth.login({ email, password });
    return res.json(result);
  } catch (err) {
    if (err.code === 'INVALID_CREDENTIALS') return res.status(401).json({ error: 'Invalid credentials' });
    console.error(err);
    return res.status(500).json({ error: err.message || 'Login failed' });
  }
});

app.get('/me', authMiddleware, async (req, res) => {
  try {
    const u = await auth.getUserById(req.user.sub);
    if (!u) return res.status(404).json({ error: 'User not found' });
    const { userId, name, email } = u;
    return res.json({ userId, name, email });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Could not retrieve user' });
  }
});

// compatibility
app.get('/users/:userId', async (req, res) => {
  try {
    const item = await auth.getUserById(req.params.userId);
    if (!item) return res.status(404).json({ error: 'Could not find user with provided "userId"' });
    const { userId, name, email } = item;
    return res.json({ userId, name, email });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Could not retrieve user' });
  }
});

app.use((req, res) => res.status(404).json({ error: 'Not Found' }));

exports.handler = serverless(app);
// Export express app for testing (supertest)
exports.app = app;
