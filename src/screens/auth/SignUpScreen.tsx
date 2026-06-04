import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  Pressable,
} from 'react-native';
import { Formik } from 'formik';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AuthTextField from '../../components/AuthTextField';
import PrimaryButton from '../../components/PrimaryButton';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { clearAuthError, signUp } from '../../store/slices/authSlice';
import type { AuthStackParamList } from '../../types';
import { colors } from '../../theme/colors';
import { fontSize, spacing } from '../../utils/responsive';
import { signUpSchema } from '../../utils/validationSchemas';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

export default function SignUpScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(s => s.auth);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create account</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Formik
          initialValues={{
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
          }}
          validationSchema={signUpSchema}
          onSubmit={async values => {
            dispatch(clearAuthError());
            await dispatch(
              signUp({
                name: values.name,
                email: values.email,
                password: values.password,
              }),
            );
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
                label="Name"
                value={values.name}
                onChangeText={handleChange('name')}
                onBlur={handleBlur('name')}
                error={touched.name ? errors.name : undefined}
              />
              <AuthTextField
                label="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                value={values.email}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                error={touched.email ? errors.email : undefined}
              />
              <AuthTextField
                label="Password"
                secureTextEntry
                value={values.password}
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                error={touched.password ? errors.password : undefined}
              />
              <AuthTextField
                label="Confirm password"
                secureTextEntry
                value={values.confirmPassword}
                onChangeText={handleChange('confirmPassword')}
                onBlur={handleBlur('confirmPassword')}
                error={
                  touched.confirmPassword ? errors.confirmPassword : undefined
                }
              />
              <PrimaryButton
                title="Sign Up"
                onPress={() => handleSubmit()}
                loading={loading}
              />
            </>
          )}
        </Formik>

        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.link}>Already have an account? Sign in</Text>
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
    marginBottom: spacing.lg,
  },
  error: { color: colors.error, marginBottom: spacing.sm },
  link: {
    color: colors.primary,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
