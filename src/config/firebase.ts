import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import {
  Firestore,
  getFirestore,
  collection,
  doc,
} from 'firebase/firestore';
import { Database, getDatabase, ref } from 'firebase/database';
import {
  FirebaseStorage,
  getStorage,
} from 'firebase/storage';

/**
 * Set to true after replacing firebaseConfig with your project values.
 * The app runs in mock (AsyncStorage) mode when false or placeholders remain.
 */
export const USE_FIREBASE = true;

const firebaseConfig = {
  apiKey: "AIzaSyDtY8feKUNVwBS1vFEM11WBTRQcmotvYsI",
  authDomain: "socialconnect-b8c84.firebaseapp.com",
  projectId: "socialconnect-b8c84",
  storageBucket: "socialconnect-b8c84.firebasestorage.app",
  messagingSenderId: "481498971346",
  appId: "1:481498971346:web:183c1a3609c7dfe9cfc10b"
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

export function isFirebaseConfigured(): boolean {
  return (
    USE_FIREBASE &&
    firebaseConfig.apiKey !== 'YOUR_API_KEY' &&
    firebaseConfig.projectId !== 'YOUR_PROJECT_ID'
  );
}

export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) {
    return null;
  }
  if (!app) {
    app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);
  }
  return app;
}

export function getFirebaseAuth(): Auth | null {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) {
    return null;
  }
  if (!auth) {
    auth = getAuth(firebaseApp);
  }
  return auth;
}

export function getFirebaseDb(): Firestore | null {
  const firebaseApp = getFirebaseApp();
  return firebaseApp ? getFirestore(firebaseApp) : null;
}

export function getFirebaseRtdb(): Database | null {
  const firebaseApp = getFirebaseApp();
  return firebaseApp ? getDatabase(firebaseApp) : null;
}

export function getFirebaseStorage(): FirebaseStorage | null {
  const firebaseApp = getFirebaseApp();
  return firebaseApp ? getStorage(firebaseApp) : null;
}

export const firestoreCollections = {
  users: 'users',
  posts: 'posts',
  follows: 'follows',
  conversations: 'conversations',
  messages: 'messages',
};

export { collection, doc, ref };
