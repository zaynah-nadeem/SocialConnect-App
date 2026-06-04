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
  imageUri?: string;
  likeIds: string[];
  comments: Comment[];
  createdAt: string;
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
  Comments: { postId: string };
  UserProfile: { userId: string };
  Notifications: undefined;
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
