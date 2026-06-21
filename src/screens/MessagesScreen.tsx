import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import ProfileAvatar from '../components/ProfileAvatar';
import { navigateRoot } from '../navigation/rootNavigation';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { setConversations } from '../store/slices/messagesSlice';
import { subscribeToConversations } from '../services/messagesService';
import type { Conversation, RootStackParamList } from '../types';
import { colors } from '../theme/colors';
import { fontSize, spacing, wp } from '../utils/responsive';

type Props = NativeStackScreenProps<RootStackParamList, 'Messages'>;

export default function MessagesScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.user);
  const conversations = useAppSelector(s => s.messages.conversations);

  useEffect(() => {
    if (!user) {
      return;
    }
    const unsub = subscribeToConversations(user.id, items => {
      dispatch(setConversations(items));
    });
    return unsub;
  }, [dispatch, user]);

  const getOtherParticipant = (conversation: Conversation) => {
    const otherId =
      conversation.participantIds.find(id => id !== user?.id) ?? '';
    return {
      id: otherId,
      name: conversation.participantNames[otherId] ?? 'User',
    };
  };

  const renderItem = ({ item }: { item: Conversation }) => {
    const other = getOtherParticipant(item);
    return (
      <Pressable
        style={styles.row}
        onPress={() =>
          navigateRoot(navigation, 'Chat', {
            conversationId: item.id,
            otherUserId: other.id,
            otherUserName: other.name,
          })
        }
      >
        <ProfileAvatar name={other.name} size={wp(12)} />
        <View style={styles.meta}>
          <Text style={styles.name}>{other.name}</Text>
          <Text style={styles.preview} numberOfLines={1}>
            {item.lastMessage || 'Start a conversation'}
          </Text>
        </View>
      </Pressable>
    );
  };

  if (!user) {
    return null;
  }

  return (
    <View style={styles.container}>
      {conversations.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.empty}>No conversations yet.</Text>
          <Text style={styles.emptySub}>
            Visit a user profile and tap Message to start chatting.
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  meta: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    color: colors.text,
    fontWeight: '700',
    fontSize: fontSize.md,
  },
  preview: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginTop: 4,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  empty: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  emptySub: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
