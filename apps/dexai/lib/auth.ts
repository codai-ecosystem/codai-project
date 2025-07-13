import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  updateProfile,
  User as FirebaseUser,
  UserCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import type { User, UserPreferences } from './types';

export class AuthService {
  private static googleProvider = new GoogleAuthProvider();

  static async signInWithEmail(email: string, password: string): Promise<UserCredential> {
    return await signInWithEmailAndPassword(auth, email, password);
  }

  static async signUpWithEmail(
    email: string, 
    password: string, 
    displayName: string
  ): Promise<UserCredential> {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update the profile
    await updateProfile(credential.user, { displayName });
    
    // Create user document in Firestore
    await this.createUserDocument(credential.user, displayName);
    
    return credential;
  }

  static async signInWithGoogle(): Promise<UserCredential> {
    const credential = await signInWithPopup(auth, this.googleProvider);
    
    // Check if user document exists, create if not
    const userDoc = await getDoc(doc(db, 'users', credential.user.uid));
    if (!userDoc.exists()) {
      await this.createUserDocument(
        credential.user, 
        credential.user.displayName || credential.user.email?.split('@')[0] || 'User'
      );
    }
    
    return credential;
  }

  static async signOut(): Promise<void> {
    return await firebaseSignOut(auth);
  }

  static async createUserDocument(
    firebaseUser: FirebaseUser, 
    displayName: string
  ): Promise<User> {
    const defaultPreferences: UserPreferences = {
      language: 'ro',
      theme: 'system',
      fontSize: 'medium',
      notifications: true,
      autoPlayAudio: true
    };

    const userData: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName,
      role: 'user',
      profile: {
        avatar: firebaseUser.photoURL || undefined,
        bio: '',
        preferences: defaultPreferences
      },
      statistics: {
        wordsSearched: 0,
        contributionsCount: 0,
        achievementPoints: 0,
        streakDays: 0,
        lastActiveDate: Timestamp.now()
      },
      favorites: [],
      searchHistory: [],
      achievements: [],
      created: Timestamp.now(),
      lastActive: Timestamp.now()
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), userData);
    return userData;
  }

  static async getUserData(uid: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() } as User;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }

  static async updateUserProfile(uid: string, updates: Partial<User>): Promise<void> {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      ...updates,
      lastActive: Timestamp.now()
    }, { merge: true });
  }

  static async updateLastActive(uid: string): Promise<void> {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      lastActive: Timestamp.now()
    }, { merge: true });
  }
}
