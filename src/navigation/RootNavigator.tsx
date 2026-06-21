import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { initializeAuth, setUser } from '../store/slices/authSlice';
import { clearPosts } from '../store/slices/postsSlice';
import {
  clearFollows,
  loadFollowing,
  setFollowingIds,
} from '../store/slices/followsSlice';
import { clearMessages } from '../store/slices/messagesSlice';
import { clearNotifications } from '../store/slices/notificationsSlice';
import { subscribeToAuthChanges } from '../services/authService';
import { subscribeToFollowingIds } from '../services/followService';

import type { RootStackParamList } from '../types';
import { colors } from '../theme/colors';

import AuthStack from './AuthStack';
import MainTabs from './MainTabs';

import EditProfileScreen from '../screens/EditProfileScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import EditPostScreen from '../screens/EditPostScreen';
import CommentsScreen from '../screens/CommentsScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SearchScreen from '../screens/SearchScreen';
import MessagesScreen from '../screens/MessagesScreen';
import ChatScreen from '../screens/ChatScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const dispatch = useAppDispatch();
  const { user, initialized } = useAppSelector(s => s.auth);

  const isLoggedIn = !!user?.id;
  const showBootOverlay = !initialized && !user;

  useEffect(() => {
    dispatch(initializeAuth());
    const unsub = subscribeToAuthChanges(authUser => {
      dispatch(setUser(authUser));
    });
    return unsub;
  }, [dispatch]);

  useEffect(() => {
    if (!user?.id) {
      dispatch(clearPosts());
      dispatch(clearFollows());
      dispatch(clearMessages());
      dispatch(clearNotifications());
      return;
    }

    dispatch(loadFollowing(user.id));
    const unsub = subscribeToFollowingIds(user.id, ids => {
      dispatch(setFollowingIds(ids));
    });
    return unsub;
  }, [dispatch, user?.id]);

  return (
    <View style={styles.root}>
      <Stack.Navigator
        key={isLoggedIn ? 'main' : 'guest'}
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            color: colors.text,
            fontWeight: '700',
          },
          headerShadowVisible: false,
        }}
      >
        {isLoggedIn ? (
          <>
            <Stack.Screen
              name="Main"
              component={MainTabs}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{ title: 'Edit Profile' }}
            />

            <Stack.Screen
              name="CreatePost"
              component={CreatePostScreen}
              options={{ title: 'New Post' }}
            />

            <Stack.Screen
              name="EditPost"
              component={EditPostScreen}
              options={{ title: 'Edit Post' }}
            />

            <Stack.Screen
              name="Comments"
              component={CommentsScreen}
              options={{ title: 'Comments' }}
            />

            <Stack.Screen
              name="UserProfile"
              component={UserProfileScreen}
              options={{ title: 'Profile' }}
            />

            <Stack.Screen
              name="Notifications"
              component={NotificationsScreen}
              options={{ title: 'Notifications' }}
            />

            <Stack.Screen
              name="Search"
              component={SearchScreen}
              options={{ title: 'Search' }}
            />

            <Stack.Screen
              name="Messages"
              component={MessagesScreen}
              options={{ title: 'Messages' }}
            />

<Stack.Screen
  name="Chat"
  component={ChatScreen}
  options={({ route }) => ({
    title: route.params?.otherUserName ?? 'Chat',
  })}
/>
          </>
        ) : (
          <Stack.Screen
            name="Auth"
            component={AuthStack}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>

      {showBootOverlay ? (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
