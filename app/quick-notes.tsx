import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { HudScreen } from '../src/components/HudScreen';
import { HudTextInput } from '../src/components/HudTextInput';
import { useAppData } from '../src/store/AppDataContext';
import { colors } from '../src/theme/colors';
import { iconGlow, typography } from '../src/theme/typography';

export default function QuickNotes() {
  const router = useRouter();
  const { data, addQuickNote, updateQuickNote, deleteQuickNote } = useAppData();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (data.quickNotes.length === 0) {
      addQuickNote();
    }
  }, []);

  useEffect(() => {
    if (index >= data.quickNotes.length) {
      setIndex(Math.max(0, data.quickNotes.length - 1));
    }
  }, [data.quickNotes.length]);

  const note = data.quickNotes[index];

  function createNew() {
    addQuickNote();
    setIndex(0);
  }

  function remove() {
    if (!note) return;
    deleteQuickNote(note.id);
  }

  return (
    <HudScreen scroll={false}>
      <View style={styles.header}>
        <Pressable style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.glow} style={iconGlow} />
        </Pressable>
        <Text style={[typography.screenTitle, styles.title]}>QUICK NOTES</Text>
        <Pressable style={styles.iconButton} onPress={createNew}>
          <Ionicons name="document-outline" size={20} color={colors.glow} style={iconGlow} />
        </Pressable>
        <Pressable style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="close" size={22} color={colors.glow} style={iconGlow} />
        </Pressable>
      </View>

      {note && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <HudTextInput
              placeholder="Untitled Note"
              value={note.title}
              onChangeText={(t) => updateQuickNote(note.id, t, note.body)}
              style={styles.titleInput}
            />
            <Text style={styles.pageIndicator}>
              {index + 1}/{data.quickNotes.length}
            </Text>
          </View>
          <HudTextInput
            placeholder="Write your thoughts..."
            value={note.body}
            onChangeText={(t) => updateQuickNote(note.id, note.title, t)}
            multiline
            style={styles.bodyInput}
          />
        </View>
      )}

      <View style={styles.footer}>
        <Pressable onPress={remove} hitSlop={8}>
          <Ionicons name="trash-outline" size={22} color={colors.danger} />
        </Pressable>
        <View style={styles.pager}>
          <Pressable
            onPress={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
            hitSlop={8}
          >
            <Ionicons name="chevron-back" size={20} color={index === 0 ? colors.textMuted : colors.glow} />
          </Pressable>
          <View style={styles.dot} />
          <Pressable
            onPress={() => setIndex((i) => Math.min(data.quickNotes.length - 1, i + 1))}
            disabled={index >= data.quickNotes.length - 1}
            hitSlop={8}
          >
            <Ionicons
              name="chevron-forward"
              size={20}
              color={index >= data.quickNotes.length - 1 ? colors.textMuted : colors.glow}
            />
          </Pressable>
        </View>
      </View>
    </HudScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
  },
  card: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    marginTop: 12,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDim,
    paddingHorizontal: 12,
    paddingTop: 12,
    gap: 8,
  },
  titleInput: {
    flex: 1,
    borderWidth: 0,
    borderRadius: 0,
    paddingHorizontal: 0,
    fontStyle: 'italic',
    color: colors.glow,
  },
  pageIndicator: {
    fontFamily: typography.label.fontFamily,
    fontSize: 11,
    color: colors.glow,
  },
  bodyInput: {
    flex: 1,
    borderWidth: 0,
    borderRadius: 0,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
  },
  pager: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.glow,
  },
});
