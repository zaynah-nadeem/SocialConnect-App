import React, { useEffect, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { sendMessage, setActiveMessages } from '../store/slices/messagesSlice';
import { subscribeToMessages } from '../services/messagesService';
import type { Message, RootStackParamList } from '../types';
import { colors } from '../theme/colors';
import { fontSize, spacing } from '../utils/responsive';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

export default function ChatScreen({ route }: Props) {
  const { conversationId, otherUserId, otherUserName } = route.params;

  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.user);
  const messages = useAppSelector(s => s.messages.activeMessages);

  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!conversationId) return;
  
    const unsub = subscribeToMessages(conversationId, items => {
      dispatch(setActiveMessages(items));
    });
  
    return () => {
      unsub?.();
    };
  }, [conversationId]);
  const handleSend = async () => {
    if (!text.trim() || sending || !user?.id) return;

    setSending(true);

    try {
      await dispatch(
        sendMessage({
          conversationId,
          text: text.trim(),
          senderId: user.id,
          senderName: user.name ?? '',
          receiverId: otherUserId,
        }),
      ).unwrap();

      setText('');
    } finally {
      setSending(false);
    }
  };

  // ✅ Safe render
  const renderItem = ({ item }: { item: Message }) => {
    const isMine = item.senderId === user?.id;

    return (
      <View
        style={[
          styles.bubble,
          isMine ? styles.myBubble : styles.theirBubble,
        ]}
      >
        {!isMine && (
          <Text style={styles.sender}>{item.senderName}</Text>
        )}

        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder={`Message ${otherUserName || ''}`}
          placeholderTextColor={colors.textSecondary}
          value={text}
          onChangeText={setText}
          multiline
        />

        <Pressable
          style={[styles.sendBtn, sending && { opacity: 0.6 }]}
          onPress={handleSend}
          disabled={sending}
        >
          <Text style={styles.sendText}>
            {sending ? '...' : 'Send'}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  bubble: {
    maxWidth: '80%',
    padding: spacing.sm,
    borderRadius: 14,
    marginBottom: spacing.sm,
  },
  myBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
  },
  theirBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
  },
  sender: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginBottom: 2,
  },
  messageText: {
    color: colors.text,
    fontSize: fontSize.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    color: colors.text,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  sendBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 10,
    marginLeft: spacing.sm,
  },
  sendText: {
    color: colors.text,
    fontWeight: '700',
  },
});