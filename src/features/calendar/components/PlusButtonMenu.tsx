import { GlassView } from 'expo-glass-effect';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, { AnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppColors } from '@/constants/theme';
import { glassAvailable } from '@/utils/glass';

interface PlusButtonMenuProps {
  onClose: () => void;
  menuContainerAnimatedStyle: AnimatedStyle<ViewStyle>;
  item1AnimatedStyle: AnimatedStyle<ViewStyle>;
  item2AnimatedStyle: AnimatedStyle<ViewStyle>;
}

export function PlusButtonMenu({
  onClose,
  menuContainerAnimatedStyle,
  item1AnimatedStyle,
  item2AnimatedStyle,
}: PlusButtonMenuProps) {
  const insets = useSafeAreaInsets();

  return (
    <>
      {/* Full-screen backdrop — tap to dismiss */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      {/* Floating action card */}
      <Animated.View
        style={[styles.container, { bottom: insets.bottom + 12 }, menuContainerAnimatedStyle]}
      >
        {glassAvailable && (
          <GlassView style={[StyleSheet.absoluteFill, { borderRadius: 22 }]} glassEffectStyle="regular" />
        )}
        {/* Item 1: New task */}
        <Animated.View style={item1AnimatedStyle}>
          <Pressable style={styles.item} onPress={() => { router.push('/add-task'); onClose(); }}>
            <SymbolView name="checkmark.circle.badge.plus" size={26} tintColor={AppColors.textPrimary} style={styles.icon} />
            <View style={styles.textWrap}>
              <Text style={styles.itemTitle}>New task</Text>
              <Text style={styles.itemSubtitle}>Add an individual task</Text>
            </View>
          </Pressable>
        </Animated.View>

        <View style={styles.separator} />

        {/* Item 2: New activity */}
        <Animated.View style={item2AnimatedStyle}>
          <Pressable style={styles.item} onPress={() => { router.push('/add-activity'); onClose(); }}>
            <SymbolView name="square.grid.2x2.fill" size={26} tintColor={AppColors.textPrimary} style={styles.icon} />
            <View style={styles.textWrap}>
              <Text style={styles.itemTitle}>New activity</Text>
              <Text style={styles.itemSubtitle}>Time block for related tasks</Text>
            </View>
          </Pressable>
        </Animated.View>
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
  },
  container: {
    position: 'absolute',
    right: 16,
    minWidth: 240,
    backgroundColor: glassAvailable ? 'transparent' : AppColors.surface,
    borderRadius: 22,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  icon: {
    width: 36,
    height: 36,
  },
  textWrap: {
    gap: 2,
  },
  itemTitle: {
    color: AppColors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  itemSubtitle: {
    color: AppColors.textSecondary,
    fontSize: 12,
  },
  separator: {
    height: 1,
    backgroundColor: '#3A3A3A',
    marginHorizontal: 16,
  },
});
