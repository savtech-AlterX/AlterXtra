import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { FlatList, Image, StyleSheet, Text } from 'react-native';
import { EmptyState } from '../../src/components/EmptyState';
import { HudScreen } from '../../src/components/HudScreen';
import { StackHeader } from '../../src/components/StackHeader';
import { explainPermissionDenied } from '../../src/lib/permissionAlert';
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
    if (!permission.granted) {
      explainPermissionDenied('photo library');
      return;
    }

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
    <HudScreen scroll={false}>
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

      {/* A virtualized grid, not every photo mounted into one View — an
          album with hundreds of full-res images stayed smooth this way
          instead of ballooning memory and lagging the scroll. */}
      <FlatList
        style={styles.flatList}
        data={album.photoUris}
        keyExtractor={(uri, i) => `${i}-${uri}`}
        numColumns={3}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.gridContent}
        renderItem={({ item }) => <Image source={{ uri: item }} style={styles.gridImage} />}
        ListEmptyComponent={
          <EmptyState
            icon="images-outline"
            title="NO PHOTOS IN THIS ALBUM"
            body="Add photos from your library and they stay on this device — nothing is uploaded anywhere."
            actionLabel="ADD PHOTOS"
            onAction={pickImages}
          />
        }
      />
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
  flatList: {
    flex: 1,
  },
  gridContent: {
    gap: 8,
  },
  gridRow: {
    gap: 8,
  },
  gridImage: {
    width: '31.5%',
    aspectRatio: 1,
    borderRadius: 10,
  },
});
