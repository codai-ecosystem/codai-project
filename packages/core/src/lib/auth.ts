import jwt from 'jsonwebtoken';
import { env } from './env';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(user, env.JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, env.JWT_SECRET) as AuthUser;
  } catch {
    return null;
  }
}

export function hashPassword(password: string): Promise<string> {
  const bcrypt = require('bcrypt');
  return bcrypt.hash(password, 10);
}

export function comparePassword(password: string, hash: string): Promise<boolean> {
  const bcrypt = require('bcrypt');
  return bcrypt.compare(password, hash);
}

export const authOptions = {
  secret: env.JWT_SECRET,
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
  },
};