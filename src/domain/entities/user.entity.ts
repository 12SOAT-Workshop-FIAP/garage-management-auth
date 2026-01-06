export interface IUser {
  userId: string;
  name: string | null;
  email: string;
  cpf: string | null;
  password: string;
  isActive: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export class User implements IUser {
  userId: string;
  name: string | null;
  email: string;
  cpf: string | null;
  password: string;
  isActive: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;

  constructor({
    userId,
    name,
    email,
    cpf,
    password,
    isActive = true,
    createdAt = null,
    updatedAt = null,
  }: {
    userId: string;
    name: string | null;
    email: string;
    cpf: string | null;
    password: string;
    isActive?: boolean;
    createdAt?: Date | null;
    updatedAt?: Date | null;
  }) {
    this.userId = userId;
    this.name = name;
    this.email = email;
    this.cpf = cpf;
    this.password = password;
    this.isActive = isActive;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
