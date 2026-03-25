import { SymbolView } from 'expo-symbols';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppColors } from '@/constants/theme';
import { ListRecord, useListDatabase } from '@/features/list/hooks/useListDatabase';
import { BottomSheetModal } from './BottomSheetModal';

interface Props {
  visible: boolean;
  onClose: () => void;
  onNewList: () => void;
  selectedListId?: number | null;
  onSelectList?: (list: ListRecord) => void;
}

export function ListBottomSheet({ visible, onClose, onNewList, selectedListId, onSelectList }: Props) {
  const insets = useSafeAreaInsets();
  const { getLists } = useListDatabase();
  const [lists, setLists] = useState<ListRecord[]>([]);

  useEffect(() => {
    if (visible) {
      setLists(getLists());
    }
  }, [visible]);

  return (
    <BottomSheetModal visible={visible} onClose={onClose}>
      {/* Card 1: New list */}
      <View style={styles.card}>
        <Pressable style={styles.newListRow} onPress={() => { onClose(); onNewList(); }}>
          <View style={styles.plusCircle}>
            <SymbolView name="plus" size={18} tintColor="#FFFFFF" />
          </View>
          <Text style={styles.newListText}>New list</Text>
        </Pressable>
      </View>

      {/* Card 2: Lists section */}
      <View style={styles.card}>
        <Text style={styles.sectionHeader}>Lists</Text>
        <View style={styles.separator} />
        {lists.length === 0 ? (
          <Text style={styles.emptyText}>No lists</Text>
        ) : (
          lists.map((list, index) => (
            <React.Fragment key={list.id}>
              {index > 0 && <View style={styles.separator} />}
              <Pressable
                style={styles.listRow}
                onPress={() => { onSelectList?.(list); onClose(); }}
              >
                <View style={styles.listIconWrap}>
                  <SymbolView name="list.bullet" size={16} tintColor="#FFFFFF" />
                </View>
                <Text style={styles.listRowText}>{list.title}</Text>
                {selectedListId === list.id && (
                  <SymbolView name="checkmark" size={16} tintColor={AppColors.accent} />
                )}
              </Pressable>
            </React.Fragment>
          ))
        )}
      </View>

      {/* Cancel card — dark background, blue text */}
      <Pressable style={styles.cancelCard} onPress={onClose}>
        <Text style={styles.cancelText}>Cancel</Text>
      </Pressable>

      {/* Note text below cancel */}
      <Text style={[styles.noteText, { marginBottom: insets.bottom + 8 }]}>
        If this setting is enabled, the task will be included in the "Plan Subtasks" section to organize your subtasks.
      </Text>
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
  newListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  plusCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newListText: {
    color: AppColors.accent,
    fontSize: 17,
    fontWeight: '500',
  },
  sectionHeader: {
    color: AppColors.textPrimary,
    fontSize: 16,
    fontWeight: '500',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: AppColors.separator,
  },
  emptyText: {
    color: AppColors.textSecondary,
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  listIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: AppColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listRowText: {
    flex: 1,
    color: AppColors.textPrimary,
    fontSize: 15,
  },
  cancelCard: {
    backgroundColor: AppColors.surfaceElevated,
    borderRadius: 14,
    marginHorizontal: 8,
    marginTop: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelText: {
    color: AppColors.accent,
    fontSize: 17,
    fontWeight: '600',
  },
  noteText: {
    color: AppColors.textSecondary,
    fontSize: 12,
    paddingHorizontal: 24,
    paddingTop: 10,
    textAlign: 'center',
    lineHeight: 17,
  },
});
