import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '../../src/components/Avatar';
import { Button } from '../../src/components/Button';
import { EmptyState } from '../../src/components/EmptyState';
import { Header } from '../../src/components/Header';
import { PostGrid } from '../../src/components/PostGrid';
import { Screen } from '../../src/components/Screen';
import { fetchPostsByAuthor } from '../../src/lib/posts';
import { fetchFollowCounts, fetchProfile, isFollowing, setFollowing } from '../../src/lib/profiles';
import { useAuth } from '../../src/store/AuthContext';
import { Post, Profile } from '../../src/store/types';
import { useAppTheme, useThemedStyles } from '../../src/theme/useAppTheme';
import type { AppTheme } from '../../src/theme/useAppTheme';

export default function UserProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { user } = useAuth();

  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [posts, setPosts] = useState<Post[]>([]);
  const [counts, setCounts] = useState({ followers: 0, following: 0 });
  const [following, setFollowingState] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);

  const isOwnProfile = !!user && user.id === id;

  const load = useCallback(async () => {
    if (!id) return;
    if (user && user.id === id) {
      router.replace('/(tabs)/profile');
      return;
    }
    const [p, posts, c] = await Promise.all([
      fetchProfile(id),
      fetchPostsByAuthor(id, user?.id ?? null),
      fetchFollowCounts(id),
    ]);
    setProfile(p);
    setPosts(posts);
    setCounts(c);
    if (user) setFollowingState(await isFollowing(user.id, id));
  }, [id, user, router]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleFollow = async () => {
    if (!user || !id || isOwnProfile) return;
    setFollowBusy(true);
    const next = !following;
    try {
      await setFollowing(user.id, id, next);
      setFollowingState(next);
      setCounts((c) => ({ ...c, followers: c.followers + (next ? 1 : -1) }));
    } finally {
      setFollowBusy(false);
    }
  };

  if (profile === undefined) {
    return (
      <Screen scroll={false} contentStyle={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </Screen>
    );
  }

  if (profile === null) {
    return (
      <Screen>
        <Header title="Profile" />
        <EmptyState icon="person-remove-outline" title="Person not found" />
      </Screen>
    );
  }

  return (
    <Screen>
      <Header title={`@${profile.username}`} />

      <View style={styles.header}>
        <Avatar url={profile.avatar_url} name={profile.display_name || profile.username} size={72} />
        <Text style={styles.name}>{profile.display_name || profile.username}</Text>
        <Text style={styles.username}>@{profile.username}</Text>
        {!!profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{posts.length}</Text>
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

        {!!user && (
          <Button
            label={following ? 'Following' : 'Follow'}
            variant={following ? 'secondary' : 'primary'}
            onPress={toggleFollow}
            loading={followBusy}
            fullWidth={false}
          />
        )}
      </View>

      {posts.length === 0 ? (
        <EmptyState icon="images-outline" title="No posts yet" />
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
    statsRow: { flexDirection: 'row', gap: 28, marginTop: 16, marginBottom: 16 },
    stat: { alignItems: 'center' },
    statNumber: { ...typography.cardTitle },
    statLabel: { ...typography.caption },
  });
