import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '../../src/components/Avatar';
import { BeforeAfterSlider } from '../../src/components/BeforeAfterSlider';
import { CategoryBadge } from '../../src/components/CategoryBadge';
import { EmptyState } from '../../src/components/EmptyState';
import { Header } from '../../src/components/Header';
import { LikeButton } from '../../src/components/LikeButton';
import { Screen } from '../../src/components/Screen';
import { TextField } from '../../src/components/TextField';
import { formatRelativeTime } from '../../src/lib/format';
import { addComment, fetchComments, fetchPost, setLiked } from '../../src/lib/posts';
import { useAuth } from '../../src/store/AuthContext';
import { Comment, Post } from '../../src/store/types';
import { useAppTheme, useThemedStyles } from '../../src/theme/useAppTheme';
import type { AppTheme } from '../../src/theme/useAppTheme';

export default function PostDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { user } = useAuth();

  const [post, setPost] = useState<Post | null | undefined>(undefined);
  const [comments, setComments] = useState<Comment[]>([]);
  const [draft, setDraft] = useState('');
  const [posting, setPosting] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    const [p, c] = await Promise.all([fetchPost(id, user?.id ?? null), fetchComments(id)]);
    setPost(p);
    setComments(c);
  }, [id, user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleLike = async () => {
    if (!user || !post) return;
    const nextLiked = !post.liked_by_me;
    setPost({ ...post, liked_by_me: nextLiked, like_count: post.like_count + (nextLiked ? 1 : -1) });
    try {
      await setLiked(post.id, user.id, nextLiked);
    } catch {
      setPost(post);
    }
  };

  const submitComment = async () => {
    if (!user || !post || !draft.trim()) return;
    setPosting(true);
    try {
      const comment = await addComment(post.id, user.id, draft.trim());
      setComments((prev) => [...prev, comment]);
      setPost({ ...post, comment_count: post.comment_count + 1 });
      setDraft('');
    } finally {
      setPosting(false);
    }
  };

  if (post === undefined) {
    return (
      <Screen scroll={false} contentStyle={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </Screen>
    );
  }

  if (post === null) {
    return (
      <Screen>
        <Header title="Post" />
        <EmptyState icon="alert-circle-outline" title="Post not found" body="It may have been removed." />
      </Screen>
    );
  }

  const authorName = post.author?.display_name || post.author?.username || 'Someone';

  return (
    <Screen>
      <Header title="Post" />

      <BeforeAfterSlider beforeUrl={post.before_photo_url} afterUrl={post.after_photo_url} height={320} />

      <View style={styles.header}>
        <Avatar url={post.author?.avatar_url} name={authorName} size={40} />
        <View style={{ flex: 1 }}>
          <Text style={styles.authorName} onPress={() => router.push(`/profile/${post.author_id}`)}>
            {authorName}
          </Text>
          {!!post.location_name && (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={12} color={styles.muted.color} />
              <Text style={styles.muted}>{post.location_name}</Text>
            </View>
          )}
        </View>
        <Text style={styles.muted}>{formatRelativeTime(post.created_at)}</Text>
      </View>

      <CategoryBadge category={post.category} />
      {!!post.caption && <Text style={styles.body}>{post.caption}</Text>}

      <LikeButton liked={post.liked_by_me} count={post.like_count} onPress={toggleLike} />

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>Comments ({comments.length})</Text>
      {comments.length === 0 ? (
        <Text style={styles.muted}>No comments yet — say something encouraging.</Text>
      ) : (
        comments.map((c) => (
          <View key={c.id} style={styles.comment}>
            <Avatar url={c.author?.avatar_url} name={c.author?.display_name || c.author?.username} size={30} />
            <View style={{ flex: 1 }}>
              <Text style={styles.commentAuthor}>{c.author?.display_name || c.author?.username || 'Someone'}</Text>
              <Text style={styles.body}>{c.body}</Text>
            </View>
          </View>
        ))
      )}

      <View style={styles.commentInputRow}>
        <View style={{ flex: 1 }}>
          <TextField value={draft} onChangeText={setDraft} placeholder="Add a comment" />
        </View>
        <Ionicons
          name="send"
          size={22}
          color={draft.trim() && !posting ? colors.primary : colors.textMuted}
          onPress={submitComment}
        />
      </View>
    </Screen>
  );
}

const makeStyles = ({ colors, typography }: AppTheme) =>
  StyleSheet.create({
    center: { alignItems: 'center', justifyContent: 'center', flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    authorName: { ...typography.bodyStrong },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    muted: { ...typography.caption },
    body: { ...typography.body },
    divider: { height: 1, backgroundColor: colors.border },
    sectionTitle: { ...typography.cardTitle },
    comment: { flexDirection: 'row', gap: 10 },
    commentAuthor: { ...typography.bodyStrong, fontSize: 13 },
    commentInputRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  });
