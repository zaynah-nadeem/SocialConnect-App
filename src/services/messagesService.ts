import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  addDoc,
  where, // ✅ FIXED (was missing)
} from 'firebase/firestore';

import {
  firestoreCollections,
  getFirebaseDb,
  isFirebaseConfigured,
} from '../config/firebase';

import type { Conversation, Message } from '../types';

import {
  loadConversations,
  loadMessages,
  saveConversations,
  saveMessages,
} from './mockStorage';

function conversationIdFor(a: string, b: string) {
  return [a, b].sort().join('_');
}

function generateMessageId() {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  senderName: string,
  text: string,
  receiverId?: string,
): Promise<Message> {
  const message: Message = {
    id: generateMessageId(),
    conversationId,
    senderId,
    senderName,
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured()) {
    const db = getFirebaseDb()!;

    const messagesRef = collection(
      db,
      firestoreCollections.conversations,
      conversationId,
      firestoreCollections.messages,
    );

    await addDoc(messagesRef, message);

    await updateDoc(
      doc(db, firestoreCollections.conversations, conversationId),
      {
        lastMessage: message.text,
        lastMessageAt: message.createdAt,
      },
    );

    return message;
  }

  const messages = await loadMessages();
  messages.push(message);
  await saveMessages(messages);

  return message;
}

export async function fetchMessages(conversationId: string): Promise<Message[]> {
  if (isFirebaseConfigured()) {
    const db = getFirebaseDb()!;

    const q = query(
      collection(
        db,
        firestoreCollections.conversations,
        conversationId,
        firestoreCollections.messages,
      ),
      orderBy('createdAt', 'asc'),
    );

    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as Message);
  }

  const messages = await loadMessages();

  return messages
    .filter(m => m.conversationId === conversationId)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime(),
    );
}

export function subscribeToMessages(
  conversationId: string,
  listener: (messages: Message[]) => void,
) {
  if (isFirebaseConfigured()) {
    const db = getFirebaseDb()!;

    const q = query(
      collection(
        db,
        firestoreCollections.conversations,
        conversationId,
        firestoreCollections.messages,
      ),
      orderBy('createdAt', 'asc'),
    );

    return onSnapshot(q, snap => {
      const messages = snap.docs.map(d => d.data() as Message);

      console.log('📩 messages loaded:', messages.length);

      listener(messages);
    });
  }

  // fallback mode
  fetchMessages(conversationId).then(listener);

  const interval = setInterval(() => {
    fetchMessages(conversationId).then(listener);
  }, 2000);

  return () => clearInterval(interval);
}

export async function fetchConversations(userId: string): Promise<Conversation[]> {
  if (isFirebaseConfigured()) {
    const db = getFirebaseDb()!;

    const q = query(
      collection(db, firestoreCollections.conversations),
      where('participantIds', 'array-contains', userId),
      orderBy('lastMessageAt', 'desc'),
    );

    const snap = await getDocs(q);

    return snap.docs.map(d => d.data() as Conversation);
  }

  const conversations = await loadConversations();

  return conversations
    .filter(c => c.participantIds.includes(userId))
    .sort(
      (a, b) =>
        new Date(b.lastMessageAt).getTime() -
        new Date(a.lastMessageAt).getTime(),
    );
}

export async function getOrCreateConversation(
  currentUserId: string,
  currentUserName: string,
  otherUserId: string,
  otherUserName: string,
): Promise<Conversation> {
  const id = [currentUserId, otherUserId].sort().join('_');

  const conversation: Conversation = {
    id,
    participantIds: [currentUserId, otherUserId],
    participantNames: {
      [currentUserId]: currentUserName,
      [otherUserId]: otherUserName,
    },
    lastMessage: '',
    lastMessageAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured()) {
    const db = getFirebaseDb()!;

    const ref = doc(db, firestoreCollections.conversations, id);

    const snap = await getDocs(
      query(
        collection(db, firestoreCollections.conversations),
        where('id', '==', id),
      ),
    );

    if (snap.empty) {
      await setDoc(ref, conversation);
    }

    return conversation;
  }

  const conversations = await loadConversations();
  const existing = conversations.find(c => c.id === id);

  if (existing) return existing;

  conversations.unshift(conversation);
  await saveConversations(conversations);

  return conversation;
}