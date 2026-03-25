import { GlassView } from 'expo-glass-effect';
import { SymbolView } from 'expo-symbols';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppColors } from '@/constants/theme';
import { glassAvailable } from '@/utils/glass';
import { useActivityDatabase } from '@/features/activity/hooks/useActivityDatabase';
import { Activity } from '@/features/activity/types';
import { useTaskDatabase } from '@/features/task/hooks/useTaskDatabase';
import { Task } from '@/features/task/types';
import { TaskListItem } from '@/features/task/components/TaskListItem';

// ─── Floating menu ────────────────────────────────────────────────────────────

interface MenuItem {
  icon: string;
  label: string;
  hasChevron?: boolean;
  destructive?: boolean;
  onPress?: () => void;
}

interface FloatingMenuProps {
  visible: boolean;
  onClose: () => void;
  items: MenuItem[];
  topOffset?: number;
}

const CARD_WIDTH = 270;

function FloatingMenu({ visible, onClose, items, topOffset = 60 }: FloatingMenuProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.75);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      opacity.set(withTiming(1, { duration: 160 }));
      scale.set(withSpring(1, { damping: 16, stiffness: 280 }));
    } else {
      // Animate out, then unmount via setTimeout (safe JS thread call)
      opacity.set(withTiming(0, { duration: 130 }));
      scale.set(withTiming(0.85, { duration: 130 }));
      const timer = setTimeout(() => setMounted(false), 150);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const menuStyle = useAnimatedStyle(() => ({
    opacity: opacity.get(),
    transform: [
      { translateX: CARD_WIDTH / 2 },
      { translateY: -20 },
      { scale: scale.get() },
      { translateX: -(CARD_WIDTH / 2) },
      { translateY: 20 },
    ],
  }));

  if (!mounted) return null;

  return (
    // pointerEvents='none' immediately when not visible so nothing is blocked during close animation
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} pointerEvents={visible ? 'auto' : 'none'}>
      <Pressable style={menuStyles.backdrop} onPress={onClose} />
      <Animated.View style={[menuStyles.card, { top: topOffset }, menuStyle]}>
        {glassAvailable && (
          <GlassView style={[StyleSheet.absoluteFill, { borderRadius: 16 }]} glassEffectStyle="regular" />
        )}
        {items.map((item, i) => (
          <React.Fragment key={item.label}>
            {i > 0 && <View style={menuStyles.separator} />}
            <Pressable
              style={menuStyles.item}
              onPress={() => { item.onPress?.(); onClose(); }}
            >
              <SymbolView
                name={item.icon as any}
                size={18}
                tintColor={item.destructive ? AppColors.iconRed : AppColors.accent}
              />
              <Text style={[menuStyles.itemText, item.destructive && menuStyles.itemTextDestructive]}>
                {item.label}
              </Text>
              {item.hasChevron && (
                <SymbolView name="chevron.right" size={13} tintColor={AppColors.textSecondary} />
              )}
            </Pressable>
          </React.Fragment>
        ))}
      </Animated.View>
    </View>
  );
}

