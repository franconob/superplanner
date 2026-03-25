import { GlassContainer, GlassView } from 'expo-glass-effect';
import { SymbolView } from 'expo-symbols';
import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, { AnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppColors } from '@/constants/theme';
import { glassAvailable } from '@/utils/glass';

interface BottomBarProps {
  isToday: boolean;
  onBackToToday: () => void;
  onPlusPress: () => void;
  onListPress: () => void;
  animatedStyle: AnimatedStyle<ViewStyle>;
}

const CIRCLE_SIZE = 46;

export function BottomBar({ isToday, onBackToToday, onPlusPress, onListPress, animatedStyle }: BottomBarProps) {
  const insets = useSafeAreaInsets();

  const inner = (
    <>
      {/* Left — list icon circle */}
      <Pressable onPress={onListPress} hitSlop={4}>
        <GlassView style={styles.circleBtn} glassEffectStyle="regular">
          <SymbolView name="list.bullet" size={20} tintColor={AppColors.textPrimary} />
        </GlassView>
      </Pressable>

      {/* Center — "Back to today" pill, only when not on today */}
      <View style={styles.center}>
        {!isToday && (
          <Pressable onPress={onBackToToday} hitSlop={4}>
            <GlassView style={styles.backPill} glassEffectStyle="regular">
              <Text style={styles.backText}>Back to today</Text>
            </GlassView>
          </Pressable>
        )}
      </View>

      {/* Right — plus icon circle */}
      <Pressable onPress={onPlusPress} hitSlop={4}>
        <GlassView style={styles.circleBtn} glassEffectStyle="regular">
          <SymbolView name="plus" size={20} tintColor={AppColors.textPrimary} />
        </GlassView>
      </Pressable>
    </>
  );

  return (
    <Animated.View
      style={[styles.wrapper, { bottom: insets.bottom + 12 }, animatedStyle]}
    >
      {glassAvailable ? (
        <GlassContainer style={styles.container} spacing={8}>
          {inner}
        </GlassContainer>
      ) : (
        <View style={[styles.container, styles.containerFallback]}>
          {inner}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
  // Shared container shape — bordered pill
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 36,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  containerFallback: {
    backgroundColor: AppColors.surface,
  },
  // Individual glass circles
  circleBtn: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  // Center spacer
  center: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  // "Back to today" pill
  backPill: {
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  backText: {
    color: AppColors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
});
