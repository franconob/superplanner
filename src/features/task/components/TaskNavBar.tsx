import { SymbolView } from 'expo-symbols';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppColors } from '@/constants/theme';

interface Props {
  onCancel: () => void;
  onSave: () => void;
  onMenuPress: () => void;
}

export function TaskNavBar({ onCancel, onSave, onMenuPress }: Props) {
  return (
    <View style={styles.container}>
      <Pressable onPress={onCancel} style={styles.cancelBtn} hitSlop={8}>
        <Text style={styles.cancelText}>Cancel</Text>
      </Pressable>

      <View style={styles.center}>
        <Text style={styles.title}>New task</Text>
      </View>

      <View style={styles.right}>
        <Pressable hitSlop={8} style={styles.dotsBtn} onPress={onMenuPress}>
          <SymbolView name="ellipsis" size={18} tintColor={AppColors.textPrimary} />
        </Pressable>
        <Pressable onPress={onSave} style={styles.saveBtn} hitSlop={4}>
          <Text style={styles.saveText}>Save</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cancelBtn: {
    backgroundColor: '#000000',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: '#3A3A3A',
  },
  cancelText: {
    color: AppColors.accent,
    fontSize: 15,
    fontWeight: '500',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    color: AppColors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 60,
    justifyContent: 'flex-end',
  },
  dotsBtn: {
    backgroundColor: '#000000',
    padding: 8,
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: '#3A3A3A',
  },
  saveBtn: {
    backgroundColor: AppColors.accent,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 18,
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
