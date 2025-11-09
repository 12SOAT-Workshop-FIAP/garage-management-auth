const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Determine stage: prefer SLS_STAGE (set by Serverless), fallback to NODE_ENV or 'dev'
const stage = process.env.SLS_STAGE || process.env.NODE_ENV || 'dev';
const envFile = path.resolve(process.cwd(), `.env.${stage}`);

// Load .env.<stage> if present, otherwise fall back to .env
if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile });
} else {
  dotenv.config();
}

const config = {
  authDb: 'postgres', // project uses Postgres only
  stage,
  usersTable: process.env.USERS_TABLE || `users-table-${stage}`,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  postgresUrl: process.env.POSTGRES_URL || process.env.DATABASE_URL || null,
};

module.exports = config;
