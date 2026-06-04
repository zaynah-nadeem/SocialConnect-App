import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  getFirebaseDb,
  isFirebaseConfigured,
  firestoreCollections,
} from '../config/firebase';
import type { Comment, Post } from '../types';
import { loadPosts, savePosts } from './mockStorage';

type PostsListener = (posts: Post[]) => void;

const mockListeners = new Set<PostsListener>();

function notifyMockListeners(posts: Post[]): void {
  mockListeners.forEach(cb => cb([...posts].sort(sortByDate)));
}

function sortByDate(a: Post, b: Post): number {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

function generatePostId(): string {
  return `post_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function generateCommentId(): string {
  return `comment_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export async function fetchPosts(): Promise<Post[]> {
  if (isFirebaseConfigured()) {
    const db = getFirebaseDb()!;
    const q = query(
      collection(db, firestoreCollections.posts),
      orderBy('createdAt', 'desc'),
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as Post);
  }

  const posts = await loadPosts();
  return posts.sort(sortByDate);
}

export async function createPost(
  userId: string,
  userName: string,
  userAvatarUri: string | undefined,
  text: string,
  imageUri?: string,
): Promise<Post> {
  const post: Post = {
    id: generatePostId(),
    userId,
    userName,
    userAvatarUri,
    text: text.trim(),
    imageUri,
    likeIds: [],
    comments: [],
    createdAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured()) {
    const db = getFirebaseDb()!;
    await setDoc(doc(db, firestoreCollections.posts, post.id), post);
    return post;
  }

  const posts = await loadPosts();
  posts.unshift(post);
  await savePosts(posts);
  notifyMockListeners(posts);
  return post;
}

export async function toggleLike(
  postId: string,
  userId: string,
): Promise<Post> {
  if (isFirebaseConfigured()) {
    const db = getFirebaseDb()!;
    const ref = doc(db, firestoreCollections.posts, postId);
    const posts = await fetchPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) {
      throw new Error('Post not found');
    }
    const likeIds = post.likeIds.includes(userId)
      ? post.likeIds.filter(id => id !== userId)
      : [...post.likeIds, userId];
    await updateDoc(ref, { likeIds });
    return { ...post, likeIds };
  }

  const posts = await loadPosts();
  const index = posts.findIndex(p => p.id === postId);
  if (index === -1) {
    throw new Error('Post not found');
  }
  const post = posts[index];
  const liked = post.likeIds.includes(userId);
  post.likeIds = liked
    ? post.likeIds.filter(id => id !== userId)
    : [...post.likeIds, userId];
  posts[index] = post;
  await savePosts(posts);
  notifyMockListeners(posts);
  return post;
}

export async function addComment(
  postId: string,
  userId: string,
  userName: string,
  text: string,
): Promise<Post> {
  const comment: Comment = {
    id: generateCommentId(),
    postId,
    userId,
    userName,
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured()) {
    const db = getFirebaseDb()!;
    const posts = await fetchPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) {
      throw new Error('Post not found');
    }
    const comments = [...post.comments, comment];
    await updateDoc(doc(db, firestoreCollections.posts, postId), { comments });
    return { ...post, comments };
  }

  const posts = await loadPosts();
  const index = posts.findIndex(p => p.id === postId);
  if (index === -1) {
    throw new Error('Post not found');
  }
  posts[index].comments = [...posts[index].comments, comment];
  await savePosts(posts);
  notifyMockListeners(posts);
  return posts[index];
}

export function subscribeToPosts(listener: PostsListener): () => void {
  if (isFirebaseConfigured()) {
    const db = getFirebaseDb()!;
    const q = query(
      collection(db, firestoreCollections.posts),
      orderBy('createdAt', 'desc'),
    );
    return onSnapshot(q, snap => {
      const posts = snap.docs.map(d => d.data() as Post);
      listener(posts);
    });
  }

  mockListeners.add(listener);
  fetchPosts().then(listener);

  const interval = setInterval(() => {
    fetchPosts().then(listener);
  }, 3000);

  return () => {
    mockListeners.delete(listener);
    clearInterval(interval);
  };
}
