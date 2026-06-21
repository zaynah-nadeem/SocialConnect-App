import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import {
  firestoreCollections,
  getFirebaseDb,
  isFirebaseConfigured,
} from '../config/firebase';
import type { Follow } from '../types';
import {
  loadFollows,
  saveFollows,
} from './mockStorage';

function followId(followerId: string, followingId: string): string {
  return `${followerId}_${followingId}`;
}

export async function followUser(
  followerId: string,
  followingId: string,
): Promise<Follow> {
  if (followerId === followingId) {
    throw new Error('You cannot follow yourself');
  }

  const follow: Follow = {
    id: followId(followerId, followingId),
    followerId,
    followingId,
    createdAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured()) {
    const db = getFirebaseDb()!;
    await setDoc(doc(db, firestoreCollections.follows, follow.id), follow);
    return follow;
  }

  const follows = await loadFollows();
  if (!follows.find(f => f.id === follow.id)) {
    follows.push(follow);
    await saveFollows(follows);
  }
  return follow;
}

export async function unfollowUser(
  followerId: string,
  followingId: string,
): Promise<void> {
  const id = followId(followerId, followingId);

  if (isFirebaseConfigured()) {
    const db = getFirebaseDb()!;
    await deleteDoc(doc(db, firestoreCollections.follows, id));
    return;
  }

  const follows = await loadFollows();
  await saveFollows(follows.filter(f => f.id !== id));
}

export async function isFollowing(
  followerId: string,
  followingId: string,
): Promise<boolean> {
  const id = followId(followerId, followingId);

  if (isFirebaseConfigured()) {
    const db = getFirebaseDb()!;
    const snap = await getDoc(doc(db, firestoreCollections.follows, id));
    return snap.exists();
  }

  const follows = await loadFollows();
  return follows.some(f => f.id === id);
}

export async function getFollowingIds(userId: string): Promise<string[]> {
  if (isFirebaseConfigured()) {
    const db = getFirebaseDb()!;
    const q = query(
      collection(db, firestoreCollections.follows),
      where('followerId', '==', userId),
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => (d.data() as Follow).followingId);
  }

  const follows = await loadFollows();
  return follows.filter(f => f.followerId === userId).map(f => f.followingId);
}

export function subscribeToFollowingIds(
  userId: string,
  listener: (ids: string[]) => void,
): () => void {
  if (isFirebaseConfigured()) {
    const db = getFirebaseDb()!;
    const q = query(
      collection(db, firestoreCollections.follows),
      where('followerId', '==', userId),
    );
    return onSnapshot(q, snap => {
      listener(snap.docs.map(d => (d.data() as Follow).followingId));
    });
  }

  getFollowingIds(userId).then(listener);
  return () => {};
}

export async function getFollowerCount(userId: string): Promise<number> {
  if (isFirebaseConfigured()) {
    const db = getFirebaseDb()!;
    const q = query(
      collection(db, firestoreCollections.follows),
      where('followingId', '==', userId),
    );
    const snap = await getDocs(q);
    return snap.size;
  }

  const follows = await loadFollows();
  return follows.filter(f => f.followingId === userId).length;
}

export async function getFollowingCount(userId: string): Promise<number> {
  return (await getFollowingIds(userId)).length;
}
