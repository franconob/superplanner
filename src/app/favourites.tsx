import { SymbolView } from 'expo-symbols';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassView } from 'expo-glass-effect';
import { AppColors } from '@/constants/theme';
import { glassAvailable } from '@/utils/glass';
import { useTaskDatabase } from '@/features/task/hooks/useTaskDatabase';
import { Task } from '@/features/task/types';
import { TaskListItem } from '@/features/task/components/TaskListItem';
import { InlineTaskInput } from '@/features/task/components/InlineTaskInput';
import { TaskListMenu } from '@/features/task/components/TaskListMenu';

export default function FavouritesScreen() {
  const { getFavoriteTasks, insertTask, toggleTaskComplete } = useTaskDatabase();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showInlineInput, setShowInlineInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(() => setTasks(getFavoriteTasks()), []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleToggle = useCallback(async (id: number, completed: boolean) => {
    await toggleTaskComplete(id, completed);
    load();
  }, [toggleTaskComplete, load]);

  const renderItem = useCallback(({ item }: { item: Task }) => (
    <TaskListItem task={item} onToggle={handleToggle} onPress={noop} />
  ), [handleToggle]);

  const handleInlineSubmit = async (title: string) => {
    await insertTask({
      title,
      notes: '',
      hasDate: false,
      date: new Date(),
      isFavorite: true,
      isActivityLinked: false,
      selectedListId: null,
      selectedListTitle: null,
    });
    load();
    setShowInlineInput(false);
  };

  const handleCompleteAll = async () => {
    for (const t of tasks.filter(t => !t.isCompleted)) {
      await toggleTaskComplete(t.id, true);
    }
    load();
  };

  const q = searchQuery.trim().toLowerCase();
  const filtered = q ? tasks.filter(t => t.title.toLowerCase().includes(q)) : tasks;

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
          <Pressable style={styles.circleBtn} onPress={() => setShowMenu(true)} hitSlop={8}>
            <SymbolView name="ellipsis" size={16} tintColor="#FFFFFF" />
          </Pressable>
        </View>

        <Text style={styles.screenTitle}>Favorites</Text>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined}
        >
          <FlatList
            data={filtered}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            ItemSeparatorComponent={TaskSeparator}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <SymbolView name="checkmark.circle" size={40} tintColor={AppColors.separator} />
                <Text style={styles.emptyText}>No favorite tasks</Text>
              </View>
            }
            keyboardShouldPersistTaps="handled"
          />

          {showInlineInput && (
            <InlineTaskInput
              onSubmit={handleInlineSubmit}
              onOpenFullForm={() => {
                setShowInlineInput(false);
                setTimeout(() => router.push('/add-task'), 300);
              }}
            />
          )}

          {!showInlineInput && (
            <View style={styles.bottomBar}>
              {glassAvailable && (
                <GlassView style={StyleSheet.absoluteFill} glassEffectStyle="regular" />
              )}
              <Pressable style={styles.bottomIconBtn}>
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
              <Pressable style={styles.bottomIconBtn} onPress={() => setShowInlineInput(true)}>
                <SymbolView name="plus" size={18} tintColor={AppColors.accent} />
              </Pressable>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>

      <TaskListMenu visible={showMenu} onClose={() => setShowMenu(false)} onCompleteAll={handleCompleteAll} />
    </View>
  );
}

const noop = () => {};
const keyExtractor = (t: Task) => String(t.id);
const TaskSeparator = () => <View style={styles.separator} />;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: AppColors.background },
  safeArea: { flex: 1 },
  flex: { flex: 1 },
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
    color: AppColors.iconOrange,
    fontSize: 28,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  listContent: { paddingTop: 8, paddingBottom: 16, flexGrow: 1 },
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
  bottomIconBtn: {
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
});
