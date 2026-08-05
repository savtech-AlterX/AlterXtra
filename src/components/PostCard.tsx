import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Avatar } from './Avatar';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { Card } from './Card';
import { CategoryBadge } from './CategoryBadge';
import { LikeButton } from './LikeButton';
import { formatRelativeTime } from '../lib/format';
import { Post } from '../store/types';
import { useThemedStyles } from '../theme/useAppTheme';
import type { AppTheme } from '../theme/useAppTheme';

type Props = {
  post: Post;
  onToggleLike: (post: Post) => void;
};

export function PostCard({ post, onToggleLike }: Props) {
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const authorName = post.author?.display_name || post.author?.username || 'Someone';

  return (
    <Card style={styles.card}>
      <Pressable
        style={styles.header}
        onPress={() => router.push(`/profile/${post.author_id}`)}
        accessibilityRole="button"
        accessibilityLabel={`View ${authorName}'s profile`}
      >
        <Avatar url={post.author?.avatar_url} name={authorName} size={38} />
        <View style={styles.headerText}>
          <Text style={styles.authorName}>{authorName}</Text>
          {!!post.location_name && (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={12} color={styles.muted.color} />
              <Text style={styles.muted}>{post.location_name}</Text>
            </View>
          )}
        </View>
        <Text style={styles.muted}>{formatRelativeTime(post.created_at)}</Text>
      </Pressable>

      <Pressable onPress={() => router.push(`/post/${post.id}`)}>
        <BeforeAfterSlider beforeUrl={post.before_photo_url} afterUrl={post.after_photo_url} />
      </Pressable>

      <View style={styles.meta}>
        <CategoryBadge category={post.category} />
        {!!post.caption && (
          <Text style={styles.caption} numberOfLines={3}>
            {post.caption}
          </Text>
        )}
      </View>

      <View style={styles.actions}>
        <LikeButton liked={post.liked_by_me} count={post.like_count} onPress={() => onToggleLike(post)} />
        <Pressable
          style={styles.commentRow}
          onPress={() => router.push(`/post/${post.id}`)}
          accessibilityRole="button"
          accessibilityLabel="View comments"
        >
          <Ionicons name="chatbubble-outline" size={20} color={styles.muted.color} />
          <Text style={styles.muted}>{post.comment_count}</Text>
        </Pressable>
      </View>
    </Card>
  );
}

const makeStyles = ({ colors, typography }: AppTheme) =>
  StyleSheet.create({
    card: { gap: 12, padding: 12 },
    header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    headerText: { flex: 1 },
    authorName: { ...typography.bodyStrong },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    muted: { ...typography.caption },
    meta: { gap: 6 },
    caption: { ...typography.body },
    actions: { flexDirection: 'row', alignItems: 'center', gap: 20 },
    commentRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  });
