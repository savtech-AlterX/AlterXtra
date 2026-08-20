import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CloseToHome } from '../src/components/CloseToHome';
import { EmptyState } from '../src/components/EmptyState';
import { GlowCard } from '../src/components/GlowCard';
import { HudScreen } from '../src/components/HudScreen';
import { useAppData } from '../src/store/AppDataContext';
import { useAppTheme, useThemedStyles } from '../src/theme/useAppTheme';
import type { AppTheme } from '../src/theme/useAppTheme';

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

function pad(n: number) {
  return String(n).padStart(2, '0');
}

// Local calendar-day key, not UTC — an entry logged at 11pm shouldn't jump to
// the next day just because toISOString() reads in UTC.
function localDateKey(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Journal dates and goal target dates are already plain "YYYY-MM-DD" strings
// a user typed or a date picker produced — used directly rather than
// round-tripped through `new Date()`, which reinterprets them as UTC
// midnight and can shift the day in negative-UTC-offset timezones.
function dateKeyFrom(raw: string, fallbackIso: string) {
  if (DATE_KEY_RE.test(raw)) return raw;
  return localDateKey(new Date(fallbackIso));
}

type DayItem = {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  label: string;
};

export default function Calendar() {
  const { colors, typography, iconGlow } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const { data } = useAppData();

  const todayKey = localDateKey(new Date());
  const [cursor, setCursor] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });
  const [selectedKey, setSelectedKey] = useState(todayKey);

  const itemsByDay = useMemo(() => {
    const map = new Map<string, DayItem[]>();
    const push = (key: string, item: DayItem) => {
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    };

    data.journalEntries.forEach((e) => {
      push(dateKeyFrom(e.date, e.createdAt), {
        key: `journal-${e.id}`,
        icon: 'book',
        color: colors.glow,
        label: e.title?.trim() || 'Diary entry',
      });
    });
    data.logEntries.forEach((e) => {
      push(localDateKey(new Date(e.createdAt)), {
        key: `log-${e.id}`,
        icon: 'clipboard',
        color: e.aligned ? colors.success : colors.danger,
        label: e.aligned ? 'Aligned' : 'Misaligned',
      });
    });
    data.habitCheckIns.forEach((c) => {
      push(localDateKey(new Date(c.createdAt)), {
        key: `habit-${c.id}`,
        icon: 'repeat',
        color: c.followedThrough ? colors.success : colors.danger,
        label: c.followedThrough ? 'Habit followed through' : 'Habit missed',
      });
    });
    data.goals.forEach((g) => {
      push(dateKeyFrom(g.targetDate, g.createdAt), {
        key: `goal-${g.id}`,
        icon: 'flag',
        color: colors.accentTeal,
        label: `Due: ${g.objective}`,
      });
    });

    return map;
  }, [data, colors]);

  const grid = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const startWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: { key: string; day: number | null }[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push({ key: `lead-${i}`, day: null });
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ key: `${year}-${pad(month + 1)}-${pad(d)}`, day: d });
    }
    while (cells.length % 7 !== 0) cells.push({ key: `trail-${cells.length}`, day: null });
    return cells;
  }, [cursor]);

  const monthLabel = cursor
    .toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    .toUpperCase();
  const selectedItems = itemsByDay.get(selectedKey) ?? [];
  const selectedLabel = useMemo(() => {
    const [y, m, d] = selectedKey.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }, [selectedKey]);

  function changeMonth(delta: number) {
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));
  }

  return (
    <HudScreen>
      <View style={styles.titleRow}>
        <CloseToHome />
        <Text style={typography.screenTitle}>CALENDAR</Text>
      </View>

      <GlowCard style={styles.monthCard}>
        <View style={styles.monthNav}>
          <Pressable
            onPress={() => changeMonth(-1)}
            accessibilityRole="button"
            accessibilityLabel="Previous month"
            style={styles.navButton}
          >
            <Ionicons name="chevron-back" size={18} color={colors.glow} style={iconGlow} />
          </Pressable>
          <Text style={styles.monthLabel}>{monthLabel}</Text>
          <Pressable
            onPress={() => changeMonth(1)}
            accessibilityRole="button"
            accessibilityLabel="Next month"
            style={styles.navButton}
          >
            <Ionicons name="chevron-forward" size={18} color={colors.glow} style={iconGlow} />
          </Pressable>
        </View>

        <View style={styles.weekdayRow}>
          {WEEKDAY_LABELS.map((label, i) => (
            <Text key={i} style={styles.weekdayLabel}>
              {label}
            </Text>
          ))}
        </View>

        <View style={styles.grid}>
          {grid.map((cell) => {
            if (cell.day === null) return <View key={cell.key} style={styles.dayCell} />;
            const isToday = cell.key === todayKey;
            const isSelected = cell.key === selectedKey;
            const hasActivity = (itemsByDay.get(cell.key)?.length ?? 0) > 0;
            return (
              <Pressable
                key={cell.key}
                style={[
                  styles.dayCell,
                  styles.dayTouchable,
                  isToday && !isSelected && styles.dayCellToday,
                  isSelected && styles.dayCellSelected,
                ]}
                onPress={() => setSelectedKey(cell.key)}
                accessibilityRole="button"
                accessibilityLabel={`${cell.key}${hasActivity ? ', has activity' : ''}`}
                accessibilityState={{ selected: isSelected }}
              >
                <Text style={[styles.dayNumber, isSelected && styles.dayNumberSelected]}>
                  {cell.day}
                </Text>
                <View style={[styles.dayDot, { opacity: hasActivity ? 1 : 0 }]} />
              </Pressable>
            );
          })}
        </View>
      </GlowCard>

      <Text style={typography.label}>{selectedLabel.toUpperCase()}</Text>
      {selectedItems.length === 0 ? (
        <EmptyState
          icon="calendar-outline"
          title="NOTHING RECORDED"
          body="Diary entries, habit check-ins, log entries, and goal due dates for this day show up here."
          compact
        />
      ) : (
        <View style={styles.itemsList}>
          {selectedItems.map((item) => (
            <GlowCard key={item.key} style={styles.itemRow}>
              <Ionicons name={item.icon} size={18} color={item.color} style={iconGlow} />
              <Text style={styles.itemLabel} numberOfLines={2}>
                {item.label}
              </Text>
            </GlowCard>
          ))}
        </View>
      )}
    </HudScreen>
  );
}

