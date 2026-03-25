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

import { AppColors } from '@/constants/theme';
import { useTaskDatabase } from '@/features/task/hooks/useTaskDatabase';
import { Task } from '@/features/task/types';
import { InlineTaskInput } from '@/features/task/components/InlineTaskInput';
import { TaskListItem } from '@/features/task/components/TaskListItem';
import { TaskListMenu } from '@/features/task/components/TaskListMenu';

export default function TaskListScreen() {
  const { getTasks, insertTask, toggleTaskComplete } = useTaskDatabase();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showInlineInput, setShowInlineInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadTasks = useCallback(() => {
    setTasks(getTasks());
  }, []);

  useFocusEffect(useCallback(() => {
    loadTasks();
  }, [loadTasks]));

  const handleToggle = useCallback(async (id: number, completed: boolean) => {
    await toggleTaskComplete(id, completed);
    loadTasks();
  }, [toggleTaskComplete, loadTasks]);

  const renderItem = useCallback(({ item }: { item: Task }) => (
    <TaskListItem task={item} onToggle={handleToggle} onPress={noop} />
  ), [handleToggle]);

  const handleInlineSubmit = async (title: string) => {
    await insertTask({
      title,
      notes: '',
      hasDate: true,
      date: new Date(),
      isFavorite: false,
      isActivityLinked: false,
      selectedListId: null,
      selectedListTitle: null,
    });
    loadTasks();
    setShowInlineInput(false);
  };

  const handleCompleteAll = async () => {
    for (const task of tasks.filter(t => !t.isCompleted)) {
      await toggleTaskComplete(task.id, true);
    }
    loadTasks();
  };

  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  const q = searchQuery.trim().toLowerCase();
  const filtered = q ? tasks.filter(t => t.title.toLowerCase().includes(q)) : tasks;

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
            <Text style={styles.navTitle}>Anytime</Text>
            <Text style={styles.navSubtitle}>{today}</Text>
          </View>

          <Pressable style={styles.navCircleBtn} onPress={() => setShowMenu(true)} hitSlop={8}>
            <SymbolView name="ellipsis" size={16} tintColor="#FFFFFF" />
          </Pressable>
        </View>

        {/* Task list */}
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          <FlatList
            data={filtered}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            ItemSeparatorComponent={TaskSeparator}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No tasks</Text>
            }
            keyboardShouldPersistTaps="handled"
          />

          {/* Inline input */}
          {showInlineInput && (
            <InlineTaskInput
              onSubmit={handleInlineSubmit}
              onOpenFullForm={() => {
                setShowInlineInput(false);
                setTimeout(() => router.push('/add-task'), 300);
              }}
            />
          )}

          {/* Bottom bar */}
          {!showInlineInput && (
            <View style={styles.bottomBar}>
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
                onPress={() => setShowInlineInput(true)}
              >
                <SymbolView name="plus" size={18} tintColor={AppColors.accent} />
              </Pressable>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Three dots menu */}
      <TaskListMenu
        visible={showMenu}
        onClose={() => setShowMenu(false)}
        onCompleteAll={handleCompleteAll}
      />
    </View>
  );
}

const noop = () => {};
const keyExtractor = (t: Task) => String(t.id);
const TaskSeparator = () => <View style={styles.separator} />;

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
  // List
  listContent: {
    paddingTop: 8,
    paddingBottom: 16,
    flexGrow: 1,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: AppColors.separator,
    marginLeft: 50,
  },
  emptyText: {
    color: AppColors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 60,
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
});
