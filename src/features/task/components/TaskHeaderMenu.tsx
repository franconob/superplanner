import { SymbolView } from 'expo-symbols';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { AppColors } from '@/constants/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSaveAndOpen: () => void;
  onSaveAndAddAnother: () => void;
}

const CARD_WIDTH = 260;

export function TaskHeaderMenu({ visible, onClose, onSaveAndOpen, onSaveAndAddAnother }: Props) {
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
      const timer = setTimeout(() => setMounted(false), 150);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  // Scale from top-left corner using translate trick
  const menuStyle = useAnimatedStyle(() => ({
    opacity: opacity.get(),
    transform: [
      { translateX: -(CARD_WIDTH / 2) },
      { translateY: -30 },
      { scale: scale.get() },
      { translateX: CARD_WIDTH / 2 },
      { translateY: 30 },
    ],
  }));

  if (!mounted) return null;

  return (
    <>
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      {/* Menu card */}
      <Animated.View style={[styles.card, menuStyle]}>
        {/* Add multiple tasks */}
        <Pressable style={styles.item} onPress={onClose}>
          <View style={styles.iconWrap}>
            <SymbolView name="checklist" size={18} tintColor={AppColors.textPrimary} />
          </View>
          <Text style={styles.itemText}>Add multiple tasks</Text>
        </Pressable>

        <View style={styles.separator} />

        {/* Save and open task */}
        <Pressable style={styles.item} onPress={() => { onSaveAndOpen(); onClose(); }}>
          <View style={styles.iconWrap}>
            <SymbolView name="arrow.right" size={18} tintColor={AppColors.textPrimary} />
          </View>
          <Text style={styles.itemText}>Save and open task</Text>
        </Pressable>

        <View style={styles.separator} />

        {/* Save and add another */}
        <Pressable style={styles.item} onPress={() => { onSaveAndAddAnother(); onClose(); }}>
          <View style={styles.iconWrap}>
            <SymbolView name="plus.square.on.square" size={18} tintColor={AppColors.textPrimary} />
          </View>
          <Text style={styles.itemText}>Save and add another task</Text>
        </Pressable>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
  },
  card: {
    position: 'absolute',
    top: 56,
    left: 16,
    minWidth: 260,
    backgroundColor: AppColors.surface,
    borderRadius: 18,
    paddingVertical: 4,
    zIndex: 51,
    boxShadow: '0 6px 12px rgba(0,0,0,0.35)',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: AppColors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    color: AppColors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: AppColors.separator,
    marginHorizontal: 14,
  },
});
