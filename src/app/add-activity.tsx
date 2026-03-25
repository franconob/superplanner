import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import React, { useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AppColors } from '@/constants/theme';
import { useActivityDatabase } from '@/features/activity/hooks/useActivityDatabase';

// ─── Constants ────────────────────────────────────────────────────────────────

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 7;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS; // 308
const PAD = Math.floor(VISIBLE_ITEMS / 2); // 3
const SELECTION_HIGHLIGHT_COLOR = 'rgba(255, 255, 255, 0.07)';
const PICKER_ANIM_DURATION = 240;

// ─── Wheel data ───────────────────────────────────────────────────────────────

const HOURS_24 = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MINUTES_5 = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));
const DUR_HOURS = Array.from({ length: 24 }, (_, i) => String(i));
const DUR_MINS = Array.from({ length: 12 }, (_, i) => String(i * 5));

function padded(items: string[]): string[] {
  const pad = Array(PAD).fill('');
  return [...pad, ...items, ...pad];
}

const PADDED_HOURS = padded(HOURS_24);
const PADDED_MINUTES = padded(MINUTES_5);
const PADDED_DUR_HOURS = padded(DUR_HOURS);
const PADDED_DUR_MINS = padded(DUR_MINS);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function itemOpacity(paddedIdx: number, selectedPaddedIdx: number): number {
  const dist = Math.abs(paddedIdx - selectedPaddedIdx);
  if (dist === 0) return 1;
  if (dist === 1) return 0.55;
  if (dist === 2) return 0.25;
  return 0.1;
}

