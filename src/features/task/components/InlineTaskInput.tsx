import { SymbolView } from 'expo-symbols';
import React, { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AppColors } from '@/constants/theme';

interface Props {
  onSubmit: (title: string) => void;
  onOpenFullForm: () => void;
}

const QUICK_CHIPS = ['Notification', 'Repeat', 'Priority', 'List'];

export function InlineTaskInput({ onSubmit, onOpenFullForm }: Props) {
  const [title, setTitle] = useState('');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleSubmit = () => {
    if (title.trim()) {
      onSubmit(title.trim());
      setTitle('');
    }
  };

  return (
    <View style={styles.container}>
      {/* Input row */}
      <View style={styles.inputRow}>
        <View style={styles.checkbox} />
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="New task"
          placeholderTextColor={AppColors.textSecondary}
          value={title}
          onChangeText={setTitle}
          onSubmitEditing={handleSubmit}
          returnKeyType="done"
          blurOnSubmit={false}
        />
        <Pressable onPress={onOpenFullForm} hitSlop={8}>
          <SymbolView name="info.circle" size={22} tintColor={AppColors.textSecondary} />
        </Pressable>
      </View>

      {/* Quick chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {QUICK_CHIPS.map(chip => (
          <Pressable key={chip} style={styles.chip}>
            <Text style={styles.chipText}>{chip}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppColors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: AppColors.separator,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: AppColors.separator,
  },
  input: {
    flex: 1,
    color: AppColors.textPrimary,
    fontSize: 15,
  },
  chips: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 8,
    flexDirection: 'row',
  },
  chip: {
    backgroundColor: AppColors.surfaceElevated,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: {
    color: AppColors.textSecondary,
    fontSize: 13,
  },
});
