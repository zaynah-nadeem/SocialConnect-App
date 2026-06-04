import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import { Formik } from 'formik';
import {
  launchImageLibrary,
  ImagePickerResponse,
} from 'react-native-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import AuthTextField from '../components/AuthTextField';
import PrimaryButton from '../components/PrimaryButton';
import ProfileAvatar from '../components/ProfileAvatar';

import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { updateProfile } from '../store/slices/authSlice';

import type { RootStackParamList } from '../types';
import { colors } from '../theme/colors';
import { spacing, wp } from '../utils/responsive';
import { profileSchema } from '../utils/validationSchemas';

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;

export default function EditProfileScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.user);

  const [avatarUri, setAvatarUri] = useState(user?.avatarUri);
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const pickImage = () => {
    launchImageLibrary(
      { mediaType: 'photo', quality: 0.8 },
      (res: ImagePickerResponse) => {
        if (res.assets?.[0]?.uri) {
          setAvatarUri(res.assets[0].uri);
        }
      },
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable style={styles.avatarWrap} onPress={pickImage}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <ProfileAvatar name={user.name} size={wp(28)} />
          )}
          <Text style={styles.changePhoto}>Change photo</Text>
        </Pressable>

        <Formik
          initialValues={{ name: user.name, bio: user.bio ?? '' }}
          validationSchema={profileSchema}
          enableReinitialize
          onSubmit={async values => {
            setSaving(true);
            try {
              await dispatch(
                updateProfile({
                  userId: user.id,
                  updates: {
                    name: values.name,
                    bio: values.bio,
                    avatarUri,
                  },
                }),
              ).unwrap();

              Alert.alert('Saved', 'Profile updated.');
              navigation.goBack();
            } catch (e) {
              Alert.alert(
                'Error',
                e instanceof Error ? e.message : 'Update failed',
              );
            } finally {
              setSaving(false);
            }
          }}
        >
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
                label="Bio"
                multiline
                numberOfLines={4}
                value={values.bio}
                onChangeText={handleChange('bio')}
                onBlur={handleBlur('bio')}
                error={touched.bio ? errors.bio : undefined}
                style={[
                  styles.bioInput,
                ]}
              />

              <PrimaryButton
                title="Save profile"
                onPress={() => handleSubmit()}
                loading={saving}
              />
            </>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },

  container: {
    padding: spacing.lg,
  },

  avatarWrap: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },

  avatar: {
    width: wp(28),
    height: wp(28),
    borderRadius: wp(14),
  },

  changePhoto: {
    color: colors.primary,
    marginTop: spacing.sm,
    fontWeight: '600',
  },


  bioInput: {
    color: '#FFFFFF',
    minHeight: 90,
    textAlignVertical: 'top',
  },
});