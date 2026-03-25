import { SymbolView } from 'expo-symbols';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppColors } from '@/constants/theme';
import { BottomSheetModal } from './BottomSheetModal';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function ActivityBottomSheet({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <BottomSheetModal visible={visible} onClose={onClose}>
      {/* Main card */}
      <View style={styles.card}>
        <Pressable style={styles.manageRow}>
          <View style={styles.iconWrap}>
            <SymbolView name="calendar.badge.plus" size={28} tintColor={AppColors.accent} />
          </View>
          <Text style={styles.manageText}>Manage day's activities</Text>
        </Pressable>

        <View style={styles.separator} />

        <Text style={styles.sectionHeader}>Today</Text>
        <Text style={styles.emptyText}>No activities on this day</Text>
      </View>

      {/* Cancel button */}
      <Pressable
        style={[styles.cancelBtn, { marginBottom: insets.bottom + 8 }]}
        onPress={onClose}
      >
        <Text style={styles.cancelText}>Cancel</Text>
      </Pressable>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppColors.surfaceElevated,
    borderRadius: 14,
    marginHorizontal: 8,
    marginTop: 8,
    overflow: 'hidden',
  },
  manageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  iconWrap: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manageText: {
    color: AppColors.accent,
    fontSize: 16,
    fontWeight: '500',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: AppColors.separator,
    marginLeft: 60,
  },
  sectionHeader: {
    color: AppColors.textSecondary,
    fontSize: 14,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  emptyText: {
    color: AppColors.textSecondary,
    fontSize: 14,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  cancelBtn: {
    backgroundColor: AppColors.accent,
    marginHorizontal: 8,
    marginTop: 4,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
