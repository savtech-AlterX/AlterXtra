import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
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

  // Today's cell reads as a live sensor, not a static marker — a slow
  // breathing ring rather than a fixed border.
  const pulse = useRef(new Animated.Value(0.35)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        Animated.timing(pulse, { toValue: 0.35, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

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

      <View style={styles.monthCardWrap}>
        <GlowCard style={styles.monthCard}>
          <LinearGradient
            colors={['transparent', colors.glowStrong, 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.accentLine}
          />
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
                  style={[styles.dayCell, styles.dayTouchable, isSelected && styles.dayCellSelected]}
                  onPress={() => setSelectedKey(cell.key)}
                  accessibilityRole="button"
                  accessibilityLabel={`${cell.key}${hasActivity ? ', has activity' : ''}`}
                  accessibilityState={{ selected: isSelected }}
                >
                  {isToday && !isSelected && (
                    <Animated.View pointerEvents="none" style={[styles.todayRing, { opacity: pulse }]} />
                  )}
                  {isSelected && (
                    <>
                      <View pointerEvents="none" style={[styles.reticleTick, styles.reticleTL]} />
                      <View pointerEvents="none" style={[styles.reticleTick, styles.reticleBR]} />
                    </>
                  )}
                  <Text style={[styles.dayNumber, (isSelected || isToday) && styles.dayNumberActive]}>
                    {cell.day}
                  </Text>
                  <View style={[styles.dayDot, { opacity: hasActivity ? 1 : 0 }]} />
                </Pressable>
              );
            })}
          </View>
        </GlowCard>
        <View pointerEvents="none" style={[styles.cornerBracket, styles.cornerTL]} />
        <View pointerEvents="none" style={[styles.cornerBracket, styles.cornerTR]} />
        <View pointerEvents="none" style={[styles.cornerBracket, styles.cornerBL]} />
        <View pointerEvents="none" style={[styles.cornerBracket, styles.cornerBR]} />
      </View>

      <View style={styles.selectedHeader}>
        <View style={styles.selectedHeaderBar} />
        <Text style={typography.label}>{selectedLabel.toUpperCase()}</Text>
      </View>
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
    monthCardWrap: {
      position: 'relative',
    },
    monthCard: {
      gap: 14,
      overflow: 'hidden',
    },
    accentLine: {
      position: 'absolute',
      top: 0,
      left: '18%',
      right: '18%',
      height: 2,
    },
    cornerBracket: {
      position: 'absolute',
      width: 16,
      height: 16,
      borderColor: colors.glowStrong,
    },
    cornerTL: { top: -1, left: -1, borderTopWidth: 2, borderLeftWidth: 2, borderTopLeftRadius: 4 },
    cornerTR: { top: -1, right: -1, borderTopWidth: 2, borderRightWidth: 2, borderTopRightRadius: 4 },
    cornerBL: { bottom: -1, left: -1, borderBottomWidth: 2, borderLeftWidth: 2, borderBottomLeftRadius: 4 },
    cornerBR: { bottom: -1, right: -1, borderBottomWidth: 2, borderRightWidth: 2, borderBottomRightRadius: 4 },
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
      paddingBottom: 8,
      marginBottom: 4,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderDim,
    },
    weekdayLabel: {
      width: CELL_WIDTH,
      textAlign: 'center',
      fontFamily: typography.label.fontFamily,
      fontSize: 11,
      letterSpacing: 1,
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
      position: 'relative',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    dayCellSelected: {
      backgroundColor: colors.panelSolid,
      borderColor: colors.glowStrong,
    },
    todayRing: {
      position: 'absolute',
      top: 2,
      left: 2,
      right: 2,
      bottom: 2,
      borderRadius: 8,
      borderWidth: 1.5,
      borderColor: colors.glow,
    },
    reticleTick: {
      position: 'absolute',
      width: 8,
      height: 8,
      borderColor: colors.glowStrong,
    },
    reticleTL: { top: 2, left: 2, borderTopWidth: 1.5, borderLeftWidth: 1.5 },
    reticleBR: { bottom: 2, right: 2, borderBottomWidth: 1.5, borderRightWidth: 1.5 },
    dayNumber: {
      fontFamily: typography.label.fontFamily,
      fontSize: 15,
      letterSpacing: 0.5,
      color: colors.textPrimary,
    },
    dayNumberActive: {
      color: colors.glowStrong,
      ...glowShadow,
    },
    dayDot: {
      width: 5,
      height: 5,
      backgroundColor: colors.glow,
      marginTop: 3,
      transform: [{ rotate: '45deg' }],
    },
    selectedHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    selectedHeaderBar: {
      width: 3,
      height: 14,
      borderRadius: 2,
      backgroundColor: colors.glow,
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
