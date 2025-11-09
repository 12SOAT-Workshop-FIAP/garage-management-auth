const request = require('supertest');
const bcrypt = require('bcryptjs');

describe('Auth endpoints', () => {
  let app;
  beforeEach(() => {
    // reset module registry so we can mock repository before loading handler
    jest.resetModules();
  });

  test('POST /register - success', async () => {
  const repo = require('../src/adapters/repositories/postgres.repository');
    // mock methods
    jest.spyOn(repo, 'getUserByEmail').mockResolvedValue(null);
    jest.spyOn(repo, 'createUser').mockImplementation(async (user) => user);

    // now load handler
    app = require('../handler').app;

    const res = await request(app)
      .post('/register')
      .send({ email: 'me@ex.com', password: 'pass123', name: 'Tester' })
      .set('Accept', 'application/json');

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('userId');
    expect(res.body.email).toBe('me@ex.com');
  });

  test('POST /register - conflict', async () => {
  const repo = require('../src/adapters/repositories/postgres.repository');
    jest.spyOn(repo, 'getUserByEmail').mockResolvedValue({ userId: 'u1', email: 'me@ex.com' });

    app = require('../handler').app;
    const res = await request(app)
      .post('/register')
      .send({ email: 'me@ex.com', password: 'pass123', name: 'Tester' });

    expect(res.statusCode).toBe(409);
  });

  test('POST /login - success', async () => {
    jest.resetModules();
  const repo = require('../src/adapters/repositories/postgres.repository');
    const hashed = await bcrypt.hash('pass123', 10);
    jest.spyOn(repo, 'getUserByEmail').mockResolvedValue({ userId: 'u1', email: 'me@ex.com', password: hashed, name: 'Tester' });

    app = require('../handler').app;
    const res = await request(app)
      .post('/login')
      .send({ email: 'me@ex.com', password: 'pass123' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.email).toBe('me@ex.com');
  });

  test('POST /login - invalid credentials', async () => {
    jest.resetModules();
  const repo = require('../src/adapters/repositories/postgres.repository');
    jest.spyOn(repo, 'getUserByEmail').mockResolvedValue(null);

    app = require('../handler').app;
    const res = await request(app)
      .post('/login')
      .send({ email: 'noone@ex.com', password: 'wrong' });

    expect(res.statusCode).toBe(401);
  });
});
