import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import ProfileAvatar from '../components/ProfileAvatar';
import { navigateRoot } from '../navigation/rootNavigation';
import * as authService from '../services/authService';
import { searchPosts } from '../services/postsService';
import type { Post, RootStackParamList, User } from '../types';
import { colors } from '../theme/colors';
import { fontSize, spacing, wp } from '../utils/responsive';

type Props = NativeStackScreenProps<RootStackParamList, 'Search'>;

type SearchResult =
  | { type: 'user'; data: User }
  | { type: 'post'; data: Post };

export default function SearchScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const runSearch = useCallback(async (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const [users, posts] = await Promise.all([
        authService.searchUsersByName(trimmed),
        searchPosts(trimmed),
      ]);

      const merged: SearchResult[] = [
        ...users.map(u => ({ type: 'user' as const, data: u })),
        ...posts.map(p => ({ type: 'post' as const, data: p })),
      ];
      setResults(merged);
    } finally {
      setLoading(false);
    }
  }, []);

  const renderItem = ({ item }: { item: SearchResult }) => {
    if (item.type === 'user') {
      const user = item.data;
      return (
        <Pressable
          style={styles.row}
          onPress={() =>
            navigateRoot(navigation, 'UserProfile', { userId: user.id })
          }
        >
          <ProfileAvatar uri={user.avatarUri} name={user.name} size={wp(10)} />
          <View style={styles.rowMeta}>
            <Text style={styles.rowTitle}>{user.name}</Text>
            <Text style={styles.rowSub}>{user.email}</Text>
          </View>
          <Text style={styles.badge}>User</Text>
        </Pressable>
      );
    }

    const post = item.data;
    return (
      <Pressable
        style={styles.row}
        onPress={() =>
          navigateRoot(navigation, 'Comments', { postId: post.id })
        }
      >
        <View style={styles.rowMeta}>
          <Text style={styles.rowTitle}>{post.userName}</Text>
          <Text style={styles.rowSub} numberOfLines={2}>
            {post.text || 'Image post'}
          </Text>
        </View>
        <Text style={styles.badge}>Post</Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Icon name="search" size={20} color={colors.textSecondary} />
        <TextInput
          style={styles.input}
          placeholder="Search users or posts..."
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={text => {
            setQuery(text);
            runSearch(text);
          }}
          autoFocus
        />
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item, index) =>
            item.type === 'user'
              ? `user-${item.data.id}`
              : `post-${item.data.id}-${index}`
          }
          renderItem={renderItem}
          ListEmptyComponent={
            query.trim() ? (
              <Text style={styles.empty}>No results found.</Text>
            ) : (
              <Text style={styles.empty}>Type to search users or posts.</Text>
            )
          }
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    margin: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    color: colors.text,
    fontSize: fontSize.md,
  },
  loader: { marginTop: spacing.xl },
  list: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  rowMeta: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  rowTitle: {
    color: colors.text,
    fontWeight: '700',
    fontSize: fontSize.md,
  },
  rowSub: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  badge: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  empty: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: spacing.xl,
  },
});
