import { SymbolView } from 'expo-symbols';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { AppColors } from '@/constants/theme';
import { Task } from '../types';

interface Props {
  task: Task;
  onToggle: (id: number, completed: boolean) => void;
  onPress: (task: Task) => void;
  isSelectMode?: boolean;
  isSelected?: boolean;
  onSelect?: (id: number) => void;
}

export function TaskListItem({ task, onToggle, onPress, isSelectMode, isSelected, onSelect }: Props) {
  const checkScale = useSharedValue(task.isCompleted ? 1 : 0);
  const selectScale = useSharedValue(isSelected ? 1 : 0);

  const handleToggle = () => {
    if (isSelectMode) {
      selectScale.set(withTiming(isSelected ? 0 : 1, { duration: 160 }));
      onSelect?.(task.id);
      return;
    }
    const next = !task.isCompleted;
    checkScale.set(withTiming(next ? 1 : 0, { duration: 180 }));
    onToggle(task.id, next);
  };

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.get() }],
    opacity: checkScale.get(),
  }));

  const selectCheckStyle = useAnimatedStyle(() => ({
    transform: [{ scale: selectScale.get() }],
    opacity: selectScale.get(),
  }));

  const today = new Date().toISOString().split('T')[0];
  const isToday = task.date === today;
  const dateLabel = isToday ? 'Today' : task.date ?? null;

  const handleRowPress = () => {
    if (isSelectMode) {
      selectScale.set(withTiming(isSelected ? 0 : 1, { duration: 160 }));
      onSelect?.(task.id);
    } else {
      onPress(task);
    }
  };

  return (
    <Pressable
      style={[styles.row, isSelected && styles.rowSelected]}
      onPress={handleRowPress}
    >
      {/* Checkbox / Select circle */}
      <Pressable style={styles.checkboxWrap} onPress={handleToggle} hitSlop={8}>
        {isSelectMode ? (
          <View style={[styles.selectCircle, isSelected && styles.selectCircleSelected]}>
            <Animated.View style={selectCheckStyle}>
              <SymbolView name="checkmark" size={12} tintColor="#FFFFFF" />
            </Animated.View>
          </View>
        ) : (
          <View style={[styles.checkbox, task.isCompleted && styles.checkboxChecked]}>
            <Animated.View style={checkStyle}>
              <SymbolView name="checkmark" size={12} tintColor="#FFFFFF" />
            </Animated.View>
          </View>
        )}
      </Pressable>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.title, !isSelectMode && task.isCompleted && styles.titleCompleted]}>
          {task.title}
        </Text>
        <View style={styles.chips}>
          {dateLabel && (
            <View style={styles.chip}>
              <SymbolView name="calendar" size={11} tintColor={AppColors.textSecondary} />
              <Text style={styles.chipText}>{dateLabel}</Text>
            </View>
          )}
          {task.notes ? (
            <View style={styles.chip}>
              <SymbolView name="doc.text" size={11} tintColor={AppColors.textSecondary} />
              <Text style={styles.chipText}>Notes</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  checkboxWrap: {
    paddingTop: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: AppColors.separator,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: AppColors.accent,
    borderColor: AppColors.accent,
  },
  selectCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: AppColors.separator,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectCircleSelected: {
    backgroundColor: AppColors.accent,
    borderColor: AppColors.accent,
  },
  rowSelected: {
    backgroundColor: `${AppColors.accent}22`,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: AppColors.textPrimary,
    fontSize: 15,
    fontWeight: '400',
  },
  titleCompleted: {
    color: AppColors.textSecondary,
    textDecorationLine: 'line-through',
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
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
});
