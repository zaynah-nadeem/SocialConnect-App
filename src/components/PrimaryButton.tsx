import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { colors } from '../theme/colors';
import { fontSize, spacing } from '../utils/responsive';

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'outline';
  style?: ViewStyle;
}

export default function PrimaryButton({
  title,
  onPress,
  loading,
  variant = 'primary',
  style,
}: Props) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.btn,
        variant === 'outline' ? styles.outline : styles.primary,
        pressed && (variant === 'outline' ? styles.outlinePressed : styles.primaryPressed),
        style,
      ]}
      onPress={onPress}
      disabled={loading}>
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#A09AFF' : '#fff'} />
      ) : (
        <Text style={[styles.text, variant === 'outline' ? styles.outlineText : null]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
 btn: {
  borderRadius: 14,
  paddingVertical: spacing.md,
  alignItems: 'center',
  marginTop: spacing.sm,

  width: '100%',   
},

 
  primary: {
    backgroundColor: '#6C63FF',
    shadowColor: '#6C63FF',
    shadowOpacity: 0.55,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  primaryPressed: {
    backgroundColor: '#5A52E0',
    shadowOpacity: 0.25,
  },

  // Outline — ghost glass
  outline: {
    backgroundColor: 'rgba(108,99,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(108,99,255,0.45)',
  },
  outlinePressed: {
    backgroundColor: 'rgba(108,99,255,0.15)',
  },

  text: {
    color: '#fff',
    fontSize: fontSize.md,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  outlineText: {
    color: '#A09AFF',
  },
});