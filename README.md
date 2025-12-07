<!--
title: 'Serverless Framework Node Express API service backed by DynamoDB on AWS'
description: 'This template demonstrates how to develop and deploy a simple Node Express API service backed by DynamoDB running on AWS Lambda using the Serverless Framework.'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
priority: 1
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# workshop-auth

Microserviço serverless responsável por autenticação (register/login) usando PostgreSQL, desenvolvido em **TypeScript**.

## Principais rotas
- POST /register { email, password, name?, userId? }
- POST /login { email, password } => retorna { token }
- GET /me (Authorization: Bearer <token>) => dados do usuário
- GET /users/:userId => compatibilidade com versão anterior

## Tecnologias
- **TypeScript** - Tipagem estática e segurança
- **Node.js 20.x** - Runtime
- **Express** - Framework web
- **PostgreSQL** - Banco de dados
- **Serverless Framework** - Deploy AWS Lambda
- **Jest + ts-jest** - Testes

## Ambientes
- dev: desenvolvimento local
- homolog: use `--stage homolog`
- prod: use `--stage prod`

## Variáveis de ambiente
- `POSTGRES_URL` = connection string para Postgres (ex: postgres://user:pass@host:5432/db)
- `JWT_SECRET` = segredo para assinar tokens JWT
- `NODE_ENV` / `SLS_STAGE` = ambiente (dev/homolog/prod)
- `PORT` = porta para servidor local (padrão: 3000)

## Usando arquivos .env por stage
- Você pode definir as variáveis em arquivos `.env.dev`, `.env.homolog` e `.env.prod` na raiz do serviço. 
- O serviço carrega automaticamente `.env.<stage>` (por exemplo `.env.dev` quando `SLS_STAGE=dev` ou `--stage dev`) e, se não existir, carrega `.env`.
- Exemplo: copie `.env.example` para `.env.dev` e preencha com suas credenciais.

## Setup inicial

1. Instale dependências:
```bash
yarn install
# ou
npm install
```

2. Configure variáveis de ambiente:
```bash
cp .env.example .env.dev
# Edite .env.dev com suas credenciais
```

3. Build TypeScript:
```bash
yarn build
# ou
npm run build
```

## Desenvolvimento local

Execute o servidor local:
```bash
yarn start
# ou
npm start
```

O servidor estará disponível em `http://localhost:3000`

Para rodar em outros ambientes:
```bash
yarn start:homolog
yarn start:prod
```

## Testes

Execute os testes:
```bash
yarn test
# ou
npm test
```

## Deploy

Deploy para homolog:
```bash
yarn deploy:homolog
# ou
npm run deploy:homolog
```

Deploy para prod:
```bash
yarn deploy:prod
# ou
npm run deploy:prod
```

## Estrutura do projeto

```
├── src/
│   ├── domain/
│   │   └── entities/         # Entidades de domínio
│   ├── adapters/
│   │   └── repositories/     # Implementação de repositórios
│   ├── infrastructure/       # Configurações
│   ├── authService.ts        # Lógica de negócio
│   └── config.ts             # Export de config
├── test/                     # Testes
├── handler.ts                # Lambda handler
├── local-server.ts           # Servidor local
├── tsconfig.json             # Configuração TypeScript
├── jest.config.js            # Configuração Jest
└── serverless.yml            # Configuração Serverless

```

## Observações e próximos passos
- Para produção, armazene `JWT_SECRET` em Secrets Manager/SSM
- Recomendado: usar migrações (ex: node-pg-migrate, knex) para Postgres
- O código TypeScript é compilado automaticamente no deploy pelo plugin `serverless-plugin-typescript`
- Não esqueça de `npx serverless remove --stage homolog --region us-east-1` para liberar recursos do lab
