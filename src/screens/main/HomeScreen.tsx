import React, { useCallback, useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';

import { navigateRoot } from '../../navigation/rootNavigation';
import PostCard from '../../components/PostCard';
import NotificationBanner from '../../components/NotificationBanner';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  deletePost,
  fetchPosts,
  setPosts,
  toggleLike,
} from '../../store/slices/postsSlice';
import { subscribeToPosts } from '../../services/postsService';

import type { MainTabParamList, Post } from '../../types';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

type Props = BottomTabScreenProps<MainTabParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector(s => s.posts);
  const user = useAppSelector(s => s.auth.user);
  const followingIds = useAppSelector(s => s.follows.followingIds);

  useEffect(() => {
    dispatch(fetchPosts());

    const unsub = subscribeToPosts(posts => {
      dispatch(setPosts(posts));
    });

    return unsub;
  }, [dispatch, user?.id]);

  const feedPosts = useMemo(() => {
    if (!user) {
      return items;
    }
    const visibleIds = new Set([user.id, ...followingIds]);
    const filtered = items.filter(p => visibleIds.has(p.userId));
    return filtered.length > 0 ? filtered : items;
  }, [items, user, followingIds]);

  const handleDelete = useCallback(
    (postId: string) => {
      Alert.alert('Delete post', 'Are you sure you want to delete this post?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => dispatch(deletePost(postId)),
        },
      ]);
    },
    [dispatch],
  );

  const renderItem = useCallback(
    ({ item }: { item: Post }) => (
      <PostCard
        post={item}
        currentUserId={user?.id ?? ''}
        onLike={() => dispatch(toggleLike(item.id))}
        onComment={() =>
          navigateRoot(navigation, 'Comments', { postId: item.id })
        }
        onAuthorPress={() =>
          navigateRoot(navigation, 'UserProfile', { userId: item.userId })
        }
        onEdit={() =>
          navigateRoot(navigation, 'EditPost', { postId: item.id })
        }
        onDelete={() => handleDelete(item.id)}
      />
    ),
    [dispatch, navigation, user?.id, handleDelete],
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>SocialConnect</Text>

        <View style={styles.headerActions}>
          <Pressable
            onPress={() => navigateRoot(navigation, 'Search')}
            style={styles.iconBtn}
          >
            <Icon name="search-outline" size={22} color="#fff" />
          </Pressable>

          <Pressable
            onPress={() => navigateRoot(navigation, 'Notifications')}
            style={styles.iconBtn}
          >
            <Icon name="notifications-outline" size={24} color="#fff" />
          </Pressable>
        </View>
      </View>

      <View style={styles.bannerWrap}>
        <NotificationBanner
          onPress={() => navigateRoot(navigation, 'Notifications')}
        />
      </View>

      {loading && feedPosts.length === 0 ? (
        <ActivityIndicator style={styles.loader} color="#6C63FF" />
      ) : (
        <FlatList
          data={feedPosts}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          removeClippedSubviews
          maxToRenderPerBatch={8}
          windowSize={7}
          initialNumToRender={6}
          ListEmptyComponent={
            <Text style={styles.empty}>
              Follow people to personalize your feed, or create your first post.
            </Text>
          }
        />
      )}

      <Pressable
        onPress={() => navigateRoot(navigation, 'CreatePost')}
        style={styles.floatingButton}
      >
        <Icon name="add" size={32} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0A1F',
  },
  header: {
    marginTop: 55,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  list: {
    paddingTop: 10,
    paddingBottom: 120,
    paddingHorizontal: 16,
  },
  loader: {
    marginTop: 50,
  },
  bannerWrap: {
    marginTop: 10,
  },
  empty: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.5)',
    marginTop: 40,
    paddingHorizontal: 24,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 85,
    alignSelf: 'center',
    width: 65,
    height: 65,
    borderRadius: 33,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6C63FF',
    shadowOpacity: 0.5,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
});
