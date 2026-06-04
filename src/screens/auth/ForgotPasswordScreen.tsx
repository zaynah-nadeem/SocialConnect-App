import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  Pressable,
  Alert,
} from 'react-native';
import { Formik } from 'formik';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AuthTextField from '../../components/AuthTextField';
import PrimaryButton from '../../components/PrimaryButton';
import * as authService from '../../services/authService';
import type { AuthStackParamList } from '../../types';
import { colors } from '../../theme/colors';
import { fontSize, spacing } from '../../utils/responsive';
import { forgotPasswordSchema } from '../../utils/validationSchemas';
import { isFirebaseConfigured } from '../../config/firebase';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(false);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Reset password</Text>
        <Text style={styles.subtitle}>
          {isFirebaseConfigured()
            ? 'We will email you a reset link.'
            : 'Mock mode: confirms your email exists in local storage.'}
        </Text>

        <Formik
          initialValues={{ email: '' }}
          validationSchema={forgotPasswordSchema}
          onSubmit={async values => {
            setLoading(true);
            try {
              await authService.resetPassword(values.email);
              Alert.alert(
                'Check your email',
                isFirebaseConfigured()
                  ? 'Password reset link sent.'
                  : 'If this email is registered, you can sign in after resetting locally.',
              );
              navigation.goBack();
            } catch (e) {
              Alert.alert(
                'Error',
                e instanceof Error ? e.message : 'Request failed',
              );
            } finally {
              setLoading(false);
            }
          }}>
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
          }) => (
            <>
              <AuthTextField
                label="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                value={values.email}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                error={touched.email ? errors.email : undefined}
              />
              <PrimaryButton
                title="Send reset link"
                onPress={() => handleSubmit()}
                loading={loading}
              />
            </>
          )}
        </Formik>

        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.link}>Back to sign in</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, padding: spacing.lg, paddingTop: spacing.xl },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  link: {
    color: colors.primary,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