const menuStyles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 50,
  },
  card: {
    position: 'absolute',
    right: 12,
    width: CARD_WIDTH,
    backgroundColor: glassAvailable ? 'transparent' : AppColors.surfaceElevated,
    borderRadius: 16,
    paddingVertical: 4,
    zIndex: 51,
    overflow: 'hidden',
    boxShadow: '0 6px 12px rgba(0,0,0,0.35)',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: AppColors.separator,
    marginHorizontal: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
  },
  itemText: {
    flex: 1,
    color: AppColors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  itemTextDestructive: {
    color: AppColors.iconRed,
  },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDayLabel(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const d = date.toDateString();
  if (d === today.toDateString()) return 'Today';
  if (d === yesterday.toDateString()) return 'Yesterday';
  if (d === tomorrow.toDateString()) return 'Tomorrow';

  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function formatTimeRange(startISO: string, endISO: string): string {
  const start = new Date(startISO);
  const end = new Date(endISO);
  const fmt = (d: Date) => `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  return `${fmt(start)} – ${fmt(end)}`;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ActivityListScreen() {
  const { getActivities, deleteActivity } = useActivityDatabase();
  const { getTasks, toggleTaskComplete } = useTaskDatabase();

  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [activities, setActivities] = useState<Activity[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectMode, setSelectMode] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);
  const [showSelectMenu, setShowSelectMenu] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showAnytimeMenu, setShowAnytimeMenu] = useState(false);
  const [activeActivityMenu, setActiveActivityMenu] = useState<number | null>(null);

  const loadData = useCallback(() => {
    const dateStr = selectedDate.toDateString();
    const todayISO = selectedDate.toISOString().split('T')[0];

    const allActivities = getActivities();
    setActivities(allActivities.filter(a => new Date(a.startDate).toDateString() === dateStr));

    const allTasks = getTasks();
    setTasks(allTasks.filter(t => t.date === todayISO));
  }, [selectedDate]);

  // Reload when date changes
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reload when returning from modals (e.g. add-task)
  useFocusEffect(useCallback(() => {
    loadData();
  }, [loadData]));

  const handleToggle = async (id: number, completed: boolean) => {
    await toggleTaskComplete(id, completed);
    loadData();
  };

  const handleDeleteActivity = (id: number) => {
    Alert.alert('Delete activity', 'Are you sure you want to delete this activity?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteActivity(id);
          loadData();
        },
      },
    ]);
  };

  const handleCompleteAll = async () => {
    for (const task of tasks.filter(t => !t.isCompleted)) {
      await toggleTaskComplete(task.id, true);
    }
    loadData();
  };

  const prevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  };

  const nextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d);
  };

  const enterSelectMode = () => {
    setSelectMode(true);
    setSelectedTaskIds([]);
    setShowSelectMenu(false);
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedTaskIds([]);
  };

  const toggleTaskSelection = (id: number) => {
    setSelectedTaskIds(prev =>
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    );
  };

  const dayLabel = getDayLabel(selectedDate);
  const completedCount = tasks.reduce((n, t) => n + (t.isCompleted ? 1 : 0), 0);

  const q = searchQuery.trim().toLowerCase();
  const filtered = q ? tasks.filter(t => t.title.toLowerCase().includes(q)) : tasks;

  const anytimeMenuItems: MenuItem[] = [
    { icon: 'plus.circle', label: 'New task', onPress: () => router.push('/add-task') },
    { icon: 'plus.circle', label: 'New section' },
    { icon: 'rectangle.3.offgrid', label: 'Manage sections' },
    { icon: 'circle', label: 'Select all tasks' },
    { icon: 'arrow.up.arrow.down', label: 'Sort by', hasChevron: true },
    { icon: 'checkmark.circle', label: 'Complete all tasks', onPress: handleCompleteAll },
  ];

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {/* NavBar */}
        <View style={styles.navBar}>
          <Pressable style={styles.navCircleBtn} onPress={() => router.back()} hitSlop={8}>
            <SymbolView name="xmark" size={16} tintColor="#FFFFFF" />
          </Pressable>

          <View style={styles.navCenter}>
            <Pressable style={styles.navArrowBtn} onPress={prevDay} hitSlop={8}>
              <SymbolView name="chevron.left" size={16} tintColor={AppColors.accent} />
            </Pressable>

            <View style={styles.navTitleWrap}>
              <Text style={styles.navTitle}>Daily summary</Text>
              <Text style={styles.navSubtitle}>{dayLabel}</Text>
            </View>

            <Pressable style={styles.navArrowBtn} onPress={nextDay} hitSlop={8}>
              <SymbolView name="chevron.right" size={16} tintColor={AppColors.accent} />
            </Pressable>
          </View>

          <Pressable style={styles.navCircleBtn} onPress={() => setShowSelectMenu(true)} hitSlop={8}>
            <SymbolView name="ellipsis" size={16} tintColor="#FFFFFF" />
          </Pressable>
        </View>

        {/* Content */}
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Anytime section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Anytime</Text>
                <View style={styles.sectionHeaderRight}>
                  <View style={styles.chip}>
                    <SymbolView name="calendar" size={11} tintColor={AppColors.textSecondary} />
                    <Text style={styles.chipText}>{dayLabel}</Text>
                  </View>
                  <View style={styles.chip}>
                    <SymbolView name="circle" size={11} tintColor={AppColors.textSecondary} />
                    <Text style={styles.chipText}>{completedCount}/{tasks.length}</Text>
                  </View>
                  <Pressable hitSlop={8} onPress={() => setShowAnytimeMenu(true)}>
                    <SymbolView name="ellipsis" size={14} tintColor={AppColors.accent} />
                  </Pressable>
                </View>
              </View>

              {filtered.map((task, i) => (
                <React.Fragment key={task.id}>
                  {i > 0 && <View style={styles.itemSeparator} />}
                  <TaskListItem
                    task={task}
                    onToggle={handleToggle}
                    onPress={() => {}}
                    isSelectMode={selectMode}
                    isSelected={selectedTaskIds.includes(task.id)}
                    onSelect={toggleTaskSelection}
                  />
                </React.Fragment>
              ))}

              {filtered.length === 0 && (
                <Text style={styles.emptyText}>No tasks for this day</Text>
              )}
            </View>

            {/* Activity sections */}
            {activities.map(activity => (
              <View key={activity.id} style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.activitySectionLeft}>
                    <Text style={styles.activitySectionTitle}>{activity.title}</Text>
                    <View style={styles.chip}>
                      <SymbolView name="clock" size={11} tintColor={AppColors.textSecondary} />
                      <Text style={styles.chipText}>
                        {formatTimeRange(activity.startDate, activity.endDate)}
                      </Text>
                    </View>
                  </View>
                  <Pressable hitSlop={8} onPress={() => setActiveActivityMenu(activity.id)}>
                    <SymbolView name="ellipsis" size={14} tintColor={AppColors.accent} />
                  </Pressable>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Bottom bar */}
          {selectMode ? (
            <View style={styles.selectBottomBar}>
              <Pressable
                style={styles.selectPill}
                onPress={() => setShowActionMenu(true)}
              >
                <Text style={styles.selectPillText}>Actions</Text>
              </Pressable>
              <Pressable style={styles.selectPill} onPress={exitSelectMode}>
                <Text style={styles.selectPillText}>Done</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.bottomBar}>
              {glassAvailable && (
                <GlassView style={StyleSheet.absoluteFill} glassEffectStyle="regular" />
              )}
              <Pressable style={styles.bottomCircleBtn}>
                <SymbolView name="line.3.horizontal.decrease.circle" size={20} tintColor={AppColors.accent} />
              </Pressable>

              <View style={styles.searchWrap}>
                <SymbolView name="magnifyingglass" size={14} tintColor={AppColors.textSecondary} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search"
                  placeholderTextColor={AppColors.textSecondary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              <Pressable
                style={styles.bottomCircleBtn}
                onPress={() => router.push('/add-task')}
              >
                <SymbolView name="plus" size={18} tintColor={AppColors.accent} />
              </Pressable>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Header three dots: 1-item "Select tasks" menu */}
      <FloatingMenu
        visible={showSelectMenu}
        onClose={() => setShowSelectMenu(false)}
        items={[{ icon: 'checkmark.circle', label: 'Select tasks', onPress: enterSelectMode }]}
      />

      {/* Anytime section three dots menu */}
      <FloatingMenu
        visible={showAnytimeMenu}
        onClose={() => setShowAnytimeMenu(false)}
        items={anytimeMenuItems}
      />

      {/* Action menu (bottom sheet style) */}
      {showActionMenu && (
        <>
          <Pressable style={menuStyles.backdrop} onPress={() => setShowActionMenu(false)} />
          <View style={styles.actionMenu}>
            {glassAvailable && (
              <GlassView style={[StyleSheet.absoluteFill, { borderRadius: 16 }]} glassEffectStyle="regular" />
            )}
            {[
              { icon: 'trash', label: 'Delete tasks', destructive: true },
              { icon: 'doc.on.doc', label: 'Copy to clipboard' },
              { icon: 'minus.circle', label: 'Mark as pending' },
              { icon: 'list.bullet', label: 'Move to list' },
              { icon: 'calendar.badge.clock', label: 'Reschedule tasks' },
            ].map((item, i) => (
              <React.Fragment key={item.label}>
                {i > 0 && <View style={styles.actionMenuSep} />}
                <Pressable
                  style={styles.actionMenuItem}
                  onPress={() => setShowActionMenu(false)}
                >
                  <SymbolView
                    name={item.icon as any}
                    size={18}
                    tintColor={item.destructive ? AppColors.iconRed : AppColors.accent}
                  />
                  <Text style={[styles.actionMenuText, item.destructive && styles.actionMenuTextDestructive]}>
                    {item.label}
                  </Text>
                </Pressable>
              </React.Fragment>
            ))}
          </View>
        </>
      )}

      {/* Activity-specific three dots menus */}
      {activities.map(activity => (
        <FloatingMenu
          key={activity.id}
          visible={activeActivityMenu === activity.id}
          onClose={() => setActiveActivityMenu(null)}
          items={[
            { icon: 'circle', label: 'Select all tasks in activity' },
            { icon: 'plus.circle', label: 'New section' },
            { icon: 'rectangle.3.offgrid', label: 'Manage sections' },
            { icon: 'plus.circle', label: 'Add task to activity' },
            { icon: 'arrow.up.arrow.down', label: 'Sort by', hasChevron: true },
            { icon: 'pencil', label: 'Edit activity' },
            { icon: 'minus.circle', label: 'Exclude from today' },
            {
              icon: 'trash',
              label: 'Delete activity',
              destructive: true,
              onPress: () => handleDeleteActivity(activity.id),
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  // NavBar
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  navCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AppColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  navArrowBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitleWrap: {
    flex: 1,
    alignItems: 'center',
  },
  navTitle: {
    color: AppColors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  navSubtitle: {
    color: AppColors.textSecondary,
    fontSize: 12,
    marginTop: 1,
  },
  navCirclePlaceholder: {
    width: 36,
    height: 36,
  },
  selectModeCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectModeTitle: {
    color: AppColors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  // Content
  scrollContent: {
    paddingBottom: 16,
  },
  // Section
  section: {
    marginTop: 24,
    marginHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    color: AppColors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  activitySectionLeft: {
    flex: 1,
    gap: 4,
  },
  activitySectionTitle: {
    color: AppColors.textSecondary,
    fontSize: 17,
    fontWeight: '700',
  },
  sectionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  chipText: {
    color: AppColors.textSecondary,
    fontSize: 12,
  },
  itemSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: AppColors.separator,
    marginLeft: 50,
  },
  emptyText: {
    color: AppColors.textSecondary,
    fontSize: 14,
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  // Bottom bar
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: AppColors.separator,
    overflow: 'hidden',
  },
  bottomCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.surfaceElevated,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    color: AppColors.textPrimary,
    fontSize: 14,
    padding: 0,
  },
  // Select mode bottom bar
  selectBottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: AppColors.separator,
  },
  selectPill: {
    backgroundColor: AppColors.accent,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  selectPillText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  // Action menu
  actionMenu: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 80,
    backgroundColor: glassAvailable ? 'transparent' : AppColors.surfaceElevated,
    borderRadius: 16,
    paddingVertical: 4,
    zIndex: 51,
    overflow: 'hidden',
    boxShadow: '0 6px 12px rgba(0,0,0,0.35)',
  },
  actionMenuSep: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: AppColors.separator,
    marginHorizontal: 12,
  },
  actionMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
  },
  actionMenuText: {
    flex: 1,
    color: AppColors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  actionMenuTextDestructive: {
    color: AppColors.iconRed,
  },
});
