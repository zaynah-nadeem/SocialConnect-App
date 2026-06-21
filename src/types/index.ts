export type User = {
  id: string;
  name: string;
  email: string;
  avatarUri: string;
  bio: string;
  createdAt: string;
};

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatarUri?: string;
  text: string;
  imageUri?: string | null;
  likeIds: string[];
  comments: Comment[];
  createdAt: string;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  receiverId?: string; 
  text: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participantNames: Record<string, string>;
  lastMessage?: string;
  lastMessageAt: string;
}

export interface AppNotification {
  id: string;
  type: 'like' | 'comment';
  postId: string;
  fromUserId: string;
  toUserId: string;
  message: string;
  createdAt: number;
  read: boolean;
}

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  EditProfile: undefined;
  CreatePost: undefined;
  EditPost: { postId: string };
  Comments: { postId: string };
  UserProfile: { userId: string };
  Notifications: undefined;
  Search: undefined;
  Messages: undefined;
  Chat: {
    conversationId: string;
    otherUserId: string;
    otherUserName: string;
  };
};

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
};