function formatDateChip(date: Date): string {
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTimeChip(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatDuration(hours: number, mins: number): string {
  if (hours === 0) return `${mins} minutes`;
  if (mins === 0) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  return `${hours}h ${mins}m`;
}

// ─── WheelColumn ──────────────────────────────────────────────────────────────

interface WheelColumnProps {
  paddedItems: string[];
  selectedIdx: number; // index into original (non-padded) array
  onScrollEnd: (originalIdx: number) => void;
  flex?: number;
}

function WheelColumn({ paddedItems, selectedIdx, onScrollEnd, flex = 1 }: WheelColumnProps) {
  const scrollRef = useRef<ScrollView>(null);
  const selectedPaddedIdx = selectedIdx + PAD;

  // Scroll to initial position after mount
  React.useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: selectedIdx * ITEM_HEIGHT, animated: false });
    }, 40);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScrollEnd = (e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    const originalCount = paddedItems.length - PAD * 2;
    const idx = Math.round(y / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(originalCount - 1, idx));
    scrollRef.current?.scrollTo({ y: clamped * ITEM_HEIGHT, animated: true });
    onScrollEnd(clamped);
  };

  return (
    <ScrollView
      ref={scrollRef}
      style={{ flex }}
      showsVerticalScrollIndicator={false}
      snapToInterval={ITEM_HEIGHT}
      decelerationRate="fast"
      onMomentumScrollEnd={handleScrollEnd}
      onScrollEndDrag={handleScrollEnd}
      scrollEventThrottle={16}
    >
      {paddedItems.map((item, idx) => (
        <View key={idx} style={styles.wheelItem}>
          <Text
            style={[
              styles.wheelText,
              { opacity: itemOpacity(idx, selectedPaddedIdx) },
              idx === selectedPaddedIdx && styles.wheelTextSelected,
            ]}
          >
            {item}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

// ─── InlineTimePicker ─────────────────────────────────────────────────────────

interface InlineTimePickerProps {
  date: Date;
  onChange: (date: Date) => void;
}

function InlineTimePicker({ date, onChange }: InlineTimePickerProps) {
  const hourIdx = date.getHours();
  const minIdx = Math.round(date.getMinutes() / 5) % 12;

  const setHour = (idx: number) => {
    const d = new Date(date);
    d.setHours(idx);
    onChange(d);
  };

  const setMin = (idx: number) => {
    const d = new Date(date);
    d.setMinutes(idx * 5, 0, 0);
    onChange(d);
  };

  return (
    <View style={styles.pickerArea}>
      {/* Selection highlight */}
      <View style={styles.selectionHighlight} pointerEvents="none" />
      <WheelColumn paddedItems={PADDED_HOURS} selectedIdx={hourIdx} onScrollEnd={setHour} />
      <WheelColumn paddedItems={PADDED_MINUTES} selectedIdx={minIdx} onScrollEnd={setMin} />
    </View>
  );
}

// ─── InlineDurationPicker ─────────────────────────────────────────────────────

interface InlineDurationPickerProps {
  durationHourIdx: number; // 0-23
  durationMinIdx: number;  // 0-11 (each = 5 min)
  onHourChange: (idx: number) => void;
  onMinChange: (idx: number) => void;
}

function InlineDurationPicker({
  durationHourIdx,
  durationMinIdx,
  onHourChange,
  onMinChange,
}: InlineDurationPickerProps) {
  return (
    <View style={styles.pickerArea}>
      {/* Selection highlight */}
      <View style={styles.selectionHighlight} pointerEvents="none" />
      <WheelColumn paddedItems={PADDED_DUR_HOURS} selectedIdx={durationHourIdx} onScrollEnd={onHourChange} flex={2} />
      <View style={styles.durationLabel}>
        <Text style={styles.durationLabelText}>hours</Text>
      </View>
      <WheelColumn paddedItems={PADDED_DUR_MINS} selectedIdx={durationMinIdx} onScrollEnd={onMinChange} flex={2} />
      <View style={styles.durationLabel}>
        <Text style={styles.durationLabelText}>minutes</Text>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

type ExpandedPicker = 'start-time' | 'end-time' | 'duration' | null;

export default function AddActivityScreen() {
  const { insertActivity } = useActivityDatabase();

  const now = new Date();
  const defaultEnd = new Date(now.getTime() + 30 * 60 * 1000);

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [startDate, setStartDate] = useState(now);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [expandedPicker, setExpandedPicker] = useState<ExpandedPicker>(null);

  // Animated heights for each picker
  const startTimeH = useSharedValue(0);
  const endTimeH = useSharedValue(0);
  const durationH = useSharedValue(0);

  const startTimeStyle = useAnimatedStyle(() => ({ height: startTimeH.get(), overflow: 'hidden' }));
  const endTimeStyle = useAnimatedStyle(() => ({ height: endTimeH.get(), overflow: 'hidden' }));
  const durationStyle = useAnimatedStyle(() => ({ height: durationH.get(), overflow: 'hidden' }));

  const togglePicker = (picker: ExpandedPicker) => {
    const next = expandedPicker === picker ? null : picker;
    setExpandedPicker(next);

    startTimeH.set(withTiming(next === 'start-time' ? WHEEL_HEIGHT : 0, { duration: PICKER_ANIM_DURATION }));
    endTimeH.set(withTiming(next === 'end-time' ? WHEEL_HEIGHT : 0, { duration: PICKER_ANIM_DURATION }));
    durationH.set(withTiming(next === 'duration' ? WHEEL_HEIGHT : 0, { duration: PICKER_ANIM_DURATION }));
  };

  // Duration helpers
  const durationMs = endDate.getTime() - startDate.getTime();
  const durationTotalMins = Math.max(0, Math.round(durationMs / 60000));
  const durationHourIdx = Math.min(23, Math.floor(durationTotalMins / 60));
  const durationMinIdx = Math.min(11, Math.floor((durationTotalMins % 60) / 5));

  const handleStartTimeChange = (newStart: Date) => {
    const dur = endDate.getTime() - startDate.getTime();
    setStartDate(newStart);
    setEndDate(new Date(newStart.getTime() + Math.max(0, dur)));
  };

  const handleDurationHourChange = (idx: number) => {
    const totalMins = idx * 60 + durationMinIdx * 5;
    setEndDate(new Date(startDate.getTime() + totalMins * 60 * 1000));
  };

  const handleDurationMinChange = (idx: number) => {
    const totalMins = durationHourIdx * 60 + idx * 5;
    setEndDate(new Date(startDate.getTime() + totalMins * 60 * 1000));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Title required', 'Please enter a title for the activity.');
      return;
    }
    await insertActivity({ title, notes, startDate, endDate, notificationEnabled });
    router.back();
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView edges={['top']} style={styles.safeArea}>

        {/* NavBar */}
        <View style={styles.navBar}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Text style={styles.navCancel}>Cancel</Text>
          </Pressable>
          <Text style={styles.navTitle}>New activity</Text>
          <Pressable style={styles.navSaveBtn} onPress={handleSave} hitSlop={8}>
            <Text style={styles.navSaveText}>Add</Text>
          </Pressable>
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Title + Notes card */}
            <View style={styles.card}>
              <TextInput
                style={styles.titleInput}
                placeholder="Title"
                placeholderTextColor={AppColors.textSecondary}
                value={title}
                onChangeText={setTitle}
                returnKeyType="next"
                autoFocus
              />
              <View style={styles.inputSeparator} />
              <TextInput
                style={styles.notesInput}
                placeholder="Notes"
                placeholderTextColor={AppColors.textSecondary}
                value={notes}
                onChangeText={setNotes}
                multiline
                returnKeyType="done"
              />
            </View>

            {/* Time card: Empieza / Termina / Duración */}
            <View style={styles.card}>
              {/* Empieza */}
              <View style={styles.timeRow}>
                <Text style={styles.timeRowLabel}>Starts</Text>
                <View style={styles.chips}>
                  <View style={styles.chip}>
                    <Text style={styles.chipText}>{formatDateChip(startDate)}</Text>
                  </View>
                  <Pressable
                    style={[styles.chip, expandedPicker === 'start-time' && styles.chipActive]}
                    onPress={() => togglePicker('start-time')}
                  >
                    <Text style={styles.chipText}>{formatTimeChip(startDate)}</Text>
                  </Pressable>
                </View>
              </View>
              <Animated.View style={startTimeStyle} pointerEvents={expandedPicker === 'start-time' ? 'auto' : 'none'}>
                <InlineTimePicker date={startDate} onChange={handleStartTimeChange} />
              </Animated.View>

              <View style={styles.rowSeparator} />

              {/* Termina */}
              <View style={styles.timeRow}>
                <Text style={styles.timeRowLabel}>Ends</Text>
                <View style={styles.chips}>
                  <View style={styles.chip}>
                    <Text style={styles.chipText}>{formatDateChip(endDate)}</Text>
                  </View>
                  <Pressable
                    style={[styles.chip, expandedPicker === 'end-time' && styles.chipActive]}
                    onPress={() => togglePicker('end-time')}
                  >
                    <Text style={styles.chipText}>{formatTimeChip(endDate)}</Text>
                  </Pressable>
                </View>
              </View>
              <Animated.View style={endTimeStyle} pointerEvents={expandedPicker === 'end-time' ? 'auto' : 'none'}>
                <InlineTimePicker date={endDate} onChange={setEndDate} />
              </Animated.View>

              <View style={styles.rowSeparator} />

              {/* Duración */}
              <Pressable style={styles.timeRow} onPress={() => togglePicker('duration')}>
                <Text style={styles.timeRowLabel}>Duration</Text>
                <Text style={styles.chipText}>
                  {formatDuration(durationHourIdx, durationMinIdx * 5)}
                </Text>
              </Pressable>
              <Animated.View style={durationStyle} pointerEvents={expandedPicker === 'duration' ? 'auto' : 'none'}>
                <InlineDurationPicker
                  durationHourIdx={durationHourIdx}
                  durationMinIdx={durationMinIdx}
                  onHourChange={handleDurationHourChange}
                  onMinChange={handleDurationMinChange}
                />
              </Animated.View>
            </View>

            {/* Calendario */}
            <View style={styles.card}>
              <View style={styles.simpleRow}>
                <Text style={styles.simpleRowLabel}>Calendar</Text>
                <View style={styles.simpleRowRight}>
                  <Text style={styles.simpleRowValue}>None</Text>
                  <SymbolView name="chevron.down" size={12} tintColor={AppColors.textSecondary} />
                </View>
              </View>
            </View>

            {/* Color + Icono (PRO) */}
            <View style={styles.card}>
              <View style={styles.simpleRow}>
                <Text style={styles.simpleRowLabel}>Color</Text>
                <View style={styles.simpleRowRight}>
                  <View style={styles.proBadge}><Text style={styles.proText}>PRO</Text></View>
                  <View style={styles.colorCircle} />
                </View>
              </View>
              <View style={styles.rowSeparator} />
              <View style={styles.simpleRow}>
                <Text style={styles.simpleRowLabel}>Icon</Text>
                <View style={styles.simpleRowRight}>
                  <View style={styles.proBadge}><Text style={styles.proText}>PRO</Text></View>
                  <SymbolView name="chevron.right" size={14} tintColor={AppColors.textSecondary} />
                </View>
              </View>
            </View>

            {/* Repetir (PRO) */}
            <View style={styles.card}>
              <View style={styles.simpleRow}>
                <View style={[styles.rowIcon, { backgroundColor: AppColors.iconGrey }]}>
                  <SymbolView name="repeat" size={17} tintColor="#FFFFFF" />
                </View>
                <View style={styles.repeatLabelWrap}>
                  <Text style={styles.simpleRowLabel}>Repeat</Text>
                  <Text style={styles.repeatSubtitle}>Never</Text>
                </View>
                <View style={styles.simpleRowRight}>
                  <View style={styles.proBadge}><Text style={styles.proText}>PRO</Text></View>
                  <SymbolView name="chevron.right" size={14} tintColor={AppColors.textSecondary} />
                </View>
              </View>
            </View>

            {/* Activar notificación */}
            <View style={styles.card}>
              <View style={styles.simpleRow}>
                <View style={[styles.rowIcon, { backgroundColor: AppColors.iconYellow }]}>
                  <SymbolView name="bell.fill" size={17} tintColor="#FFFFFF" />
                </View>
                <Text style={[styles.simpleRowLabel, styles.flex]}>Enable notification</Text>
                <Switch
                  value={notificationEnabled}
                  onValueChange={setNotificationEnabled}
                  trackColor={{ false: AppColors.toggleTrack, true: AppColors.accent }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: AppColors.background },
  safeArea: { flex: 1 },
  flex: { flex: 1 },

  // NavBar
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  navCancel: {
    color: AppColors.accent,
    fontSize: 16,
  },
  navTitle: {
    color: AppColors.textPrimary,
    fontSize: 17,
    fontWeight: '600',
  },
  navSaveBtn: {
    backgroundColor: AppColors.accent,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  navSaveText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  // Scroll
  scrollContent: {
    padding: 16,
    gap: 8,
    paddingBottom: 40,
  },

  // Card
  card: {
    backgroundColor: AppColors.surfaceElevated,
    borderRadius: 16,
    overflow: 'hidden',
  },

  // Title / Notes
  titleInput: {
    color: AppColors.textPrimary,
    fontSize: 22,
    fontWeight: '400',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    minHeight: 56,
  },
  inputSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: AppColors.separator,
    marginHorizontal: 16,
  },
  notesInput: {
    color: AppColors.textSecondary,
    fontSize: 15,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    minHeight: 56,
  },

  // Time rows
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 52,
    gap: 10,
  },
  timeRowLabel: {
    color: AppColors.textPrimary,
    fontSize: 15,
    flex: 1,
  },
  chips: {
    flexDirection: 'row',
    gap: 6,
  },
  chip: {
    backgroundColor: AppColors.background,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipActive: {
    backgroundColor: '#2A3A52',
  },
  chipText: {
    color: AppColors.accent,
    fontSize: 15,
    fontWeight: '500',
  },
  rowSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: AppColors.separator,
    marginLeft: 16,
  },

  // Wheel picker
  pickerArea: {
    height: WHEEL_HEIGHT,
    flexDirection: 'row',
    position: 'relative',
    paddingHorizontal: 16,
  },
  selectionHighlight: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: PAD * ITEM_HEIGHT,
    height: ITEM_HEIGHT,
    backgroundColor: SELECTION_HIGHLIGHT_COLOR,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: AppColors.separator,
    zIndex: 0,
  },
  wheelItem: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelText: {
    color: AppColors.textPrimary,
    fontSize: 20,
    fontWeight: '400',
  },
  wheelTextSelected: {
    fontWeight: '600',
    fontSize: 21,
  },

  // Duration picker labels
  durationLabel: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 4,
    paddingRight: 8,
  },
  durationLabelText: {
    color: AppColors.textPrimary,
    fontSize: 16,
    fontWeight: '500',
  },

  // Simple rows (Calendario, Color, Icono, etc.)
  simpleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 52,
    gap: 12,
  },
  simpleRowLabel: {
    color: AppColors.textPrimary,
    fontSize: 15,
  },
  simpleRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 'auto',
  },
  simpleRowValue: {
    color: AppColors.textSecondary,
    fontSize: 15,
  },

  // Row icon (for Repetir, Notificación)
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  repeatLabelWrap: {
    flex: 1,
    gap: 2,
  },
  repeatSubtitle: {
    color: AppColors.textSecondary,
    fontSize: 12,
  },

  // PRO badge
  proBadge: {
    backgroundColor: AppColors.proBadge,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  proText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  // Color circle (PRO placeholder)
  colorCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: AppColors.iconGrey,
  },
});
