import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../src/components/Button';
import { Screen } from '../../src/components/Screen';
import { TextField } from '../../src/components/TextField';
import { createPost, uploadPostPhoto } from '../../src/lib/posts';
import { useAuth } from '../../src/store/AuthContext';
import { ALL_CATEGORIES, CATEGORY_ICONS, CATEGORY_LABELS, PostCategory } from '../../src/store/types';
import { useThemedStyles } from '../../src/theme/useAppTheme';
import type { AppTheme } from '../../src/theme/useAppTheme';

function PhotoPicker({
  label,
  uri,
  onPick,
}: {
  label: string;
  uri: string | null;
  onPick: () => void;
}) {
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable style={styles.photoPicker} onPress={onPick} accessibilityRole="button" accessibilityLabel={label}>
      {uri ? (
        <Image source={{ uri }} style={styles.photoPreview} resizeMode="cover" />
      ) : (
        <View style={styles.photoPlaceholder}>
          <Ionicons name="camera-outline" size={26} color={styles.placeholderIcon.color} />
          <Text style={styles.placeholderLabel}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

export default function CreatePost() {
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { user } = useAuth();
  const [beforeUri, setBeforeUri] = useState<string | null>(null);
  const [afterUri, setAfterUri] = useState<string | null>(null);
  const [category, setCategory] = useState<PostCategory>('cleanup');
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const pickPhoto = async (slot: 'before' | 'after') => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Photo library access is needed to pick photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (result.canceled || !result.assets?.[0]) return;
    const uri = result.assets[0].uri;
    if (slot === 'before') setBeforeUri(uri);
    else setAfterUri(uri);
  };

  const reset = () => {
    setBeforeUri(null);
    setAfterUri(null);
    setCategory('cleanup');
    setCaption('');
    setLocation('');
  };

  const submit = async () => {
    if (!user) return;
    if (!beforeUri || !afterUri) {
      setError('Add both a before and an after photo.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const [beforeUrl, afterUrl] = await Promise.all([
        uploadPostPhoto(user.id, beforeUri, 'before'),
        uploadPostPhoto(user.id, afterUri, 'after'),
      ]);
      const postId = await createPost({
        authorId: user.id,
        category,
        caption,
        locationName: location,
        beforePhotoUrl: beforeUrl,
        afterPhotoUrl: afterUrl,
      });
      reset();
      router.replace(`/post/${postId}`);
    } catch (e: any) {
      setError(e.message ?? 'Could not share this post. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <Text style={styles.title}>Share good news</Text>
      <Text style={styles.subtitle}>Post a before-and-after of the climate action you took.</Text>

      <View style={styles.photoRow}>
        <PhotoPicker label="Before" uri={beforeUri} onPick={() => pickPhoto('before')} />
        <PhotoPicker label="After" uri={afterUri} onPick={() => pickPhoto('after')} />
      </View>

      <Text style={styles.label}>Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
        {ALL_CATEGORIES.map((c) => (
          <Pressable
            key={c}
            onPress={() => setCategory(c)}
            style={[styles.categoryChip, category === c && styles.categoryChipActive]}
          >
            <Ionicons
              name={CATEGORY_ICONS[c]}
              size={14}
              color={category === c ? styles.categoryChipActiveText.color : styles.categoryChipText.color}
            />
            <Text style={category === c ? styles.categoryChipActiveText : styles.categoryChipText}>
              {CATEGORY_LABELS[c]}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <TextField
        label="Caption"
        value={caption}
        onChangeText={setCaption}
        placeholder="What did you do?"
        multiline
        numberOfLines={3}
      />
      <TextField label="Location (optional)" value={location} onChangeText={setLocation} placeholder="e.g. Riverside Park" />

      {!!error && <Text style={styles.error}>{error}</Text>}

      <Button label="Post" onPress={submit} loading={submitting} />
    </Screen>
  );
}

const makeStyles = ({ colors, typography }: AppTheme) =>
  StyleSheet.create({
    title: { ...typography.screenTitle },
    subtitle: { ...typography.bodyMuted, marginTop: -8 },
    photoRow: { flexDirection: 'row', gap: 12 },
    photoPicker: { flex: 1, aspectRatio: 1, borderRadius: 14, overflow: 'hidden' },
    photoPreview: { width: '100%', height: '100%' },
    photoPlaceholder: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: colors.backgroundElevated,
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: 'dashed',
      borderRadius: 14,
    },
    placeholderIcon: { color: colors.textMuted },
    placeholderLabel: { ...typography.bodyMuted },
    label: { ...typography.label, marginTop: -4 },
    categoryRow: { gap: 8, paddingVertical: 2 },
    categoryChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: colors.backgroundElevated,
      borderWidth: 1,
      borderColor: colors.border,
    },
    categoryChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    categoryChipText: { ...typography.bodyMuted, fontSize: 13 },
    categoryChipActiveText: { ...typography.bodyMuted, fontSize: 13, color: colors.onPrimary },
    error: { ...typography.bodyMuted, color: colors.danger },
  });