const CELL_WIDTH = `${100 / 7}%` as const;

const makeStyles = ({ colors, typography, glowShadow, iconGlow }: AppTheme) =>
  StyleSheet.create({
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    monthCard: {
      gap: 14,
    },
    monthNav: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    navButton: {
      width: 36,
      height: 36,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    monthLabel: {
      fontFamily: typography.cardTitle.fontFamily,
      fontSize: 15,
      letterSpacing: 1,
      color: colors.textPrimary,
      ...glowShadow,
    },
    weekdayRow: {
      flexDirection: 'row',
    },
    weekdayLabel: {
      width: CELL_WIDTH,
      textAlign: 'center',
      fontFamily: typography.label.fontFamily,
      fontSize: 11,
      color: colors.textMuted,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    dayCell: {
      width: CELL_WIDTH,
      aspectRatio: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dayTouchable: {
      borderRadius: 10,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    dayCellToday: {
      borderColor: colors.borderDim,
    },
    dayCellSelected: {
      backgroundColor: colors.panelSolid,
      borderColor: colors.glowStrong,
    },
    dayNumber: {
      fontFamily: typography.body.fontFamily,
      fontSize: 14,
      color: colors.textPrimary,
    },
    dayNumberSelected: {
      color: colors.glowStrong,
      ...glowShadow,
    },
    dayDot: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
      backgroundColor: colors.glow,
      marginTop: 3,
    },
    itemsList: {
      gap: 10,
    },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    itemLabel: {
      flex: 1,
      fontFamily: typography.body.fontFamily,
      fontSize: 14,
      color: colors.textPrimary,
    },
  });
