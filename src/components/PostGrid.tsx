import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Post } from '../store/types';

const GAP = 3;
const COLUMNS = 3;

export function PostGrid({ posts }: { posts: Post[] }) {
  const router = useRouter();
  return (
    <View style={styles.grid}>
      {posts.map((post) => (
        <Pressable
          key={post.id}
          style={styles.tile}
          onPress={() => router.push(`/post/${post.id}`)}
          accessibilityRole="button"
          accessibilityLabel="View post"
        >
          <Image source={{ uri: post.after_photo_url }} style={styles.image} resizeMode="cover" />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  tile: {
    width: `${100 / COLUMNS - 1}%`,
    aspectRatio: 1,
    borderRadius: 6,
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
});
