import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

import { navigateRoot } from '../../navigation/rootNavigation';
import ProfileAvatar from '../../components/ProfileAvatar';
import PrimaryButton from '../../components/PrimaryButton';

import { useAppSelector } from '../../hooks/redux';
import type { MainTabParamList } from '../../types';

import { colors } from '../../theme/colors';
import { fontSize, spacing, wp } from '../../utils/responsive';

type Props = BottomTabScreenProps<MainTabParamList, 'Profile'>;

export default function ProfileScreen({ navigation }: Props) {
  const user = useAppSelector(s => s.auth.user);

  if (!user) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* PROFILE CARD */}
      <View style={styles.card}>

        <ProfileAvatar
          uri={user.avatarUri}
          name={user.name}
          size={wp(28)}
        />

        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>

        <View style={styles.divider} />

        <Text style={styles.bio}>
          {user.bio || 'No bio yet. Add something about yourself ✨'}
        </Text>

        {/* BUTTON */}
        <View style={styles.buttonWrapper}>
  <PrimaryButton
    title="Edit Profile"
    onPress={() => navigateRoot(navigation, 'EditProfile')}
  />
</View>

        {/* LINK */}
        <Pressable
          style={styles.viewLink}
          onPress={() =>
            navigateRoot(navigation, 'UserProfile', { userId: user.id })
          }
        >
          <Text style={styles.viewLinkText}>View Public Profile</Text>
        </Pressable>

      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },

  /* 🔥 MAIN CARD */
  card: {
    width: '100%',
    alignItems: 'center',

    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,

    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,

    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',

    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },

  name: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: spacing.md,
  },

  email: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 4,
  },

  divider: {
    width: '60%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: spacing.lg,
  },

  bio: {
    fontSize: fontSize.md,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: fontSize.md * 1.5,
    paddingHorizontal: 10,
  },

  viewLink: {
    marginTop: spacing.md,
  },

  viewLinkText: {
    color: '#6C63FF',
    fontWeight: '700',
    fontSize: fontSize.sm,
  },

  buttonWrapper: {
  width: '100%',
  marginTop: spacing.lg,
},
});