export interface AuthUser {
    id: string;
    email: string;
    name?: string;
    role?: string;
}
export declare function generateToken(user: AuthUser): string;
export declare function verifyToken(token: string): AuthUser | null;
export declare function hashPassword(password: string): Promise<string>;
export declare function comparePassword(password: string, hash: string): Promise<boolean>;
export declare const authOptions: {
    secret: string;
    pages: {
        signIn: string;
        signUp: string;
    };
};
//# sourceMappingURL=auth.d.ts.map