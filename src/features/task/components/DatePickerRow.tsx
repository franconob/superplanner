import { SymbolView } from 'expo-symbols';
import React, { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { AppColors } from '@/constants/theme';

// ─── Constants ────────────────────────────────────────────────────────────────

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS; // 220
const CALENDAR_HEIGHT = 324; // header(44) + labels(32) + 6 rows×40 + padding(8)
const WHEEL_PANEL_HEIGHT = 44 + WHEEL_HEIGHT; // header + picker = 264

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const MIN_YEAR = 2020;
const MAX_YEAR = 2035;
const YEARS = Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MIN_YEAR + i);

// Padded arrays: 2 empty slots at each end allow first/last items to reach center
const PADDED_MONTHS = ['', '', ...MONTHS, '', ''];
const PADDED_YEARS = ['', '', ...YEARS.map(String), '', ''];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildGrid(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const startOffset = (firstDay + 6) % 7; // 0=Mon, 6=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length < 42) cells.push(null); // always 6 rows
  return cells;
}

function formatDateLabel(date: Date): string {
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return 'today';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

type PickerState = 'collapsed' | 'calendar' | 'wheel';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface DatePickerRowProps {
  value: Date;
  enabled: boolean;
  onChange: (date: Date) => void;
  onToggle: (enabled: boolean) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DatePickerRow({ value, enabled, onChange, onToggle }: DatePickerRowProps) {
  const [pickerState, setPickerState] = useState<PickerState>('collapsed');
  const [viewMonth, setViewMonth] = useState(value.getMonth());
  const [viewYear, setViewYear] = useState(value.getFullYear());

  const expandedHeight = useSharedValue(0);
  const monthScrollRef = useRef<ScrollView>(null);
  const yearScrollRef = useRef<ScrollView>(null);

  const animatedExpandStyle = useAnimatedStyle(() => ({
    height: expandedHeight.get(),
    overflow: 'hidden',
  }));

  // ── Scroll helpers ──

  const scrollWheelToPositions = (monthIdx: number, yearVal: number) => {
    // With 2 padding items at start, item at originalIdx → scroll offset = originalIdx * ITEM_HEIGHT
    setTimeout(() => {
      monthScrollRef.current?.scrollTo({ y: monthIdx * ITEM_HEIGHT, animated: false });
      const yIdx = YEARS.indexOf(yearVal);
      yearScrollRef.current?.scrollTo({ y: Math.max(0, yIdx) * ITEM_HEIGHT, animated: false });
    }, 40);
  };

  // ── Open/close transitions ──

  const openCalendar = () => {
    if (!enabled) return;
    setPickerState('calendar');
    expandedHeight.set(withTiming(CALENDAR_HEIGHT, { duration: 280 }));
  };

  const calendarToWheel = () => {
    setPickerState('wheel');
    expandedHeight.set(withTiming(WHEEL_PANEL_HEIGHT, { duration: 200 }));
    scrollWheelToPositions(viewMonth, viewYear);
  };

  const wheelToCalendar = () => {
    setPickerState('calendar');
    expandedHeight.set(withTiming(CALENDAR_HEIGHT, { duration: 200 }));
  };

  const collapse = () => {
    setPickerState('collapsed');
    expandedHeight.set(withTiming(0, { duration: 220 }));
  };

  const handleToggle = (v: boolean) => {
    onToggle(v);
    if (!v) collapse();
  };

  // ── Calendar interactions ──

  const handleDayPress = (day: number) => {
    onChange(new Date(viewYear, viewMonth, day));
    collapse();
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  // ── Wheel scroll ends ──

  const handleMonthScrollEnd = (e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(11, idx));
    setViewMonth(clamped);
    monthScrollRef.current?.scrollTo({ y: clamped * ITEM_HEIGHT, animated: true });
  };

  const handleYearScrollEnd = (e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(YEARS.length - 1, idx));
    setViewYear(YEARS[clamped]);
    yearScrollRef.current?.scrollTo({ y: clamped * ITEM_HEIGHT, animated: true });
  };

  // ── Computed ──

  const cells = buildGrid(viewYear, viewMonth);
  const today = new Date();

  const isSelected = (day: number) =>
    value.getDate() === day && value.getMonth() === viewMonth && value.getFullYear() === viewYear;

  const isToday = (day: number) =>
    today.getDate() === day && today.getMonth() === viewMonth && today.getFullYear() === viewYear;

  const wheelItemOpacity = (paddedIdx: number, selectedPaddedIdx: number) => {
    const dist = Math.abs(paddedIdx - selectedPaddedIdx);
    if (dist === 0) return 1;
    if (dist === 1) return 0.55;
    return 0.25;
  };

  const selectedMonthPaddedIdx = viewMonth + 2; // +2 because 2 padding slots at start
  const selectedYearPaddedIdx = YEARS.indexOf(viewYear) + 2;

  return (
    <View>
      {/* ── Collapsed Row ── */}
      <Pressable
        style={styles.row}
        onPress={pickerState === 'collapsed' ? openCalendar : collapse}
        disabled={!enabled && pickerState === 'collapsed'}
      >
        <View style={[styles.iconContainer, { backgroundColor: AppColors.iconRed }]}>
          <SymbolView name="calendar" size={17} tintColor="#FFFFFF" />
        </View>
        <View style={styles.labelWrap}>
          <Text style={styles.label}>Date</Text>
          {enabled && (
            <Text style={styles.dateSubtitle}>{formatDateLabel(value)}</Text>
          )}
        </View>
        <Switch
          value={enabled}
          onValueChange={handleToggle}
          trackColor={{ false: AppColors.toggleTrack, true: AppColors.accent }}
          thumbColor="#FFFFFF"
        />
      </Pressable>

      {/* ── Expanded Panel ── */}
      <Animated.View style={animatedExpandStyle}>
        {/* Calendar grid */}
        {pickerState === 'calendar' && (
          <View style={styles.calendarPanel}>
            {/* Header */}
            <View style={styles.calendarHeader}>
              <Pressable onPress={calendarToWheel} style={styles.monthYearBtn}>
                <Text style={styles.monthYearText}>
                  {MONTHS[viewMonth]} {viewYear}
                </Text>
                <Text style={styles.chevronBlue}> ›</Text>
              </Pressable>
              <View style={styles.navArrows}>
                <Pressable onPress={prevMonth} style={styles.arrowBtn}>
                  <SymbolView name="chevron.left" size={15} tintColor={AppColors.accent} />
                </Pressable>
                <Pressable onPress={nextMonth} style={styles.arrowBtn}>
                  <SymbolView name="chevron.right" size={15} tintColor={AppColors.accent} />
                </Pressable>
              </View>
            </View>

            {/* Day-of-week labels */}
            <View style={styles.dayLabelsRow}>
              {DAY_LABELS.map(d => (
                <Text key={d} style={styles.dayLabel}>{d}</Text>
              ))}
            </View>

            {/* Grid */}
            <View style={styles.grid}>
              {cells.map((day, idx) => {
                const sel = day !== null && isSelected(day);
                const tod = day !== null && isToday(day);
                return (
                  <Pressable
                    key={idx}
                    style={[styles.dayCell, sel && styles.dayCellSelected]}
                    onPress={() => day !== null && handleDayPress(day)}
                    disabled={day === null}
                  >
                    <Text style={[
                      styles.dayText,
                      sel && styles.dayTextSelected,
                      tod && !sel && styles.dayTextToday,
                      day === null && styles.dayTextEmpty,
                    ]}>
                      {day ?? ''}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* Wheel picker */}
        {pickerState === 'wheel' && (
          <View style={styles.wheelPanel}>
            {/* Wheel header — tap to go back to calendar */}
            <Pressable onPress={wheelToCalendar} style={styles.wheelHeader}>
              <Text style={styles.wheelHeaderText}>
                {MONTHS[viewMonth]} {viewYear}
              </Text>
              <Text style={styles.wheelChevron}> ↓</Text>
            </Pressable>

            {/* Two columns */}
            <View style={styles.wheelRow}>
              {/* Selection highlight (overlay) */}
              <View pointerEvents="none" style={styles.selectionHighlight} />

              {/* Month wheel */}
              <ScrollView
                ref={monthScrollRef}
                style={styles.wheelScroll}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                showsVerticalScrollIndicator={false}
                onMomentumScrollEnd={handleMonthScrollEnd}
                scrollEventThrottle={16}
              >
                {PADDED_MONTHS.map((month, idx) => (
                  <View key={`m-${idx}`} style={styles.wheelItem}>
                    <Text style={[
                      styles.wheelItemText,
                      { opacity: wheelItemOpacity(idx, selectedMonthPaddedIdx) },
                      idx === selectedMonthPaddedIdx && styles.wheelItemSelected,
                    ]}>
                      {month}
                    </Text>
                  </View>
                ))}
              </ScrollView>

              {/* Year wheel */}
              <ScrollView
                ref={yearScrollRef}
                style={styles.wheelScroll}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                showsVerticalScrollIndicator={false}
                onMomentumScrollEnd={handleYearScrollEnd}
                scrollEventThrottle={16}
              >
                {PADDED_YEARS.map((year, idx) => (
                  <View key={`y-${idx}`} style={styles.wheelItem}>
                    <Text style={[
                      styles.wheelItemText,
                      { opacity: wheelItemOpacity(idx, selectedYearPaddedIdx) },
                      idx === selectedYearPaddedIdx && styles.wheelItemSelected,
                    ]}>
                      {year}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const CELL_SIZE = 40;

const styles = StyleSheet.create({
  // Collapsed row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 52,
    gap: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelWrap: { flex: 1, gap: 2 },
  label: { color: AppColors.textPrimary, fontSize: 15 },
  dateSubtitle: { color: AppColors.accent, fontSize: 12 },

  // Calendar panel
  calendarPanel: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
  },
  monthYearBtn: { flexDirection: 'row', alignItems: 'center' },
  monthYearText: { color: AppColors.textPrimary, fontSize: 15, fontWeight: '600' },
  chevronBlue: { color: AppColors.accent, fontSize: 18, fontWeight: '700' },
  navArrows: { flexDirection: 'row', gap: 4 },
  arrowBtn: { padding: 8 },

  // Day labels
  dayLabelsRow: { flexDirection: 'row', marginBottom: 4 },
  dayLabel: {
    flex: 1,
    textAlign: 'center',
    color: AppColors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
    height: 28,
    lineHeight: 28,
  },

  // Grid
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: {
    width: `${100 / 7}%`,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: CELL_SIZE / 2,
  },
  dayCellSelected: { backgroundColor: AppColors.accent },
  dayText: { color: AppColors.textPrimary, fontSize: 15 },
  dayTextSelected: { color: '#FFFFFF', fontWeight: '700' },
  dayTextToday: { color: AppColors.accent, fontWeight: '600' },
  dayTextEmpty: { color: 'transparent' },

  // Wheel panel
  wheelPanel: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  wheelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
  },
  wheelHeaderText: { color: AppColors.accent, fontSize: 15, fontWeight: '600' },
  wheelChevron: { color: AppColors.accent, fontSize: 16 },
  wheelRow: {
    flexDirection: 'row',
    height: WHEEL_HEIGHT,
    position: 'relative',
  },
  selectionHighlight: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: ITEM_HEIGHT * 2,
    height: ITEM_HEIGHT,
    backgroundColor: AppColors.surfaceElevated,
    borderRadius: 10,
    zIndex: 0,
  },
  wheelScroll: { flex: 1 },
  wheelItem: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelItemText: {
    color: AppColors.textPrimary,
    fontSize: 15,
  },
  wheelItemSelected: {
    fontWeight: '700',
    fontSize: 16,
  },
});
