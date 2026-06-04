import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { navigateRoot } from '../navigation/rootNavigation';
import ProfileAvatar from '../components/ProfileAvatar';
import PostCard from '../components/PostCard';
import * as authService from '../services/authService';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
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

  const userPosts = allPosts.filter(p => p.userId === userId);

  useEffect(() => {
    authService.getUserById(userId).then(u => {
      setProfile(u);
      setLoading(false);
    });
  }, [userId]);

  if (loading) {
    return (
      <ActivityIndicator style={styles.loader} color={colors.primary} />
    );
  }

  if (!profile) {
    return (
      <View style={styles.center}>
        <Text>User not found</Text>
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
        <Text style={styles.stats}>{userPosts.length} posts</Text>
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
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No posts from this user yet.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loader: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
  stats: {
    fontSize: fontSize.sm,
    color: colors.primary,
    marginTop: spacing.sm,
    fontWeight: '600',
  },
  empty: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
});
