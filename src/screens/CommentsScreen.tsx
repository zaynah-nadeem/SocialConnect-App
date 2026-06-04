import React, { useCallback } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
} from 'react-native';
import { Formik } from 'formik';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { addComment } from '../store/slices/postsSlice';
import type { Comment, RootStackParamList } from '../types';
import { colors } from '../theme/colors';
import { fontSize, spacing } from '../utils/responsive';
import { commentSchema } from '../utils/validationSchemas';

type Props = NativeStackScreenProps<RootStackParamList, 'Comments'>;

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString();
}

export default function CommentsScreen({ route }: Props) {
  const { postId } = route.params;
  const dispatch = useAppDispatch();
  const post = useAppSelector(s =>
    s.posts.items.find(p => p.id === postId),
  );

  const renderItem = useCallback(
    ({ item }: { item: Comment }) => (
      <View style={styles.comment}>
        <Text style={styles.author}>{item.userName}</Text>
        <Text style={styles.body}>{item.text}</Text>
        <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
      </View>
    ),
    [],
  );

  if (!post) {
    return (
      <View style={styles.center}>
        <Text>Post not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}>
      <FlatList
        data={post.comments}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No comments yet. Be the first!</Text>
        }
      />

      <Formik
        initialValues={{ text: '' }}
        validationSchema={commentSchema}
        onSubmit={async (values, { resetForm }) => {
          await dispatch(addComment({ postId, text: values.text }));
          resetForm();
        }}>
        {({
          handleChange,
          handleSubmit,
          values,
          errors,
          touched,
        }) => (
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Add a comment..."
              placeholderTextColor={colors.textSecondary}
              value={values.text}
              onChangeText={handleChange('text')}
            />
            <Pressable style={styles.send} onPress={() => handleSubmit()}>
              <Text style={styles.sendText}>Send</Text>
            </Pressable>
            {touched.text && errors.text ? (
              <Text style={styles.error}>{errors.text}</Text>
            ) : null}
          </View>
        )}
      </Formik>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: spacing.md, paddingBottom: 100 },
  comment: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 10,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  author: { fontWeight: '600', color: colors.text, fontSize: fontSize.md },
  body: { color: colors.text, marginTop: spacing.xs, fontSize: fontSize.md },
  time: { color: colors.textSecondary, fontSize: fontSize.sm, marginTop: spacing.xs },
  empty: { textAlign: 'center', color: colors.textSecondary },
  inputRow: {
    flexDirection: 'row',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
  },
  send: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  sendText: { color: '#fff', fontWeight: '600' },
  error: {
    position: 'absolute',
    bottom: 4,
    left: spacing.md,
    color: colors.error,
    fontSize: fontSize.sm,
  },
});
