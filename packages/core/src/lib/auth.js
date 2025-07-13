import jwt from 'jsonwebtoken';
import { env } from './env';
export function generateToken(user) {
    return jwt.sign(user, env.JWT_SECRET, { expiresIn: '7d' });
}
export function verifyToken(token) {
    try {
        return jwt.verify(token, env.JWT_SECRET);
    }
    catch (_a) {
        return null;
    }
}
export function hashPassword(password) {
    const bcrypt = require('bcrypt');
    return bcrypt.hash(password, 10);
}
export function comparePassword(password, hash) {
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
