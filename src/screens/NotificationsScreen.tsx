import React, { useEffect } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { markAllRead, markRead } from '../store/slices/notificationsSlice';

import type { AppNotification, RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

export default function NotificationsScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const items = useAppSelector(s => s.notifications.items);

  useEffect(() => {
    dispatch(markAllRead());
  }, [dispatch]);

  const renderItem = ({ item }: { item: AppNotification }) => {
    const isLike = item.type === 'like';

    return (
      <Pressable
        onPress={() => {
          dispatch(markRead(item.id));
          navigation.navigate('Comments', { postId: item.postId });
        }}
        style={[styles.card, !item.read && styles.unreadCard]}
      >
        {/* ICON */}
        <View style={[
          styles.iconBubble,
          isLike ? styles.likeBubble : styles.commentBubble,
        ]}>
          <Text style={styles.icon}>
            {isLike ? '♥' : '💬'}
          </Text>
        </View>

        {/* TEXT */}
        <View style={styles.content}>
          <Text style={styles.message}>{item.message}</Text>
          <Text style={styles.time}>
            {new Date(item.createdAt).toLocaleString()}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptySub}>
              Likes and comments will appear here
            </Text>
          </View>
        }
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0A1F',
  },

  list: {
    padding: 16,
    paddingBottom: 40,
  },

  /* CARD (same style idea as PostCard) */
  card: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,

    padding: 14,
    marginBottom: 12,

    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#6C63FF',
  },

  /* ICON */
  iconBubble: {
    width: 42,
    height: 42,
    borderRadius: 14,

    justifyContent: 'center',
    alignItems: 'center',

    marginRight: 12,
  },

  likeBubble: {
    backgroundColor: 'rgba(255, 77, 109, 0.15)',
  },

  commentBubble: {
    backgroundColor: 'rgba(108, 99, 255, 0.15)',
  },

  icon: {
    fontSize: 18,
  },

  /* TEXT */
  content: {
    flex: 1,
  },

  message: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  time: {
    marginTop: 4,
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
  },

  /* EMPTY */
  emptyContainer: {
    marginTop: 120,
    alignItems: 'center',
  },

  emptyIcon: {
    fontSize: 34,
    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  emptySub: {
    marginTop: 6,
    fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
  },
});