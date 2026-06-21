import React from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import PrimaryButton from '../../components/PrimaryButton';
import { useAppDispatch } from '../../hooks/redux';
import { signOut } from '../../store/slices/authSlice';
import { clearNotifications } from '../../store/slices/notificationsSlice';
import { colors } from '../../theme/colors';
import { fontSize, spacing } from '../../utils/responsive';
import { isFirebaseConfigured } from '../../config/firebase';

export default function SettingsScreen() {
  const dispatch = useAppDispatch();
  const [realtime, setRealtime] = React.useState(true);

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await dispatch(clearNotifications());
          await dispatch(signOut());
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.section}>App</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Real-time sync</Text>
        <Switch value={realtime} onValueChange={setRealtime} />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Backend</Text>
        <Text style={styles.value}>
          {isFirebaseConfigured() ? 'Firebase' : 'Local (mock)'}
        </Text>
      </View>

      <Text style={styles.section}>Account</Text>

      <PrimaryButton
        title="Sign out"
        onPress={handleSignOut}
        variant="outline"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  section: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 10,
    marginBottom: spacing.sm,
  },
  label: { color: colors.text },
  value: { color: colors.textSecondary, fontSize: fontSize.sm },
});
