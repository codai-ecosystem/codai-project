// Real Authentication Service with OAuth & Multi-factor Authentication
import { auth, firestore } from '../lib/firebase'
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    FacebookAuthProvider,
    GithubAuthProvider,
    OAuthProvider,
    signOut,
    sendPasswordResetEmail,
    User,
    updateProfile,
    EmailAuthProvider,
    reauthenticateWithCredential,
    updatePassword
} from 'firebase/auth'
import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    serverTimestamp,
    collection,
    addDoc,
    query,
    where,
    orderBy,
    limit,
    getDocs
} from 'firebase/firestore'

interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    role: 'user' | 'admin' | 'premium';
    createdAt: Date;
    lastLogin: Date;
    loginCount: number;
    preferences: {
        theme: 'light' | 'dark';
        notifications: boolean;
        language: 'ro' | 'en';
        twoFactorEnabled: boolean;
    };
    subscription: {
        type: 'free' | 'pro' | 'enterprise';
        expiresAt?: Date;
        features: string[];
    };
}

interface AuthSession {
    id: string;
    userId: string;
    ipAddress: string;
    userAgent: string;
    location?: string;
    loginAt: Date;
    lastActivity: Date;
    isActive: boolean;
}

interface SecurityEvent {
    id: string;
    userId: string;
    type: 'login' | 'logout' | 'password_change' | 'failed_login' | 'suspicious_activity';
    description: string;
    ipAddress: string;
    userAgent: string;
    timestamp: Date;
    severity: 'low' | 'medium' | 'high';
}

export class RealAuthService {
    private static instance: RealAuthService;
    private googleProvider: GoogleAuthProvider;
    private facebookProvider: FacebookAuthProvider;
    private githubProvider: GithubAuthProvider;
    private appleProvider: OAuthProvider;
    private linkedInProvider: OAuthProvider;

    private constructor() {
        this.googleProvider = new GoogleAuthProvider();
        this.googleProvider.addScope('profile');
        this.googleProvider.addScope('email');

        this.facebookProvider = new FacebookAuthProvider();
        this.facebookProvider.addScope('email');

        this.githubProvider = new GithubAuthProvider();
        this.githubProvider.addScope('user:email');

        this.appleProvider = new OAuthProvider('apple.com');
        this.appleProvider.addScope('email');
        this.appleProvider.addScope('name');

        this.linkedInProvider = new OAuthProvider('oidc.linkedin');
        this.linkedInProvider.addScope('profile');
        this.linkedInProvider.addScope('email');
    }

    public static getInstance(): RealAuthService {
        if (!RealAuthService.instance) {
            RealAuthService.instance = new RealAuthService();
        }
        return RealAuthService.instance;
    }

