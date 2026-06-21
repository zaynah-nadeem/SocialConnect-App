import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile as firebaseUpdateProfile,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  firestoreCollections,
  getFirebaseAuth,
  getFirebaseDb,
  isFirebaseConfigured,
} from '../config/firebase';
import type { User } from '../types';
import {
  getSessionUserId,
  loadUsers,
  saveCredential,
  saveUsers,
  seedDemoData,
  setSessionUserId,
  verifyCredential,
} from './mockStorage';

function mapFirebaseError(error: unknown): Error {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = String((error as { code: string }).code);
    const messages: Record<string, string> = {
      'auth/email-already-in-use': 'An account with this email already exists',
      'auth/invalid-email': 'Invalid email address',
      'auth/weak-password': 'Password should be at least 6 characters',
      'auth/user-not-found': 'Invalid email or password',
      'auth/wrong-password': 'Invalid email or password',
      'auth/invalid-credential': 'Invalid email or password',
    };
    return new Error(messages[code] ?? 'Authentication failed');
  }
  return error instanceof Error ? error : new Error('Authentication failed');
}

async function fetchFirestoreUser(userId: string): Promise<User | null> {
  const db = getFirebaseDb();
  if (!db) {
    return null;
  }
  const snap = await getDoc(doc(db, firestoreCollections.users, userId));
  return snap.exists() ? (snap.data() as User) : null;
}

async function saveFirestoreUser(user: User): Promise<void> {
  const db = getFirebaseDb();
  if (!db) {
    return;
  }
  await setDoc(doc(db, firestoreCollections.users, user.id), user, {
    merge: true,
  });
}

export async function initializeAuth(): Promise<void> {
  if (isFirebaseConfigured()) {
    return;
  }
  await seedDemoData();
}

export async function getCurrentUser(): Promise<User | null> {
  if (isFirebaseConfigured()) {
    const auth = getFirebaseAuth();
    if (!auth?.currentUser) {
      return null;
    }
    return fetchFirestoreUser(auth.currentUser.uid);
  }

  const userId = await getSessionUserId();
  if (!userId) {
    return null;
  }
  const users = await loadUsers();
  return users.find(u => u.id === userId) ?? null;
}

export function subscribeToAuthChanges(
  callback: (user: User | null) => void,
): () => void {
  if (isFirebaseConfigured()) {
    const auth = getFirebaseAuth();
    if (!auth) {
      callback(null);
      return () => {};
    }
    return onAuthStateChanged(auth, async firebaseUser => {
      if (!firebaseUser) {
        callback(null);
        return;
      }
      const user = await fetchFirestoreUser(firebaseUser.uid);
      callback(user);
    });
  }

  getCurrentUser().then(callback);
  return () => {};
}

export async function signUp(
  email: string,
  password: string,
  name: string,
): Promise<User> {
  if (isFirebaseConfigured()) {
    try {
      const auth = getFirebaseAuth()!;
      const credential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );
      await firebaseUpdateProfile(credential.user, { displayName: name });

      const newUser: User = {
        id: credential.user.uid,
        name,
        email: email.trim().toLowerCase(),
        avatarUri: '',
        bio: '',
        createdAt: new Date().toISOString(),
      };
      await saveFirestoreUser(newUser);
      return newUser;
    } catch (error) {
      throw mapFirebaseError(error);
    }
  }

  const users = await loadUsers();
  const normalizedEmail = email.trim().toLowerCase();
  if (users.find(u => u.email.toLowerCase() === normalizedEmail)) {
    throw new Error('User already exists');
  }

  const newUser: User = {
    id: `user_${Date.now()}`,
    name,
    email: normalizedEmail,
    avatarUri: '',
    bio: '',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  await saveUsers(users);
  await saveCredential(normalizedEmail, password);
  await setSessionUserId(newUser.id);
  return newUser;
}

export async function signIn(
  email: string,
  password: string,
): Promise<User> {
  if (isFirebaseConfigured()) {
    try {
      const auth = getFirebaseAuth()!;
      const credential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );
      const user = await fetchFirestoreUser(credential.user.uid);
      if (!user) {
        throw new Error('User profile not found');
      }
      return user;
    } catch (error) {
      throw mapFirebaseError(error);
    }
  }

  const normalizedEmail = email.trim().toLowerCase();
  const valid = await verifyCredential(normalizedEmail, password);
  if (!valid) {
    throw new Error('Invalid email or password');
  }

  const users = await loadUsers();
  const user = users.find(u => u.email.toLowerCase() === normalizedEmail);
  if (!user) {
    throw new Error('Invalid email or password');
  }

  await setSessionUserId(user.id);
  return user;
}

export async function resetPassword(email: string): Promise<void> {
  if (isFirebaseConfigured()) {
    const auth = getFirebaseAuth()!;
    await sendPasswordResetEmail(auth, email.trim());
    return;
  }

  const users = await loadUsers();
  const exists = users.some(
    u => u.email.toLowerCase() === email.trim().toLowerCase(),
  );
  if (!exists) {
    throw new Error('No account found with this email');
  }
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<Pick<User, 'name' | 'bio' | 'avatarUri'>>,
): Promise<User> {
  if (isFirebaseConfigured()) {
    const db = getFirebaseDb()!;
    const ref = doc(db, firestoreCollections.users, userId);
    await updateDoc(ref, updates);

    if (updates.name) {
      const auth = getFirebaseAuth();
      if (auth?.currentUser) {
        await firebaseUpdateProfile(auth.currentUser, {
          displayName: updates.name,
        });
      }
    }

    const updated = await fetchFirestoreUser(userId);
    if (!updated) {
      throw new Error('User not found');
    }
    return updated;
  }

  const users = await loadUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index === -1) {
    throw new Error('User not found');
  }

  users[index] = { ...users[index], ...updates };
  await saveUsers(users);
  return users[index];
}

export async function signOut(): Promise<void> {
  if (isFirebaseConfigured()) {
    const auth = getFirebaseAuth();
    if (auth) {
      await firebaseSignOut(auth);
    }
    return;
  }
  await setSessionUserId(null);
}

export async function getUserById(userId: string): Promise<User | null> {
  if (isFirebaseConfigured()) {
    return fetchFirestoreUser(userId);
  }
  const users = await loadUsers();
  return users.find(u => u.id === userId) ?? null;
}

export async function searchUsersByName(searchTerm: string): Promise<User[]> {
  const term = searchTerm.trim().toLowerCase();
  if (!term) {
    return [];
  }

  if (isFirebaseConfigured()) {
    const db = getFirebaseDb()!;
    const snap = await getDocs(collection(db, firestoreCollections.users));
    return snap.docs
      .map(d => d.data() as User)
      .filter(
        u =>
          u.name.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term),
      );
  }

  const users = await loadUsers();
  return users.filter(
    u =>
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term),
  );
}

export async function getAllUsers(): Promise<User[]> {
  if (isFirebaseConfigured()) {
    const db = getFirebaseDb()!;
    const snap = await getDocs(collection(db, firestoreCollections.users));
    return snap.docs.map(d => d.data() as User);
  }
  return loadUsers();
}
