import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import config from "./config";
import * as repo from "./adapters/repositories/postgres.repository";
import { IUser } from "./domain/entities/user.entity";

export async function init(): Promise<void> {
  // table/schema is managed by the monolith; nothing to do here
  if (repo && repo.ensureTable) {
    try {
      await repo.ensureTable();
    } catch (err) {
      // ignore
    }
  }
}

interface RegisterInput {
  userId?: string;
  name?: string;
  email: string;
  cpf?: string;
  password: string;
}

interface RegisterOutput {
  userId: string;
  email: string;
  name: string | null;
}

export async function register({
  userId,
  name,
  email,
  cpf,
  password,
}: RegisterInput): Promise<RegisterOutput> {
  if (!email || !password) throw new Error("email and password required");
  const existing = await repo.getUserByEmail(email);
  if (existing) {
    const err = new Error("User exists") as Error & { code: string };
    err.code = "ALREADY_EXISTS";
    throw err;
  }
  // ID should follow monolith conventions (uuid). If not provided, generate a v4 uuid.
  const id = userId || uuidv4();
  const hashed = await bcrypt.hash(password, 10);
  const user = {
    userId: id,
    name: name || null,
    email,
    cpf: cpf || null,
    password: hashed,
  };
  await repo.createUser(user);
  return { userId: id, email, name: user.name };
}

interface LoginInput {
  email: string;
  password: string;
  cpf: string;
}

interface LoginOutput {
  token: string;
  userId: string;
  email: string;
  name: string | null;
}

export async function login({
  email,
  password,
  cpf,
}: LoginInput): Promise<LoginOutput> {
  if (!email && !cpf) throw new Error("Email or cpf its required");
  if (!password) throw new Error("Password required");

  const user = email ? await repo.getUserByEmail(email) : await repo.getUserByCpf(cpf);
  if (!user) {
    const err = new Error("Invalid credentials") as Error & { code: string };
    err.code = "INVALID_CREDENTIALS";
    throw err;
  }
  const match = await bcrypt.compare(password, user.password || "");
  if (!match) {
    const err = new Error("Invalid credentials") as Error & { code: string };
    err.code = "INVALID_CREDENTIALS";
    throw err;
  }
  const token = jwt.sign(
    { sub: user.userId, email: user.email },
    config.jwtSecret,
    {
      expiresIn: "8h",
    }
  );
  return {
    token,
    userId: user.userId,
    email: user.email,
    name: user.name || null,
  };
}

export async function getUserById(userId: string): Promise<IUser | null> {
  return await repo.getUserById(userId);
}

export async function getUserByCpf(cpf: string): Promise<IUser | null> {
  return await repo.getUserByCpf(cpf);
}
