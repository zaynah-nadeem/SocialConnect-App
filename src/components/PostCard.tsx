import React, { memo } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { Post } from '../types';
import { fontSize, spacing, wp } from '../utils/responsive';
import ProfileAvatar from './ProfileAvatar';
import LikeButton from './LikeButton';

interface Props {
  post: Post;
  currentUserId: string;
  onLike: () => void;
  onComment: () => void;
  onAuthorPress: () => void;
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;

  return date.toLocaleDateString();
}

function PostCard({
  post,
  currentUserId,
  onLike,
  onComment,
  onAuthorPress,
}: Props) {
  const liked = post.likeIds.includes(currentUserId);

  return (
    <View style={styles.card}>

      {/* HEADER */}
      <Pressable style={styles.header} onPress={onAuthorPress}>
        <ProfileAvatar
          uri={post.userAvatarUri}
          name={post.userName}
          size={wp(10)}
        />

        <View style={styles.meta}>
          <Text style={styles.name}>{post.userName}</Text>
          <Text style={styles.time}>{formatTime(post.createdAt)}</Text>
        </View>
      </Pressable>

      {/* TEXT */}
      {post.text ? (
        <Text style={styles.text}>{post.text}</Text>
      ) : null}

      {/* IMAGE */}
      {post.imageUri ? (
        <Image
          source={{ uri: post.imageUri }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : null}

      {/* ACTIONS */}
      <View style={styles.actions}>
        <LikeButton
          liked={liked}
          count={post.likeIds.length}
          onPress={onLike}
        />

        <Pressable style={styles.commentBtn} onPress={onComment}>
          <Text style={styles.commentIcon}>💬</Text>
          <Text style={styles.commentCount}>
            {post.comments.length}
          </Text>
        </Pressable>
      </View>

    </View>
  );
}

export default memo(PostCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#18152E',

    marginBottom: 16,

    borderRadius: 22,

    padding: 16,

    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',

    shadowColor: '#6C63FF',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 5,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  meta: {
    marginLeft: 10,
    flex: 1,
  },

  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  time: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
    marginTop: 2,
  },

  text: {
    fontSize: 15,
    color: '#F5F5F5',
    lineHeight: 22,
  },

  image: {
    width: '100%',
    height: 220,

    borderRadius: 18,

    marginTop: 12,
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',

    marginTop: 14,
  },

  commentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20,
  },

  commentIcon: {
    fontSize: 18,
  },

  commentCount: {
    marginLeft: 6,
    color: '#B5B5C3',
  },
});