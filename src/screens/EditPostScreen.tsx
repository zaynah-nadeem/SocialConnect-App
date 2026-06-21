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
  TextInput,
} from 'react-native';
import { Formik } from 'formik';
import { launchImageLibrary } from 'react-native-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import PrimaryButton from '../components/PrimaryButton';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { updatePost } from '../store/slices/postsSlice';
import type { RootStackParamList } from '../types';
import { colors } from '../theme/colors';
import { fontSize, spacing, wp } from '../utils/responsive';
import { postSchema } from '../utils/validationSchemas';

type Props = NativeStackScreenProps<RootStackParamList, 'EditPost'>;

export default function EditPostScreen({ route, navigation }: Props) {
  const { postId } = route.params;
  const dispatch = useAppDispatch();
  const post = useAppSelector(s =>
    s.posts.items.find(p => p.id === postId),
  );
  const [imageUri, setImageUri] = useState<string | undefined>(post?.imageUri);
  const [submitting, setSubmitting] = useState(false);

  if (!post) {
    return null;
  }

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, res => {
      if (res.assets?.[0]?.uri) {
        setImageUri(res.assets[0].uri);
      }
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Formik
          initialValues={{ text: post.text }}
          validationSchema={postSchema}
          enableReinitialize
          onSubmit={async values => {
            if (!values.text.trim() && !imageUri) {
              Alert.alert('Empty post', 'Add text or an image.');
              return;
            }
            setSubmitting(true);
            try {
              await dispatch(
                updatePost({
                  postId,
                  text: values.text,
                  imageUri,
                }),
              ).unwrap();
              navigation.goBack();
            } catch (e) {
              Alert.alert(
                'Error',
                e instanceof Error ? e.message : 'Failed to update post',
              );
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ handleChange, handleSubmit, values, errors, touched }) => (
            <>
              <Text style={styles.label}>Edit your post</Text>
              <TextInput
                style={styles.input}
                multiline
                placeholder="Write something..."
                placeholderTextColor={colors.textSecondary}
                value={values.text}
                onChangeText={handleChange('text')}
              />
              {touched.text && errors.text ? (
                <Text style={styles.error}>{errors.text}</Text>
              ) : null}

              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.preview} />
              ) : null}

              <Pressable style={styles.attach} onPress={pickImage}>
                <Text style={styles.attachText}>📷 Change image</Text>
              </Pressable>

              <PrimaryButton
                title="Save changes"
                onPress={() => handleSubmit()}
                loading={submitting}
              />
            </>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg },
  label: {
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    backgroundColor: colors.surface,
    textAlignVertical: 'top',
  },
  error: { color: colors.error, marginTop: spacing.xs },
  preview: {
    width: '100%',
    height: wp(45),
    borderRadius: 8,
    marginTop: spacing.md,
  },
  attach: { marginTop: spacing.md },
  attachText: { color: colors.primary, fontWeight: '600' },
});
