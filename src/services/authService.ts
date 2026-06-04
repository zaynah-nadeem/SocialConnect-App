import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '../types';

const USERS_KEY = 'SOCIALCONNECT_USERS';
const CURRENT_USER_KEY = 'SOCIALCONNECT_CURRENT_USER';


export async function initializeAuth(): Promise<void> {
  return;
}


export async function getCurrentUser(): Promise<User | null> {
  const data = await AsyncStorage.getItem(CURRENT_USER_KEY);
  return data ? JSON.parse(data) : null;
}


async function getUsers(): Promise<User[]> {
  const data = await AsyncStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
}

async function saveUsers(users: User[]) {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
}


export async function signUp(
  email: string,
  password: string,
  name: string,
): Promise<User> {
  const users = await getUsers();

  const exists = users.find(u => u.email === email);
  if (exists) {
    throw new Error('User already exists');
  }

  const newUser: User = {
    id: Date.now().toString(),
    name,
    email,
    avatarUri: '',
    bio: '',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);

  await saveUsers(users);
  await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));

  return newUser;
}


export async function signIn(
  email: string,
  password: string,
): Promise<User> {
  const users = await getUsers();

  const user = users.find(u => u.email === email);

  if (!user) {
    throw new Error('Invalid email or user not found');
  }

  await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

  return user;
}


export async function updateUserProfile(
  userId: string,
  updates: Partial<Pick<User, 'name' | 'bio' | 'avatarUri'>>,
): Promise<User> {
  const users = await getUsers();

  const index = users.findIndex(u => u.id === userId);

  if (index === -1) throw new Error('User not found');

  users[index] = {
    ...users[index],
    ...updates,
  };

  await saveUsers(users);
  await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(users[index]));

  return users[index];
}


export async function signOut(): Promise<void> {
  await AsyncStorage.removeItem(CURRENT_USER_KEY);
}


export async function getUserById(userId: string): Promise<User | null> {
  const users = await getUsers();
  return users.find(u => u.id === userId) || null;
}