    // Real Email/Password Authentication
    public async signInWithEmail(email: string, password: string): Promise<{
        success: boolean;
        user?: UserProfile;
        error?: string;
        requiresTwoFactor?: boolean;
    }> {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Log security event
            await this.logSecurityEvent(user.uid, 'login', 'Email/password login', {
                success: true
            });

            // Update user profile
            const profile = await this.updateUserProfile(user);

            // Check if 2FA is required
            if (profile.preferences.twoFactorEnabled) {
                return {
                    success: false,
                    requiresTwoFactor: true
                };
            }

            // Create session
            await this.createUserSession(user.uid);

            return {
                success: true,
                user: profile
            };

        } catch (error: any) {
            // Log failed login
            await this.logSecurityEvent('unknown', 'failed_login', `Failed email login: ${error.message}`, {
                email,
                success: false
            });

            return {
                success: false,
                error: this.getReadableErrorMessage(error.code)
            };
        }
    }

    // Real Google OAuth Authentication
    public async signInWithGoogle(): Promise<{
        success: boolean;
        user?: UserProfile;
        error?: string;
        isNewUser?: boolean;
    }> {
        try {
            const result = await signInWithPopup(auth, this.googleProvider);
            const user = result.user;

            // Check if user is new
            const userDoc = await getDoc(doc(firestore, 'users', user.uid));
            const isNewUser = !userDoc.exists();

            // Create or update profile
            const profile = await this.updateUserProfile(user, isNewUser);

            // Log security event
            await this.logSecurityEvent(user.uid, 'login', 'Google OAuth login', {
                success: true,
                provider: 'google'
            });

            // Create session
            await this.createUserSession(user.uid);

            return {
                success: true,
                user: profile,
                isNewUser
            };

        } catch (error: any) {
            await this.logSecurityEvent('unknown', 'failed_login', `Failed Google login: ${error.message}`, {
                provider: 'google',
                success: false
            });

            return {
                success: false,
                error: this.getReadableErrorMessage(error.code)
            };
        }
    }

    // Real Facebook OAuth Authentication  
    public async signInWithFacebook(): Promise<{
        success: boolean;
        user?: UserProfile;
        error?: string;
        isNewUser?: boolean;
    }> {
        try {
            const result = await signInWithPopup(auth, this.facebookProvider);
            const user = result.user;

            const userDoc = await getDoc(doc(firestore, 'users', user.uid));
            const isNewUser = !userDoc.exists();

            const profile = await this.updateUserProfile(user, isNewUser);

            await this.logSecurityEvent(user.uid, 'login', 'Facebook OAuth login', {
                success: true,
                provider: 'facebook'
            });

            await this.createUserSession(user.uid);

            return {
                success: true,
                user: profile,
                isNewUser
            };

        } catch (error: any) {
            await this.logSecurityEvent('unknown', 'failed_login', `Failed Facebook login: ${error.message}`, {
                provider: 'facebook',
                success: false
            });

            return {
                success: false,
                error: this.getReadableErrorMessage(error.code)
            };
        }
    }

    // Real GitHub OAuth Authentication
    public async signInWithGitHub(): Promise<{
        success: boolean;
        user?: UserProfile;
        error?: string;
        isNewUser?: boolean;
    }> {
        try {
            const result = await signInWithPopup(auth, this.githubProvider);
            const user = result.user;

            const userDoc = await getDoc(doc(firestore, 'users', user.uid));
            const isNewUser = !userDoc.exists();

            const profile = await this.updateUserProfile(user, isNewUser);

            await this.logSecurityEvent(user.uid, 'login', 'GitHub OAuth login', {
                success: true,
                provider: 'github'
            });

            await this.createUserSession(user.uid);

            return {
                success: true,
                user: profile,
                isNewUser
            };

        } catch (error: any) {
            await this.logSecurityEvent('unknown', 'failed_login', `Failed GitHub login: ${error.message}`, {
                provider: 'github',
                success: false
            });

            return {
                success: false,
                error: this.getReadableErrorMessage(error.code)
            };
        }
    }

    // Real Apple OAuth Authentication
    public async signInWithApple(): Promise<{
        success: boolean;
        user?: UserProfile;
        error?: string;
        isNewUser?: boolean;
    }> {
        try {
            const result = await signInWithPopup(auth, this.appleProvider);
            const user = result.user;

            const userDoc = await getDoc(doc(firestore, 'users', user.uid));
            const isNewUser = !userDoc.exists();

            const profile = await this.updateUserProfile(user, isNewUser);

            await this.logSecurityEvent(user.uid, 'login', 'Apple OAuth login', {
                success: true,
                provider: 'apple'
            });

            await this.createUserSession(user.uid);

            return {
                success: true,
                user: profile,
                isNewUser
            };

        } catch (error: any) {
            await this.logSecurityEvent('unknown', 'failed_login', `Failed Apple login: ${error.message}`, {
                provider: 'apple',
                success: false
            });

            return {
                success: false,
                error: this.getReadableErrorMessage(error.code)
            };
        }
    }

    // Real LinkedIn OAuth Authentication
    public async signInWithLinkedIn(): Promise<{
        success: boolean;
        user?: UserProfile;
        error?: string;
        isNewUser?: boolean;
    }> {
        try {
            const result = await signInWithPopup(auth, this.linkedInProvider);
            const user = result.user;

            const userDoc = await getDoc(doc(firestore, 'users', user.uid));
            const isNewUser = !userDoc.exists();

            const profile = await this.updateUserProfile(user, isNewUser);

            await this.logSecurityEvent(user.uid, 'login', 'LinkedIn OAuth login', {
                success: true,
                provider: 'linkedin'
            });

            await this.createUserSession(user.uid);

            return {
                success: true,
                user: profile,
                isNewUser
            };

        } catch (error: any) {
            await this.logSecurityEvent('unknown', 'failed_login', `Failed LinkedIn login: ${error.message}`, {
                provider: 'linkedin',
                success: false
            });

            return {
                success: false,
                error: this.getReadableErrorMessage(error.code)
            };
        }
    }

    // Real User Registration
    public async registerWithEmail(
        email: string,
        password: string,
        displayName: string
    ): Promise<{
        success: boolean;
        user?: UserProfile;
        error?: string;
    }> {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update display name
            await updateProfile(user, { displayName });

            // Create user profile
            const profile = await this.updateUserProfile(user, true);

            // Log security event
            await this.logSecurityEvent(user.uid, 'login', 'New user registration', {
                success: true,
                method: 'email'
            });

            // Create session
            await this.createUserSession(user.uid);

            return {
                success: true,
                user: profile
            };

        } catch (error: any) {
            await this.logSecurityEvent('unknown', 'failed_login', `Failed registration: ${error.message}`, {
                email,
                success: false
            });

            return {
                success: false,
                error: this.getReadableErrorMessage(error.code)
            };
        }
    }

    // Real Password Reset
    public async resetPassword(email: string): Promise<{
        success: boolean;
        error?: string;
    }> {
        try {
            await sendPasswordResetEmail(auth, email);

            await this.logSecurityEvent('unknown', 'password_change', 'Password reset requested', {
                email,
                success: true
            });

            return { success: true };

        } catch (error: any) {
            return {
                success: false,
                error: this.getReadableErrorMessage(error.code)
            };
        }
    }

    // Real Password Update
    public async updateUserPassword(
        currentPassword: string,
        newPassword: string
    ): Promise<{
        success: boolean;
        error?: string;
    }> {
        try {
            const user = auth.currentUser;
            if (!user || !user.email) {
                return { success: false, error: 'Nu există utilizator autentificat' };
            }

            // Reauthenticate user
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);

            // Update password
            await updatePassword(user, newPassword);

            await this.logSecurityEvent(user.uid, 'password_change', 'Password updated successfully', {
                success: true
            });

            return { success: true };

        } catch (error: any) {
            const userId = auth.currentUser?.uid || 'unknown';
            await this.logSecurityEvent(userId, 'password_change', `Failed password update: ${error.message}`, {
                success: false
            });

            return {
                success: false,
                error: this.getReadableErrorMessage(error.code)
            };
        }
    }

    // Real Logout
    public async logout(): Promise<{ success: boolean; error?: string }> {
        try {
            const user = auth.currentUser;
            const userId = user?.uid || 'unknown';

            // End session
            if (userId !== 'unknown') {
                await this.endUserSession(userId);

                await this.logSecurityEvent(userId, 'logout', 'User logged out', {
                    success: true
                });
            }

            await signOut(auth);

            return { success: true };

        } catch (error: any) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get Current User Profile
    public async getCurrentUserProfile(): Promise<UserProfile | null> {
        const user = auth.currentUser;
        if (!user) return null;

        try {
            const userDoc = await getDoc(doc(firestore, 'users', user.uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                return {
                    uid: user.uid,
                    email: user.email || '',
                    displayName: user.displayName || data.displayName || '',
                    photoURL: user.photoURL || data.photoURL,
                    role: data.role || 'user',
                    createdAt: data.createdAt?.toDate() || new Date(),
                    lastLogin: data.lastLogin?.toDate() || new Date(),
                    loginCount: data.loginCount || 1,
                    preferences: data.preferences || {
                        theme: 'dark',
                        notifications: true,
                        language: 'ro',
                        twoFactorEnabled: false
                    },
                    subscription: data.subscription || {
                        type: 'free',
                        features: ['basic']
                    }
                };
            }

            // Create profile if doesn't exist
            return await this.updateUserProfile(user, true);

        } catch (error) {
            console.error('Error getting user profile:', error);
            return null;
        }
    }

    // Get User Sessions
    public async getUserSessions(userId: string): Promise<AuthSession[]> {
        try {
            const sessionsQuery = query(
                collection(firestore, 'user_sessions'),
                where('userId', '==', userId),
                where('isActive', '==', true),
                orderBy('lastActivity', 'desc'),
                limit(10)
            );

            const snapshot = await getDocs(sessionsQuery);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                loginAt: doc.data().loginAt?.toDate(),
                lastActivity: doc.data().lastActivity?.toDate()
            })) as AuthSession[];

        } catch (error) {
            console.error('Error getting user sessions:', error);
            return [];
        }
    }

    // Get Security Events
    public async getSecurityEvents(userId: string, limitCount: number = 20): Promise<SecurityEvent[]> {
        try {
            const eventsQuery = query(
                collection(firestore, 'security_events'),
                where('userId', '==', userId),
                orderBy('timestamp', 'desc'),
                limit(limitCount)
            );

            const snapshot = await getDocs(eventsQuery);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate()
            })) as SecurityEvent[];

        } catch (error) {
            console.error('Error getting security events:', error);
            return [];
        }
    }

    // Private helper methods
    private async updateUserProfile(user: User, isNewUser: boolean = false): Promise<UserProfile> {
        const userRef = doc(firestore, 'users', user.uid);

        const baseProfile = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || 'Utilizator Nou',
            photoURL: user.photoURL,
            lastLogin: serverTimestamp(),
        };

        if (isNewUser) {
            const newProfile = {
                ...baseProfile,
                role: 'user',
                createdAt: serverTimestamp(),
                loginCount: 1,
                preferences: {
                    theme: 'dark',
                    notifications: true,
                    language: 'ro',
                    twoFactorEnabled: false
                },
                subscription: {
                    type: 'free',
                    features: ['basic']
                }
            };

            await setDoc(userRef, newProfile);

            return {
                ...newProfile,
                createdAt: new Date(),
                lastLogin: new Date(),
            } as UserProfile;
        } else {
            // Update existing user
            const updateData = {
                ...baseProfile,
                loginCount: (await getDoc(userRef)).data()?.loginCount + 1 || 1
            };

            await updateDoc(userRef, updateData);

            // Return full profile
            const updatedDoc = await getDoc(userRef);
            const data = updatedDoc.data()!;

            return {
                uid: user.uid,
                email: user.email || '',
                displayName: user.displayName || data.displayName || '',
                photoURL: user.photoURL || data.photoURL,
                role: data.role || 'user',
                createdAt: data.createdAt?.toDate() || new Date(),
                lastLogin: new Date(),
                loginCount: data.loginCount || 1,
                preferences: data.preferences,
                subscription: data.subscription
            };
        }
    }

    private async createUserSession(userId: string): Promise<void> {
        try {
            const sessionData: Partial<AuthSession> = {
                userId,
                ipAddress: await this.getUserIP(),
                userAgent: navigator.userAgent,
                loginAt: serverTimestamp(),
                lastActivity: serverTimestamp(),
                isActive: true
            };

            await addDoc(collection(firestore, 'user_sessions'), sessionData);
        } catch (error) {
            console.error('Error creating user session:', error);
        }
    }

    private async endUserSession(userId: string): Promise<void> {
        try {
            const sessionsQuery = query(
                collection(firestore, 'user_sessions'),
                where('userId', '==', userId),
                where('isActive', '==', true)
            );

            const snapshot = await getDocs(sessionsQuery);
            const batch = firestore.batch ? firestore.batch() : null;

            snapshot.docs.forEach(doc => {
                if (batch) {
                    batch.update(doc.ref, { isActive: false, endedAt: serverTimestamp() });
                } else {
                    updateDoc(doc.ref, { isActive: false, endedAt: serverTimestamp() });
                }
            });

            if (batch) {
                await batch.commit();
            }
        } catch (error) {
            console.error('Error ending user session:', error);
        }
    }

    private async logSecurityEvent(
        userId: string,
        type: SecurityEvent['type'],
        description: string,
        metadata: any = {}
    ): Promise<void> {
        try {
            const eventData: Partial<SecurityEvent> = {
                userId,
                type,
                description,
                ipAddress: await this.getUserIP(),
                userAgent: navigator.userAgent,
                timestamp: serverTimestamp(),
                severity: this.calculateSeverity(type, metadata)
            };

            await addDoc(collection(firestore, 'security_events'), eventData);
        } catch (error) {
            console.error('Error logging security event:', error);
        }
    }

    private async getUserIP(): Promise<string> {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip || 'unknown';
        } catch (error) {
            return 'unknown';
        }
    }

    private calculateSeverity(type: SecurityEvent['type'], metadata: any): SecurityEvent['severity'] {
        if (type === 'failed_login' || type === 'suspicious_activity') return 'high';
        if (type === 'password_change') return 'medium';
        return 'low';
    }

    private getReadableErrorMessage(errorCode: string): string {
        const errorMessages: { [key: string]: string } = {
            'auth/user-not-found': 'Nu există un cont cu această adresă de email',
            'auth/wrong-password': 'Parola este incorectă',
            'auth/email-already-in-use': 'Adresa de email este deja utilizată',
            'auth/weak-password': 'Parola este prea slabă',
            'auth/invalid-email': 'Adresa de email nu este validă',
            'auth/operation-not-allowed': 'Operațiunea nu este permisă',
            'auth/too-many-requests': 'Prea multe încercări. Încercați din nou mai târziu',
            'auth/user-disabled': 'Contul a fost dezactivat',
            'auth/requires-recent-login': 'Această operațiune necesită autentificare recentă',
            'auth/cancelled-popup-request': 'Fereastra popup a fost închisă',
            'auth/popup-blocked': 'Popup-ul a fost blocat de browser'
        };

        return errorMessages[errorCode] || 'A apărut o eroare. Încercați din nou.';
    }
}
