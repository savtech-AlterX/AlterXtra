import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '../../src/components/EmptyState';
import { PostCard } from '../../src/components/PostCard';
import { fetchFeed, setLiked } from '../../src/lib/posts';
import { useAuth } from '../../src/store/AuthContext';
import { Post } from '../../src/store/types';
import { useAppTheme, useThemedStyles } from '../../src/theme/useAppTheme';
import type { AppTheme } from '../../src/theme/useAppTheme';

export default function Feed() {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchFeed({ userId: user?.id ?? null });
      setPosts(data);
    } catch (e: any) {
      setError(e.message ?? 'Could not load the feed.');
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const toggleLike = async (post: Post) => {
    if (!user) return;
    const nextLiked = !post.liked_by_me;
    setPosts((prev) =>
      (prev ?? []).map((p) =>
        p.id === post.id ? { ...p, liked_by_me: nextLiked, like_count: p.like_count + (nextLiked ? 1 : -1) } : p
      )
    );
    try {
      await setLiked(post.id, user.id, nextLiked);
    } catch {
      // revert on failure
      setPosts((prev) =>
        (prev ?? []).map((p) =>
          p.id === post.id ? { ...p, liked_by_me: post.liked_by_me, like_count: post.like_count } : p
        )
      );
    }
  };

  if (posts === null && !error) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.list}
      data={posts ?? []}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <PostCard post={item} onToggleLike={toggleLike} />}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      ListHeaderComponent={<Text style={styles.title}>Regrown</Text>}
      ListEmptyComponent={
        error ? (
          <EmptyState icon="cloud-offline-outline" title="Couldn't load the feed" body={error} />
        ) : (
          <EmptyState
            icon="leaf-outline"
            title="No posts yet"
            body="Be the first to share a before-and-after of good climate news."
          />
        )
      }
    />
  );
}

const makeStyles = ({ colors, typography }: AppTheme) =>
  StyleSheet.create({
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    list: { padding: 16, gap: 14 },
    title: { ...typography.screenTitle, marginBottom: 4 },
  });
