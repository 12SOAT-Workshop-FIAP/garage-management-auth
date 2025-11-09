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

Microserviço serverless responsável por autenticação (register/login) com duas opções de persistência: DynamoDB ou Postgres.

Principais rotas
- POST /register { email, password, name?, userId? }
- POST /login { email, password } => retorna { token }
- GET /me (Authorization: Bearer <token>) => dados do usuário
- GET /users/:userId => compatibilidade com versão anterior

Ambientes
- homolog: use `--stage homolog`
- prod: use `--stage prod`

Variáveis de ambiente importantes
- `AUTH_DB` = `dynamo` | `postgres` (default `dynamo`)
- `USERS_TABLE` = nome da tabela Dynamo (usado em Dynamo)
- `POSTGRES_URL` = connection string para Postgres (ex: postgres://user:pass@host:5432/db)
- `JWT_SECRET` = segredo para assinar tokens JWT

Usando arquivos .env por stage
- Você pode definir as variáveis em arquivos `.env.dev` e `.env.prod` na raiz do serviço. O serviço carrega automaticamente `.env.<stage>` (por exemplo `.env.dev` quando `SLS_STAGE=dev` ou `--stage dev`) e, se não existir, carrega `.env`.
- Exemplo: crie `.env.dev` com `POSTGRES_URL` e `JWT_SECRET` para desenvolvimento. Há templates em `.env.dev` e `.env.prod` neste repositório.

Deploy rápido
1. Instale dependências:

```powershell
cd workshop-auth
npm install
```

2. Deploy para homolog (DynamoDB):

```powershell
$env:JWT_SECRET = 'sua-chave-de-homologacao'
npx serverless deploy --stage homolog --region us-east-1
```

Usando Postgres
- Para usar Postgres, defina `AUTH_DB=postgres` e `POSTGRES_URL` antes do deploy. O código criará a tabela `users` automaticamente na primeira execução (recomendado usar migrações reais em produção):

```powershell
$env:AUTH_DB = 'postgres'
$env:POSTGRES_URL = 'postgres://user:pass@host:5432/db'
$env:JWT_SECRET = '...'
npx serverless deploy --stage homolog --region us-east-1
```

Observações e próximos passos
- Para produção, armazene `JWT_SECRET` em Secrets Manager/SSM e injete no deploy/CI.
- Recomendado: usar migrações (ex: node-pg-migrate, knex) para Postgres em vez de criar tabela automaticamente.
- Não esqueça de `npx serverless remove --stage homolog --region us-east-1` para liberar recursos do lab.
