import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { EmptyState } from './EmptyState';
import { GlowCard } from './GlowCard';
import { HudScreen } from './HudScreen';
import { StackHeader } from './StackHeader';
import { useAppData } from '../store/AppDataContext';
import { useAppTheme, useThemedStyles } from '../theme/useAppTheme';
import type { AppTheme } from '../theme/useAppTheme';

export function LogBookCategoryScreen({ aligned }: { aligned: boolean }) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const { data, deleteLogEntry } = useAppData();
  const entries = data.logEntries.filter((entry) => entry.aligned === aligned);

  return (
    <HudScreen scroll={false} style={styles.noPad}>
      <FlatList
        data={entries}
        keyExtractor={(entry) => entry.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={<StackHeader title={aligned ? 'ALIGNED' : 'MISALIGNED'} />}
        ListEmptyComponent={
          <EmptyState
            icon={aligned ? 'checkmark-circle-outline' : 'alert-circle-outline'}
            title={aligned ? 'NO ALIGNED ENTRIES' : 'NO MISALIGNED ENTRIES'}
            body={aligned ? 'Your aligned actions will appear here.' : 'Your misaligned actions and corrections will appear here.'}
          />
        }
        renderItem={({ item }) => (
          <Swipeable
            overshootRight={false}
            renderRightActions={() => (
              <Pressable style={styles.deleteAction} onPress={() => deleteLogEntry(item.id)} accessibilityRole="button" accessibilityLabel="Delete log entry">
                <Ionicons name="trash-outline" size={18} color="#ffffff" />
                <Text style={styles.deleteText}>DELETE</Text>
              </Pressable>
            )}
          >
            <GlowCard style={styles.entry}>
              <View style={styles.entryHeader}>
                <Text style={[styles.tag, { color: aligned ? colors.success : colors.glow }]}>{aligned ? 'ALIGNED' : 'MISALIGNED'}</Text>
                <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
              </View>
              <Text style={styles.proof}>{item.proof}</Text>
              {!aligned && !!item.correction && (
                <>
                  <Text style={styles.correctionLabel}>CORRECTION</Text>
                  <Text style={styles.proof}>{item.correction}</Text>
                </>
              )}
            </GlowCard>
          </Swipeable>
        )}
      />
    </HudScreen>
  );
}

const makeStyles = ({ colors, typography }: AppTheme) => StyleSheet.create({
  noPad: { padding: 0, gap: 0 },
  content: { padding: 20, paddingBottom: 40, gap: 12 },
  entry: { gap: 8 },
  entryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tag: { fontFamily: typography.label.fontFamily, fontSize: 11, letterSpacing: 1 },
  date: { fontFamily: typography.bodyMuted.fontFamily, color: colors.textMuted, fontSize: 11 },
  proof: { fontFamily: typography.body.fontFamily, color: colors.textPrimary, fontSize: 14, lineHeight: 20 },
  correctionLabel: { fontFamily: typography.label.fontFamily, color: colors.glow, fontSize: 10, letterSpacing: 1, marginTop: 4 },
  deleteAction: { width: 86, marginLeft: 8, borderRadius: 14, backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center', gap: 4 },
  deleteText: { fontFamily: typography.label.fontFamily, fontSize: 9, color: '#ffffff', letterSpacing: 1 },
});
