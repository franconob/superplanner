import { GlassView } from 'expo-glass-effect';
import { SymbolView } from 'expo-symbols';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { AppColors } from '@/constants/theme';
import { glassAvailable } from '@/utils/glass';
import { useTaskDatabase } from '@/features/task/hooks/useTaskDatabase';
import { Task } from '@/features/task/types';
import { TaskListItem } from '@/features/task/components/TaskListItem';

const CARD_WIDTH = 260;

function AnytimeMenu({
  visible,
  onClose,
  onCompleteAll,
}: {
  visible: boolean;
  onClose: () => void;
  onCompleteAll: () => void;
}) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.75);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      opacity.set(withTiming(1, { duration: 160 }));
      scale.set(withSpring(1, { damping: 16, stiffness: 280 }));
    } else {
      opacity.set(withTiming(0, { duration: 130 }));
      scale.set(withTiming(0.85, { duration: 130 }));
      const t = setTimeout(() => setMounted(false), 150);
      return () => clearTimeout(t);
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

  const items = [
    { icon: 'circle', label: 'Select all tasks' },
    { icon: 'arrow.up.arrow.down', label: 'Sort by', hasChevron: true },
    { icon: 'checkmark.circle', label: 'Complete all tasks', onPress: onCompleteAll },
  ];

  return (
    <>
      <Pressable style={menuStyles.backdrop} onPress={onClose} />
      <Animated.View style={[menuStyles.card, menuStyle]}>
        {glassAvailable && (
          <GlassView style={[StyleSheet.absoluteFill, { borderRadius: 16 }]} glassEffectStyle="regular" />
        )}
        {items.map((item, i) => (
          <React.Fragment key={item.label}>
            {i > 0 && <View style={menuStyles.sep} />}
            <Pressable
              style={menuStyles.item}
              onPress={() => { item.onPress?.(); onClose(); }}
            >
              <SymbolView name={item.icon as any} size={18} tintColor={AppColors.accent} />
              <Text style={menuStyles.itemText}>{item.label}</Text>
              {item.hasChevron && (
                <SymbolView name="chevron.right" size={13} tintColor={AppColors.textSecondary} />
              )}
            </Pressable>
          </React.Fragment>
        ))}
      </Animated.View>
    </>
  );
}

const menuStyles = StyleSheet.create({
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50 },
  card: {
    position: 'absolute',
    top: 100,
    right: 12,
    width: CARD_WIDTH,
    backgroundColor: glassAvailable ? 'transparent' : AppColors.surfaceElevated,
    borderRadius: 16,
    paddingVertical: 4,
    zIndex: 51,
    overflow: 'hidden',
    boxShadow: '0 6px 12px rgba(0,0,0,0.35)',
  },
  sep: { height: StyleSheet.hairlineWidth, backgroundColor: AppColors.separator, marginHorizontal: 12 },
  item: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13, gap: 12 },
  itemText: { flex: 1, color: AppColors.textPrimary, fontSize: 14, fontWeight: '500' },
});

export default function PastDueScreen() {
  const { getPastDueTasks, toggleTaskComplete } = useTaskDatabase();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAnytimeMenu, setShowAnytimeMenu] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(() => setTasks(getPastDueTasks()), []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleToggle = useCallback(async (id: number, completed: boolean) => {
    await toggleTaskComplete(id, completed);
    load();
  }, [toggleTaskComplete, load]);

  const renderItem = useCallback(({ item }: { item: Task }) => (
    <TaskListItem task={item} onToggle={handleToggle} onPress={noop} />
  ), [handleToggle]);

  const handleCompleteAll = async () => {
    for (const t of tasks) {
      await toggleTaskComplete(t.id, true);
    }
    load();
  };

  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const completed = tasks.reduce((n, t) => n + (t.isCompleted ? 1 : 0), 0);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {/* NavBar */}
        <View style={styles.navBar}>
          <Pressable style={styles.circleBtn} onPress={() => router.back()} hitSlop={8}>
            <SymbolView name="chevron.left" size={16} tintColor="#FFFFFF" />
          </Pressable>
          <View style={styles.navFill} />
          <Pressable style={styles.circleBtn} hitSlop={8}>
            <SymbolView name="ellipsis" size={16} tintColor="#FFFFFF" />
          </Pressable>
        </View>

        <Text style={styles.screenTitle}>Past Due</Text>

        {/* Anytime section header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Anytime</Text>
          <View style={styles.sectionChips}>
            <View style={styles.chip}>
              <SymbolView name="calendar" size={11} tintColor={AppColors.textSecondary} />
              <Text style={styles.chipText}>{today}</Text>
            </View>
            <View style={styles.chip}>
              <SymbolView name="circle" size={11} tintColor={AppColors.textSecondary} />
              <Text style={styles.chipText}>{completed}/{tasks.length}</Text>
            </View>
          </View>
          <Pressable hitSlop={8} onPress={() => setShowAnytimeMenu(true)}>
            <SymbolView name="ellipsis" size={16} tintColor={AppColors.accent} />
          </Pressable>
        </View>

        <FlatList
          data={tasks}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ItemSeparatorComponent={TaskSeparator}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <SymbolView name="checkmark.circle" size={40} tintColor={AppColors.separator} />
              <Text style={styles.emptyText}>No past due tasks</Text>
            </View>
          }
        />
      </SafeAreaView>

      <AnytimeMenu
        visible={showAnytimeMenu}
        onClose={() => setShowAnytimeMenu(false)}
        onCompleteAll={handleCompleteAll}
      />
    </View>
  );
}

const noop = () => {};
const keyExtractor = (t: Task) => String(t.id);
const TaskSeparator = () => <View style={styles.separator} />;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: AppColors.background },
  safeArea: { flex: 1 },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  navFill: { flex: 1 },
  circleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AppColors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenTitle: {
    color: AppColors.iconRed,
    fontSize: 28,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  sectionTitle: {
    color: AppColors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  sectionChips: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: AppColors.surfaceElevated,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  chipText: {
    color: AppColors.textSecondary,
    fontSize: 12,
  },
  listContent: { paddingTop: 4, paddingBottom: 32, flexGrow: 1 },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: AppColors.separator,
    marginLeft: 50,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    color: AppColors.textSecondary,
    fontSize: 15,
  },
});
