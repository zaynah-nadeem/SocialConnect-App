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
import { colors } from '../theme/colors';

interface Props {
  post: Post;
  currentUserId: string;
  onLike: () => void;
  onComment: () => void;
  onAuthorPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
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
  onEdit,
  onDelete,
}: Props) {
  const liked = post.likeIds.includes(currentUserId);
  const isOwner = post.userId === currentUserId;

  return (
    <View style={styles.card}>
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

        {isOwner ? (
          <View style={styles.ownerActions}>
            {onEdit ? (
              <Pressable onPress={onEdit} style={styles.actionBtn}>
                <Text style={styles.actionText}>Edit</Text>
              </Pressable>
            ) : null}
            {onDelete ? (
              <Pressable onPress={onDelete} style={styles.actionBtn}>
                <Text style={[styles.actionText, styles.deleteText]}>
                  Delete
                </Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </Pressable>

      {post.text ? <Text style={styles.text}>{post.text}</Text> : null}

      {post.imageUri ? (
        <Image
          source={{ uri: post.imageUri }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : null}

      <View style={styles.actions}>
        <LikeButton
          liked={liked}
          count={post.likeIds.length}
          onPress={onLike}
        />

        <Pressable style={styles.commentBtn} onPress={onComment}>
          <Text style={styles.commentIcon}>💬</Text>
          <Text style={styles.commentCount}>{post.comments.length}</Text>
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
    shadowOffset: { width: 0, height: 4 },
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
  ownerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  actionText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: fontSize.sm,
  },
  deleteText: {
    color: colors.error,
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
