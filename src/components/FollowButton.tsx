import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import {
  addFollowingId,
  followUser,
  unfollowUser,
} from '../store/slices/followsSlice';
import * as followService from '../services/followService';
import { colors } from '../theme/colors';
import { fontSize, spacing } from '../utils/responsive';

interface Props {
  targetUserId: string;
}

export default function FollowButton({ targetUserId }: Props) {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(s => s.auth.user);
  const followingIds = useAppSelector(s => s.follows.followingIds);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  const isFollowing =
    followingIds.includes(targetUserId);

  useEffect(() => {
    if (!currentUser) {
      return;
    }
    followService
      .isFollowing(currentUser.id, targetUserId)
      .then(following => {
        if (following) {
          dispatch(addFollowingId(targetUserId));
        }
      })
      .finally(() => setChecking(false));
  }, [currentUser, targetUserId]);

  if (!currentUser || currentUser.id === targetUserId) {
    return null;
  }

  if (checking) {
    return <ActivityIndicator color={colors.primary} />;
  }

  const toggle = async () => {
    setLoading(true);
    try {
      if (isFollowing) {
        await dispatch(
          unfollowUser({
            followerId: currentUser.id,
            followingId: targetUserId,
          }),
        ).unwrap();
      } else {
        await dispatch(
          followUser({
            followerId: currentUser.id,
            followingId: targetUserId,
          }),
        ).unwrap();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Pressable
      style={[styles.btn, isFollowing ? styles.unfollow : styles.follow]}
      onPress={toggle}
      disabled={loading}
    >
      <Text style={styles.text}>
        {loading ? '...' : isFollowing ? 'Unfollow' : 'Follow'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    marginTop: spacing.sm,
  },
  follow: {
    backgroundColor: colors.primary,
  },
  unfollow: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  text: {
    color: colors.text,
    fontWeight: '700',
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
});
