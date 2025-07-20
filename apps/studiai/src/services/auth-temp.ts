import type { User as FirebaseUser } from 'firebase/auth';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type {
    AuthCredentials,
    AuthResponse,
    RegisterCredentials,
    User,
} from '@/types/auth';

export class AuthService {
    /**
     * Convert Firebase User to our User type
     */
    private static convertFirebaseUser(firebaseUser: FirebaseUser): User {
        return {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || firebaseUser.email || '',
            role: 'user',
            avatar: firebaseUser.photoURL || undefined,
            image: firebaseUser.photoURL || undefined,
            displayName: firebaseUser.displayName || undefined,
            photoURL: firebaseUser.photoURL || undefined,
            emailVerified: firebaseUser.emailVerified,
            preferences: {
                theme: 'system' as const,
                language: 'en',
                emailNotifications: true,
                pushNotifications: true,
                notifications: {
                    email: true,
                    push: true,
                    inApp: true,
                    marketing: false,
                }
            },
            createdAt: new Date(),
            updatedAt: new Date(),
            lastLoginAt: new Date(),
        };
    }

    static async signInWithEmail(credentials: AuthCredentials): Promise<AuthResponse> {
        try {
            const result = await signInWithEmailAndPassword(
                auth,
                credentials.email,
                credentials.password
            );
            const user = this.convertFirebaseUser(result.user);
            return { success: true, user, error: null };
        } catch (error: unknown) {
            return {
                success: false,
                user: undefined,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    static async signUpWithEmail(credentials: RegisterCredentials): Promise<AuthResponse> {
        try {
            const result = await createUserWithEmailAndPassword(
                auth,
                credentials.email,
                credentials.password
            );
            const user = this.convertFirebaseUser(result.user);
            return { success: true, user, error: null };
        } catch (error: unknown) {
            return {
                success: false,
                user: undefined,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    static async signInWithGoogle(): Promise<AuthResponse> {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = this.convertFirebaseUser(result.user);
            return { success: true, user, error: null };
        } catch (error: unknown) {
            return {
                success: false,
                user: undefined,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    static async sendPasswordReset(email: string): Promise<AuthResponse> {
        try {
            await sendPasswordResetEmail(auth, email);
            return { success: true, message: 'Password reset email sent' };
        } catch (error: unknown) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    static async signOut(): Promise<void> {
        await signOut(auth);
    }
}

export const authService = AuthService;
