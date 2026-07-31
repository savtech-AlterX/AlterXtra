import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { GlowButton } from '../../src/components/GlowButton';
import { GlowCard } from '../../src/components/GlowCard';
import { HudScreen } from '../../src/components/HudScreen';
import { HudTextInput } from '../../src/components/HudTextInput';
import { StackHeader } from '../../src/components/StackHeader';
import { useAppData } from '../../src/store/AppDataContext';
import { colors } from '../../src/theme/colors';
import { glowShadow, iconGlow, typography } from '../../src/theme/typography';

export default function PhotoAlbums() {
  const router = useRouter();
  const { data, addAlbum } = useAppData();
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');

  function createAlbum() {
    const name = title.trim() || 'Identity Album';
    const album = addAlbum(name);
    setTitle('');
    setCreating(false);
    router.push({ pathname: '/photos/[id]', params: { id: album.id } });
  }

  return (
    <HudScreen>
      <StackHeader
        title="PHOTO ALBUM"
        right={<Ionicons name="add" size={22} color={colors.glow} style={iconGlow} onPress={() => setCreating(true)} />}
      />

      {data.albums.length === 0 && !creating && (
        <View style={styles.empty}>
          <Ionicons name="images-outline" size={56} color={colors.glow} style={iconGlow} />
          <Text style={styles.emptyText}>Create your first album to store photos & videos.</Text>
          <GlowButton
            label="CREATE ALBUM"
            icon={<Ionicons name="add" size={16} color="#02141f" />}
            onPress={() => setCreating(true)}
          />
        </View>
      )}

      {creating && (
        <GlowCard style={styles.createCard}>
          <Text style={typography.label}>ALBUM NAME</Text>
          <HudTextInput placeholder="e.g. World Champion" value={title} onChangeText={setTitle} />
          <GlowButton label="CREATE" onPress={createAlbum} />
          <GlowButton label="CANCEL" variant="outline" onPress={() => setCreating(false)} />
        </GlowCard>
      )}

      {data.albums.map((album) => (
        <Pressable
          key={album.id}
          onPress={() => router.push({ pathname: '/photos/[id]', params: { id: album.id } })}
        >
          <GlowCard style={styles.albumRow}>
            {album.photoUris[0] ? (
              <Image source={{ uri: album.photoUris[0] }} style={styles.thumb} />
            ) : (
              <View style={styles.thumbPlaceholder}>
                <Ionicons name="image" size={22} color={colors.glow} style={iconGlow} />
              </View>
            )}
            <View style={styles.albumInfo}>
              <Text style={styles.albumTitle}>{album.title}</Text>
              <Text style={styles.albumCount}>{album.photoUris.length} items</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.glow} style={iconGlow} />
          </GlowCard>
        </Pressable>
      ))}
    </HudScreen>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    gap: 16,
    marginTop: 60,
  },
  emptyText: {
    fontFamily: typography.bodyMuted.fontFamily,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 260,
  },
  createCard: {
    gap: 12,
  },
  albumRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: 10,
  },
  thumbPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  albumInfo: {
    flex: 1,
    gap: 2,
  },
  albumTitle: {
    fontFamily: typography.cardTitle.fontFamily,
    fontSize: 15,
    color: colors.textPrimary,
    ...glowShadow,
  },
  albumCount: {
    fontFamily: typography.bodyMuted.fontFamily,
    fontSize: 12,
    color: colors.textSecondary,
  },
});
