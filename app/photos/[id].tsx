import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
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
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
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
        renderItem={({ item, index }) => (
          <Pressable onPress={() => setSelectedIndex(index)} accessibilityRole="button" accessibilityLabel={`Open photo ${index + 1}`}>
            <Image source={{ uri: item }} style={styles.gridImage} accessibilityLabel={`Photo ${index + 1}`} />
          </Pressable>
        )}
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
      <Modal visible={selectedIndex !== null} transparent animationType="fade" onRequestClose={() => setSelectedIndex(null)}>
        <View style={styles.viewer}>
          <Pressable style={styles.viewerClose} onPress={() => setSelectedIndex(null)} accessibilityRole="button" accessibilityLabel="Close photo">
            <Ionicons name="close" size={28} color="#ffffff" />
          </Pressable>
          {selectedIndex !== null && album.photoUris[selectedIndex] && (
            <Image source={{ uri: album.photoUris[selectedIndex] }} style={styles.fullImage} resizeMode="contain" />
          )}
          <View style={styles.viewerControls}>
            <Pressable onPress={() => setSelectedIndex((i) => i === null ? null : Math.max(0, i - 1))} disabled={selectedIndex === 0} accessibilityRole="button" accessibilityLabel="Previous photo" style={styles.viewerButton}>
              <Ionicons name="chevron-back" size={26} color="#ffffff" />
            </Pressable>
            <Text style={styles.viewerCount}>{selectedIndex === null ? '' : `${selectedIndex + 1} / ${album.photoUris.length}`}</Text>
            <Pressable onPress={() => setSelectedIndex((i) => i === null ? null : Math.min(album.photoUris.length - 1, i + 1))} disabled={selectedIndex === album.photoUris.length - 1} accessibilityRole="button" accessibilityLabel="Next photo" style={styles.viewerButton}>
              <Ionicons name="chevron-forward" size={26} color="#ffffff" />
            </Pressable>
          </View>
        </View>
      </Modal>
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
  viewer: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerClose: {
    position: 'absolute',
    top: 54,
    right: 22,
    zIndex: 2,
    padding: 8,
  },
  fullImage: {
    width: '100%',
    height: '78%',
  },
  viewerControls: {
    width: '80%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  viewerButton: {
    padding: 10,
  },
  viewerCount: {
    color: '#ffffff',
    fontSize: 13,
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
