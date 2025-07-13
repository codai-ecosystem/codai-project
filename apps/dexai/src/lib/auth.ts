import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import type { User, AuthResponse, LoginCredentials, RegisterCredentials } from './types';

export class AuthService {
  static async signIn(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const result = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
      const user = await this.getUserData(result.user);
      if (!user) {
        return { success: false, error: 'User data not found' };
      }
      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sign in failed'
      };
    }
  }

  static async signUp(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const result = await createUserWithEmailAndPassword(auth, credentials.email, credentials.password);
      
      // Create user document in Firestore
      const user: User = {
        id: result.user.uid,
        email: credentials.email,
        displayName: credentials.displayName,
        role: 'user',
        profile: {
          preferences: {
            language: 'ro',
            theme: 'auto',
            notifications: true,
            audioAutoplay: false,
            difficultyLevel: 1
          }
        },
        statistics: {
          wordsSearched: 0,
          contributionsCount: 0,
          achievementPoints: 0
        },
        favorites: [],
        searchHistory: [],
        created: Timestamp.now(),
        lastActive: Timestamp.now()
      };

      await setDoc(doc(db, 'users', result.user.uid), user);
      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sign up failed'
      };
    }
  }

  static async signInWithGoogle(): Promise<AuthResponse> {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user document exists, create if not
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (!userDoc.exists()) {
        const user: User = {
          id: result.user.uid,
          email: result.user.email!,
          displayName: result.user.displayName || 'User',
          role: 'user',
          profile: {
            avatar: result.user.photoURL || undefined,
            preferences: {
              language: 'ro',
              theme: 'auto',
              notifications: true,
              audioAutoplay: false,
              difficultyLevel: 1
            }
          },
          statistics: {
            wordsSearched: 0,
            contributionsCount: 0,
            achievementPoints: 0
          },
          favorites: [],
          searchHistory: [],
          created: Timestamp.now(),
          lastActive: Timestamp.now()
        };

        await setDoc(doc(db, 'users', result.user.uid), user);
        return { success: true, user };
      } else {
        const user = await this.getUserData(result.user);
        if (!user) {
          return { success: false, error: 'Failed to get user data' };
        }
        return { success: true, user };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Google sign in failed'
      };
    }
  }

  static async signOut(): Promise<void> {
    await firebaseSignOut(auth);
  }

  static async getUserData(firebaseUser: FirebaseUser): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() } as User;
      }
      return null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  static async updateLastActive(userId: string): Promise<void> {
    try {
      await setDoc(doc(db, 'users', userId), { 
        lastActive: Timestamp.now() 
      }, { merge: true });
    } catch (error) {
      console.error('Error updating last active:', error);
    }
  }
}
