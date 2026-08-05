import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '../../src/components/Avatar';
import { Button } from '../../src/components/Button';
import { EmptyState } from '../../src/components/EmptyState';
import { PostGrid } from '../../src/components/PostGrid';
import { Screen } from '../../src/components/Screen';
import { fetchFollowCounts } from '../../src/lib/profiles';
import { fetchPostsByAuthor } from '../../src/lib/posts';
import { useAuth } from '../../src/store/AuthContext';
import { Post } from '../../src/store/types';
import { useAppTheme, useThemedStyles } from '../../src/theme/useAppTheme';
import type { AppTheme } from '../../src/theme/useAppTheme';

export default function MyProfile() {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [counts, setCounts] = useState({ followers: 0, following: 0 });

  const load = useCallback(async () => {
    if (!user) return;
    const [p, c] = await Promise.all([fetchPostsByAuthor(user.id, user.id), fetchFollowCounts(user.id)]);
    setPosts(p);
    setCounts(c);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  if (!user || !profile) {
    return (
      <Screen scroll={false} contentStyle={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Avatar url={profile.avatar_url} name={profile.display_name || profile.username} size={72} />
        <Text style={styles.name}>{profile.display_name || profile.username}</Text>
        <Text style={styles.username}>@{profile.username}</Text>
        {!!profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{posts?.length ?? 0}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{counts.followers}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{counts.following}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <View style={{ flex: 1 }}>
            <Button label="Edit profile" variant="secondary" onPress={() => router.push('/profile/edit')} />
          </View>
          <View style={{ flex: 1 }}>
            <Button label="Sign out" variant="ghost" onPress={() => signOut()} />
          </View>
        </View>
      </View>

      {posts === null ? (
        <ActivityIndicator color={colors.primary} />
      ) : posts.length === 0 ? (
        <EmptyState icon="images-outline" title="No posts yet" body="Share your first before-and-after." />
      ) : (
        <PostGrid posts={posts} />
      )}
    </Screen>
  );
}

const makeStyles = ({ colors, typography }: AppTheme) =>
  StyleSheet.create({
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    header: { alignItems: 'center', gap: 4 },
    name: { ...typography.screenTitle, marginTop: 10 },
    username: { ...typography.bodyMuted },
    bio: { ...typography.body, textAlign: 'center', marginTop: 6 },
    statsRow: { flexDirection: 'row', gap: 28, marginTop: 16 },
    stat: { alignItems: 'center' },
    statNumber: { ...typography.cardTitle },
    statLabel: { ...typography.caption },
    actionsRow: { flexDirection: 'row', gap: 10, marginTop: 18, alignSelf: 'stretch' },
  });
