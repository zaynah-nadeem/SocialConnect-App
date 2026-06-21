import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  getFirebaseDb,
  isFirebaseConfigured,
  firestoreCollections,
} from '../config/firebase';
import type { Comment, Post } from '../types';
import { loadPosts, savePosts } from './mockStorage';
import { uploadImage } from './storageService';

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
  imageUri?: string | null,
): Promise<Post> {
  let uploadedImageUri = imageUri;
  console.log('Firebase configured:', isFirebaseConfigured());
  if (imageUri) {
    uploadedImageUri = await uploadImage(
      imageUri,
      `posts/${userId}/${Date.now()}.jpg`,
    );
  }

  const post: Post = {
    id: generatePostId(),
    userId,
    userName,
    userAvatarUri,
    text: text.trim(),
    imageUri: uploadedImageUri || null,
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

export async function updatePost(
  postId: string,
  userId: string,
  updates: { text?: string; imageUri?: string },
): Promise<Post> {
  const posts = await fetchPosts();
  const post = posts.find(p => p.id === postId);
  if (!post) {
    throw new Error('Post not found');
  }
  if (post.userId !== userId) {
    throw new Error('You can only edit your own posts');
  }

  let imageUri = updates.imageUri ?? post.imageUri;
  if (updates.imageUri && !updates.imageUri.startsWith('http')) {
    imageUri = await uploadImage(
      updates.imageUri,
      `posts/${userId}/${Date.now()}.jpg`,
    );
  }

  const updated: Post = {
    ...post,
    text: updates.text !== undefined ? updates.text.trim() : post.text,
    imageUri,
  };

  if (isFirebaseConfigured()) {
    const db = getFirebaseDb()!;
    await updateDoc(doc(db, firestoreCollections.posts, postId), {
      text: updated.text,
      imageUri: updated.imageUri ?? null,
    });
    return updated;
  }

  const allPosts = await loadPosts();
  const index = allPosts.findIndex(p => p.id === postId);
  allPosts[index] = updated;
  await savePosts(allPosts);
  notifyMockListeners(allPosts);
  return updated;
}

export async function deletePost(
  postId: string,
  userId: string,
): Promise<void> {
  const posts = await fetchPosts();
  const post = posts.find(p => p.id === postId);
  if (!post) {
    throw new Error('Post not found');
  }
  if (post.userId !== userId) {
    throw new Error('You can only delete your own posts');
  }

  if (isFirebaseConfigured()) {
    const db = getFirebaseDb()!;
    await deleteDoc(doc(db, firestoreCollections.posts, postId));
    return;
  }

  const allPosts = await loadPosts();
  await savePosts(allPosts.filter(p => p.id !== postId));
  notifyMockListeners(await loadPosts());
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

export async function searchPosts(searchTerm: string): Promise<Post[]> {
  const term = searchTerm.trim().toLowerCase();
  if (!term) {
    return [];
  }
  const posts = await fetchPosts();
  return posts.filter(
    p =>
      p.text.toLowerCase().includes(term) ||
      p.userName.toLowerCase().includes(term),
  );
}

export function subscribeToPosts(listener: PostsListener): () => void {
  if (isFirebaseConfigured()) {
    const db = getFirebaseDb()!;
    const q = query(
      collection(db, firestoreCollections.posts),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, snap => {
      const postsMap = new Map<string, Post>();

      snap.docs.forEach(d => {
        const post = d.data() as Post;
        postsMap.set(post.id, post);
      });

      const posts = Array.from(postsMap.values());

      listener(posts);
    });
  }

  // fallback mock mode
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
