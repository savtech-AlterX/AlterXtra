import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { HudScreen } from '../../src/components/HudScreen';
import { StackHeader } from '../../src/components/StackHeader';
import { useAppData } from '../../src/store/AppDataContext';
import { useAppTheme, useThemedStyles } from '../../src/theme/useAppTheme';
import type { AppTheme } from '../../src/theme/useAppTheme';

export default function AlbumDetail() {
  const { colors, iconGlow } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, addPhotosToAlbum } = useAppData();
  const album = data.albums.find((a) => a.id === id);

  async function pickImages() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && album) {
      addPhotosToAlbum(album.id, result.assets.map((a) => a.uri));
    }
  }

  if (!album) {
    return (
      <HudScreen>
        <StackHeader title="ALBUM" />
        <Text style={styles.empty}>This album no longer exists.</Text>
      </HudScreen>
    );
  }

  return (
    <HudScreen>
      <StackHeader
        title={album.title.toUpperCase()}
        right={
          <Ionicons
            name="add"
            size={22}
            color={colors.glow}
            style={iconGlow}
            onPress={pickImages}
            accessibilityRole="button"
            accessibilityLabel="Add photos"
          />
        }
      />

      {album.photoUris.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="images-outline" size={48} color={colors.glow} style={iconGlow} />
          <Text style={styles.emptyText}>No photos yet. Tap + to add from your library.</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {album.photoUris.map((uri, i) => (
            <Image key={i} source={{ uri }} style={styles.gridImage} />
          ))}
        </View>
      )}
    </HudScreen>
  );
}

const makeStyles = ({ colors, typography, glowShadow, iconGlow }: AppTheme) =>
  StyleSheet.create({
  empty: {
    alignItems: 'center',
    gap: 12,
    marginTop: 60,
  },
  emptyText: {
    fontFamily: typography.bodyMuted.fontFamily,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 260,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridImage: {
    width: '31.5%',
    aspectRatio: 1,
    borderRadius: 10,
  },
});
