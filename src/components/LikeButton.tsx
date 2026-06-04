import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { colors } from '../theme/colors';
import { fontSize } from '../utils/responsive';

interface Props {
  liked: boolean;
  count: number;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function LikeButton({ liked, count, onPress }: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(1.35, { damping: 4 }),
      withSpring(1),
    );
    onPress();
  };

  return (
    <AnimatedPressable
      style={[styles.row, animatedStyle]}
      onPress={handlePress}>
      <Text style={[styles.icon, liked && styles.liked]}>
        {liked ? '♥' : '♡'}
      </Text>
      <Text style={styles.count}>{count}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  icon: { fontSize: fontSize.lg, color: colors.textSecondary },
  liked: { color: colors.like },
  count: { fontSize: fontSize.sm, color: colors.textSecondary },
});
