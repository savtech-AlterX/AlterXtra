import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Avatar } from '../../src/components/Avatar';
import { Button } from '../../src/components/Button';
import { Header } from '../../src/components/Header';
import { Screen } from '../../src/components/Screen';
import { TextField } from '../../src/components/TextField';
import { updateProfile, uploadAvatar } from '../../src/lib/profiles';
import { useAuth } from '../../src/store/AuthContext';
import { useThemedStyles } from '../../src/theme/useAppTheme';
import type { AppTheme } from '../../src/theme/useAppTheme';

export default function EditProfile() {
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickAvatar = async () => {
    if (!user) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Photo library access is needed to change your photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (result.canceled || !result.assets?.[0]) return;
    try {
      const url = await uploadAvatar(user.id, result.assets[0].uri);
      setAvatarUrl(url);
    } catch (e: any) {
      setError(e.message ?? 'Could not upload photo.');
    }
  };

  const save = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      await updateProfile(user.id, { display_name: displayName.trim() || null, bio: bio.trim() || null, avatar_url: avatarUrl });
      await refreshProfile();
      router.back();
    } catch (e: any) {
      setError(e.message ?? 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <Header title="Edit profile" />

      <Pressable onPress={pickAvatar} style={styles.avatarWrap} accessibilityRole="button" accessibilityLabel="Change photo">
        <Avatar url={avatarUrl} name={displayName || profile?.username} size={88} />
        <Text style={styles.changePhoto}>Change photo</Text>
      </Pressable>

      <TextField label="Name" value={displayName} onChangeText={setDisplayName} placeholder="Your name" />
      <TextField label="Bio" value={bio} onChangeText={setBio} placeholder="Tell people what you're working on" multiline numberOfLines={3} />

      {!!error && <Text style={styles.error}>{error}</Text>}

      <Button label="Save" onPress={save} loading={saving} />
    </Screen>
  );
}

const makeStyles = ({ colors, typography }: AppTheme) =>
  StyleSheet.create({
    avatarWrap: { alignItems: 'center', gap: 8 },
    changePhoto: { ...typography.label, color: colors.primaryStrong },
    error: { ...typography.bodyMuted, color: colors.danger },
  });
