# Copilot Instructions: workshop-auth

## Architecture Overview

This is a **serverless authentication microservice** deployed to AWS Lambda via Serverless Framework v4. It provides JWT-based auth endpoints (`/register`, `/login`, `/me`, `/users/:userId`) using **PostgreSQL** as the data store (not DynamoDB, despite Serverless template origins).

Key architectural decisions:
- **Schema owned by monolith**: This service does NOT manage database migrations. The `users` table is created and maintained by a separate monolith application. `postgres.repository.ts` queries against an existing schema (`id`, `name`, `email`, `password`, `is_active`, `created_at`, `updated_at`).
- **Serverless Framework v4 native features**: Uses native TypeScript compilation and dotenv management (`useDotenv: true`), no plugins needed.
- **Express + serverless-http adapter**: `handler.ts` wraps an Express app with `serverless-http` for Lambda compatibility. Also exports the raw `app` for local development and testing.

## Project Structure

```
handler.ts              # Main Lambda handler & Express routes
local-server.ts         # Local dev server (yarn start)
src/
  authService.ts        # Business logic (register, login, getUserById)
  config.ts             # Re-exports from infrastructure/config.ts
  adapters/repositories/
    postgres.repository.ts  # Data access layer (Pool from pg)
  domain/entities/
    user.entity.ts      # IUser interface & User class
  infrastructure/
    config.ts           # Config with simplified dotenv loading
test/
  auth.test.ts          # Mocked integration tests (supertest + jest)
  setup.ts              # Jest global setup
```

## Development Workflow

**Local development**:
```bash
yarn start              # Starts Express server on :3000 (stage=dev)
yarn start:homolog      # Starts with SLS_STAGE=homolog
yarn start:prod         # Starts with SLS_STAGE=prod
```
- Local server uses `.env` file loaded by dotenv
- No need for `cross-env` - native shell variables work in zsh/bash

**Testing**:
```bash
yarn test               # Jest with --runInBand (sequential execution)
```
- Tests use `jest.resetModules()` before each test to mock `postgres.repository` methods cleanly.
- Must set `process.env.JWT_SECRET` before importing `handler`.

**Build & Deploy**:
```bash
yarn build              # TypeScript compilation to dist/
yarn deploy:homolog     # Deploy to AWS (stage=homolog)
yarn deploy:prod        # Deploy to AWS (stage=prod)
```
- Serverless Framework v4 has **native TypeScript support** - no plugins needed for compilation.
- Uses `useDotenv: true` in `serverless.yml` for native environment variable management (loads `.env` automatically).
- AWS profile `fiap` and `LabRole` IAM role are hardcoded in `serverless.yml`.

## Critical Conventions

1. **User IDs are UUIDs (v4)**: If `userId` is not provided during registration, generate one with `uuidv4()`. This maintains compatibility with the monolith's conventions.

2. **Error codes for business logic**:
   - `ALREADY_EXISTS`: User email already registered (409 Conflict)
   - `INVALID_CREDENTIALS`: Login failure (401 Unauthorized)
   - Attach error codes via `err.code = 'CODE_NAME'` before throwing.

3. **Password hashing**: Always use `bcrypt.hash(password, 10)` before storing. Compare with `bcrypt.compare(plaintext, hashed)`.

4. **JWT tokens expire in 8h** (`expiresIn: '8h'`). Token payload: `{ sub: userId, email }`.

5. **Database field mapping**: PostgreSQL uses snake_case (`is_active`, `created_at`, `updated_at`), but TypeScript interfaces use camelCase. SQL queries use `AS` aliases to map columns (e.g., `id as "userId"`).

6. **No table creation logic**: `ensureTable()` in `postgres.repository.ts` is a no-op. Schema is managed externally.

## Environment Variables

Required variables (see `.env.example`):
- `POSTGRES_URL`: PostgreSQL connection string (primary)
- `DATABASE_URL`: Fallback connection string
- `JWT_SECRET`: Secret for signing JWTs (use strong random string)
- `SLS_STAGE` or `NODE_ENV`: Determines environment (dev/homolog/prod)

**Note**: Serverless Framework v4 loads `.env` automatically when `useDotenv: true` is set. For local development, dotenv is loaded in `config.ts`.

## Testing Patterns

- **Module reset pattern**: Call `jest.resetModules()` at the start of each test to isolate mocks.
- **Mock repository methods**: Use `jest.spyOn(repo, 'methodName').mockResolvedValue(...)` after reset.
- **Import handler AFTER mocking**: `app = require('../handler').app` must come after setting up mocks.
- **Hashed passwords in mocks**: When mocking login tests, pre-hash passwords with `bcrypt.hash()` to match real behavior.

Example:
```typescript
jest.resetModules();
const repo = require('../src/adapters/repositories/postgres.repository');
jest.spyOn(repo, 'getUserByEmail').mockResolvedValue(null);
const app = require('../handler').app;
```

## Common Tasks

**Adding a new endpoint**: Edit `handler.ts` → Add route → Implement logic in `authService.ts` → Add repository method if needed.

**Changing JWT expiration**: Modify `expiresIn` value in `authService.ts` `login()` function.

**Adding a new environment variable**: Update `src/infrastructure/config.ts` and `.env.example`.

## Serverless Framework v4 Notes

- **No build plugins required**: TypeScript is compiled natively by Serverless Framework.
- **Native dotenv**: Set `useDotenv: true` in `serverless.yml` - no manual env file loading needed in Lambda.
- **Removed dependencies**: `serverless-plugin-typescript` and `cross-env` are no longer needed.
