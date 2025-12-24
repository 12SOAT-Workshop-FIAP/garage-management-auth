import dotenv from 'dotenv';

// Load .env for local development (Serverless Framework v4 handles this automatically in Lambda)
// For local dev server, we still need to load .env manually
if (process.env.NODE_ENV !== 'production' && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  dotenv.config();
}

const stage = process.env.SLS_STAGE || process.env.NODE_ENV || 'dev';

interface Config {
  authDb: string;
  stage: string;
  usersTable: string;
  jwtSecret: string;
  postgresUrl: string | null;
}

const config: Config = {
  authDb: 'postgres', // project uses Postgres only
  stage,
  usersTable: process.env.USERS_TABLE || `users-table-${stage}`,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  postgresUrl: process.env.POSTGRES_URL || null,
};

export default config;
