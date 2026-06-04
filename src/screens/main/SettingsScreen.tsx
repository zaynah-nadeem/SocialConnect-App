import React from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import PrimaryButton from '../../components/PrimaryButton';
import { useAppDispatch } from '../../hooks/redux';
import { signOut } from '../../store/slices/authSlice';
import { clearNotifications } from '../../store/slices/notificationsSlice';
import { colors } from '../../theme/colors';
import { fontSize, spacing } from '../../utils/responsive';
import { CommonActions, useNavigation } from '@react-navigation/native';

export default function SettingsScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const [realtime, setRealtime] = React.useState(true);

  const handleSignOut = async () => {
    Alert.alert('Sign out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await dispatch(clearNotifications());
          await dispatch(signOut());

          navigation.reset({
  index: 0,
  routes: [{ name: 'Auth' as never }],
});
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'Auth' as never }],
            }),
          );
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
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 10,
  },
  label: { color: colors.text },
});