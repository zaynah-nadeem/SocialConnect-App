import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { navigateRoot } from '../navigation/rootNavigation';
import ProfileAvatar from '../components/ProfileAvatar';
import PostCard from '../components/PostCard';
import FollowButton from '../components/FollowButton';
import PrimaryButton from '../components/PrimaryButton';
import * as authService from '../services/authService';
import * as followService from '../services/followService';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { startConversation } from '../store/slices/messagesSlice';
import { toggleLike } from '../store/slices/postsSlice';
import type { Post, RootStackParamList, User } from '../types';
import { colors } from '../theme/colors';
import { fontSize, spacing, wp } from '../utils/responsive';

type Props = NativeStackScreenProps<RootStackParamList, 'UserProfile'>;

export default function UserProfileScreen({ route, navigation }: Props) {
  const { userId } = route.params;
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(s => s.auth.user);
  const allPosts = useAppSelector(s => s.posts.items);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [messaging, setMessaging] = useState(false);

  const userPosts = allPosts.filter(p => p.userId === userId);
  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    setLoading(true);
    authService.getUserById(userId).then(async u => {
      setProfile(u);
      if (u) {
        const [followers, following] = await Promise.all([
          followService.getFollowerCount(u.id),
          followService.getFollowingCount(u.id),
        ]);
        setFollowerCount(followers);
        setFollowingCount(following);
      }
      setLoading(false);
    });
  }, [userId]);

  const handleMessage = async () => {
    if (!profile || !currentUser) {
      return;
    }
    setMessaging(true);
    try {
      const conversation = await dispatch(
        startConversation({
          otherUserId: profile.id,
          otherUserName: profile.name,
        }),
      ).unwrap();
      navigateRoot(navigation, 'Chat', {
        conversationId: conversation.id,
        otherUserId: profile.id,
        otherUserName: profile.name,
      });
    } finally {
      setMessaging(false);
    }
  };

  if (loading) {
    return (
      <ActivityIndicator style={styles.loader} color={colors.primary} />
    );
  }

  if (!profile) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>User not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ProfileAvatar
          uri={profile.avatarUri}
          name={profile.name}
          size={wp(22)}
        />
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.bio}>{profile.bio || 'No bio'}</Text>

        <View style={styles.statsRow}>
          <Text style={styles.stats}>{userPosts.length} posts</Text>
          <Text style={styles.stats}>{followerCount} followers</Text>
          <Text style={styles.stats}>{followingCount} following</Text>
        </View>

        {!isOwnProfile ? (
          <View style={styles.actions}>
            <FollowButton targetUserId={profile.id} />
            <PrimaryButton
              title={messaging ? 'Opening...' : 'Message'}
              onPress={handleMessage}
              variant="outline"
            />
          </View>
        ) : null}
      </View>

      <FlatList
        data={userPosts}
        keyExtractor={(item: Post) => item.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            currentUserId={currentUser?.id ?? ''}
            onLike={() => dispatch(toggleLike(item.id))}
            onComment={() =>
              navigateRoot(navigation, 'Comments', { postId: item.id })
            }
            onAuthorPress={() => {}}
            onEdit={
              isOwnProfile
                ? () =>
                    navigateRoot(navigation, 'EditPost', { postId: item.id })
                : undefined
            }
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No posts from this user yet.</Text>
        }
        contentContainerStyle={styles.list}
        removeClippedSubviews
        maxToRenderPerBatch={6}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loader: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFound: { color: colors.textSecondary },
  header: {
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  name: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.sm,
  },
  bio: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  stats: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  actions: {
    width: '100%',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  empty: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
  list: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
});
