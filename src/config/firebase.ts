import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import {
  Firestore,
  getFirestore,
  collection,
  doc,
} from 'firebase/firestore';
import { Database, getDatabase, ref } from 'firebase/database';

/** Set to true and fill firebaseConfig after creating a Firebase project. */
export const USE_FIREBASE = false;

export const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
  databaseURL: 'https://YOUR_PROJECT-default-rtdb.firebaseio.com',
};

let app: FirebaseApp | null = null;

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
  return firebaseApp ? getAuth(firebaseApp) : null;
}

export function getFirebaseDb(): Firestore | null {
  const firebaseApp = getFirebaseApp();
  return firebaseApp ? getFirestore(firebaseApp) : null;
}

export function getFirebaseRtdb(): Database | null {
  const firebaseApp = getFirebaseApp();
  return firebaseApp ? getDatabase(firebaseApp) : null;
}

export const firestoreCollections = {
  users: 'users',
  posts: 'posts',
};

export { collection, doc, ref };
