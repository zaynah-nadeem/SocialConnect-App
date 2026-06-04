import React, { useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
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
import { fetchPosts, setPosts, toggleLike } from '../../store/slices/postsSlice';
import { subscribeToPosts } from '../../services/postsService';

import type { MainTabParamList, Post } from '../../types';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

type Props = BottomTabScreenProps<MainTabParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector(s => s.posts);
  const user = useAppSelector(s => s.auth.user);

  useEffect(() => {
    dispatch(fetchPosts());

    const unsub = subscribeToPosts(posts => {
      dispatch(setPosts(posts));
    });

    return unsub;
  }, [dispatch]);

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
      />
    ),
    [dispatch, navigation, user?.id],
  );

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.title}>SocialConnect
          
        </Text>

        <Pressable
          onPress={() => navigateRoot(navigation, 'Notifications')}
          style={styles.iconBtn}
        >
          <Icon name="notifications-outline" size={24} color="#fff" />
        </Pressable>
      </View>

      <View style={styles.bannerWrap}>
  <NotificationBanner
    onPress={() => navigateRoot(navigation, 'Notifications')}
  />
</View>

      {/* FEED */}
      {loading && items.length === 0 ? (
        <ActivityIndicator style={styles.loader} color="#6C63FF" />
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        />
      )}

      {/* FLOATING ADD BUTTON */}
      <Pressable
        onPress={() => navigation.navigate('CreatePost' as never)}
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

  /* ✅ SIMPLE CLEAN HEADER */
  header: {
    marginTop: 55,
    paddingHorizontal: 16,

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  },

  loader: {
    marginTop: 50,
  },
  bannerWrap: {
  marginTop: 10,
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