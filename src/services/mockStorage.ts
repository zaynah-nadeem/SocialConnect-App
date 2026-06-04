import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Post, User } from '../types';

const KEYS = {
  users: '@socialconnect_users',
  posts: '@socialconnect_posts',
  session: '@socialconnect_session',
  credentials: '@socialconnect_credentials',
};

type CredentialsMap = Record<string, string>;

export async function loadCredentials(): Promise<CredentialsMap> {
  const raw = await AsyncStorage.getItem(KEYS.credentials);
  return raw ? JSON.parse(raw) : {};
}

export async function saveCredential(email: string, password: string): Promise<void> {
  const creds = await loadCredentials();
  creds[email.toLowerCase()] = password;
  await AsyncStorage.setItem(KEYS.credentials, JSON.stringify(creds));
}

export async function verifyCredential(email: string, password: string): Promise<boolean> {
  const creds = await loadCredentials();
  return creds[email.toLowerCase()] === password;
}

export async function loadUsers(): Promise<User[]> {
  const raw = await AsyncStorage.getItem(KEYS.users);
  return raw ? JSON.parse(raw) : [];
}

export async function saveUsers(users: User[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.users, JSON.stringify(users));
}

export async function loadPosts(): Promise<Post[]> {
  const raw = await AsyncStorage.getItem(KEYS.posts);
  return raw ? JSON.parse(raw) : [];
}

export async function savePosts(posts: Post[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.posts, JSON.stringify(posts));
}

export async function getSessionUserId(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.session);
}

export async function setSessionUserId(userId: string | null): Promise<void> {
  if (userId) {
    await AsyncStorage.setItem(KEYS.session, userId);
  } else {
    await AsyncStorage.removeItem(KEYS.session);
  }
}

export async function seedDemoData(): Promise<void> {
  const users = await loadUsers();
  if (users.length > 0) {
    return;
  }

  const demoUsers: User[] = [
    {
      id: 'user_demo_1',
      email: 'demo@socialconnect.app',
      name: 'Alex Rivera',
      bio: 'Building SocialConnect 🚀',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'user_demo_2',
      email: 'jordan@socialconnect.app',
      name: 'Jordan Lee',
      bio: 'Photography & travel',
      createdAt: new Date().toISOString(),
    },
  ];

  const demoPosts: Post[] = [
    {
      id: 'post_demo_1',
      userId: 'user_demo_2',
      userName: 'Jordan Lee',
      text: 'Welcome to SocialConnect! Share your first post.',
      likeIds: [],
      comments: [],
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ];

  await saveUsers(demoUsers);
  await savePosts(demoPosts);
  await saveCredential('demo@socialconnect.app', 'demo123');
}
