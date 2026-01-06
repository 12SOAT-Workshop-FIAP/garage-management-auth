// Lightweight adapter to new service layers
import express, { Request, Response, NextFunction } from 'express';
import serverless from 'serverless-http';
import jwt from 'jsonwebtoken';
import * as auth from './src/authService';
import config from './src/config';

const app = express();
app.use(express.json());

// initialize (create tables when using Postgres)
auth.init().catch((err) => console.error('Auth init error', err));

interface AuthRequest extends Request {
  user?: jwt.JwtPayload;
}

function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization || '';
  const [, token] = authHeader.split(' ');
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    const payload = jwt.verify(token, config.jwtSecret) as jwt.JwtPayload;
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

async function cpfValidationMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const cpf = req.headers['x-cpf'] as string;
  
  if (!cpf) {
    return res.status(400).json({ error: 'CPF header (x-cpf) is required' });
  }
  
  try {
    // Buscar usuário pelo CPF
    const userByCpf = await auth.getUserByCpf(cpf);
    
    if (!userByCpf) {
      return res.status(404).json({ error: 'User with provided CPF not found' });
    }
    
    // Verificar se o CPF pertence ao usuário autenticado
    if (!req.user || req.user.sub !== userByCpf.userId) {
      return res.status(403).json({ error: 'CPF does not belong to authenticated user' });
    }
    
    return next();
  } catch (err) {
    console.error('CPF validation error:', err);
    return res.status(500).json({ error: 'CPF validation failed' });
  }
}

app.post('/register', async (req: Request, res: Response) => {
  try {
    const { userId, name, email, cpf, password } = req.body || {};
    const result = await auth.register({ userId, name, email, cpf, password });
    return res.status(201).json(result);
  } catch (err: any) {
    if (err.code === 'ALREADY_EXISTS')
      return res.status(409).json({ error: 'User already exists' });
    console.error(err);
    return res.status(500).json({ error: err.message || 'Could not create user' });
  }
});

app.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body || {};
    const result = await auth.login({ email, password });
    return res.json(result);
  } catch (err: any) {
    if (err.code === 'INVALID_CREDENTIALS')
      return res.status(401).json({ error: 'Invalid credentials' });
    console.error(err);
    return res.status(500).json({ error: err.message || 'Login failed' });
  }
});

app.get('/me', authMiddleware, cpfValidationMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const u = await auth.getUserById(req.user!.sub as string);
    if (!u) return res.status(404).json({ error: 'User not found' });
    const { userId, name, email } = u;
    return res.json({ userId, name, email });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Could not retrieve user' });
  }
});

// compatibility
app.get('/users/:userId', async (req: Request, res: Response) => {
  try {
    const item = await auth.getUserById(req.params.userId);
    if (!item)
      return res.status(404).json({ error: 'Could not find user with provided "userId"' });
    const { userId, name, email } = item;
    return res.json({ userId, name, email });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Could not retrieve user' });
  }
});

app.use((req: Request, res: Response) => res.status(404).json({ error: 'Not Found' }));

export const handler = serverless(app);
// Export express app for testing (supertest)
export { app };
