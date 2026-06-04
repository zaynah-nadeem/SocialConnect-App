import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useAppSelector } from '../hooks/redux';
import { selectUnreadCount } from '../store/slices/notificationsSlice';
import { colors } from '../theme/colors';
import { fontSize, spacing } from '../utils/responsive';

interface Props {
  onPress: () => void;
}

export default function NotificationBanner({ onPress }: Props) {
  const unread = useAppSelector(selectUnreadCount);

  if (unread === 0) return null;

  return (
    <Pressable style={styles.banner} onPress={onPress}>
      <Text style={styles.text}>
        {unread} new notification{unread > 1 ? 's' : ''}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,

    backgroundColor: 'rgba(108, 99, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.35)',

    paddingVertical: spacing.sm,
    borderRadius: 14,

    alignItems: 'center',
  },

  text: {
    color: '#FFFFFF',
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
});