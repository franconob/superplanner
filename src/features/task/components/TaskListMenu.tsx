import { GlassView } from 'expo-glass-effect';
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
import { glassAvailable } from '@/utils/glass';

interface Props {
  visible: boolean;
  onClose: () => void;
  onCompleteAll: () => void;
}

const CARD_WIDTH = 260;

export function TaskListMenu({ visible, onClose, onCompleteAll }: Props) {
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
      const t = setTimeout(() => setMounted(false), 150);
      return () => clearTimeout(t);
    }
  }, [visible]);

  const menuStyle = useAnimatedStyle(() => ({
    opacity: opacity.get(),
    transform: [
      { translateX: CARD_WIDTH / 2 },
      { translateY: -20 },
      { scale: scale.get() },
      { translateX: -(CARD_WIDTH / 2) },
      { translateY: 20 },
    ],
  }));

  if (!mounted) return null;

  const items = [
    { icon: 'circle', label: 'Select tasks' },
    { icon: 'plus.circle', label: 'New section' },
    { icon: 'rectangle.3.offgrid', label: 'Manage sections' },
    { icon: 'calendar', label: 'View all upcoming tasks in...' },
    { icon: 'arrow.up.arrow.down', label: 'Sort by', hasChevron: true },
    { icon: 'checkmark.circle', label: 'Complete all tasks', onPress: onCompleteAll },
  ];

  return (
    <>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <Animated.View style={[styles.card, menuStyle]}>
        {glassAvailable && (
          <GlassView style={[StyleSheet.absoluteFill, { borderRadius: 16 }]} glassEffectStyle="regular" />
        )}
        {items.map((item, i) => (
          <React.Fragment key={item.label}>
            {i > 0 && <View style={styles.separator} />}
            <Pressable
              style={styles.item}
              onPress={() => { item.onPress?.(); onClose(); }}
            >
              <SymbolView name={item.icon as any} size={18} tintColor={AppColors.accent} />
              <Text style={styles.itemText}>{item.label}</Text>
              {item.hasChevron && (
                <SymbolView name="chevron.right" size={13} tintColor={AppColors.textSecondary} />
              )}
            </Pressable>
          </React.Fragment>
        ))}
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 50,
  },
  card: {
    position: 'absolute',
    top: 60,
    right: 12,
    width: CARD_WIDTH,
    backgroundColor: glassAvailable ? 'transparent' : AppColors.surfaceElevated,
    borderRadius: 16,
    paddingVertical: 4,
    zIndex: 51,
    overflow: 'hidden',
    boxShadow: '0 6px 12px rgba(0,0,0,0.35)',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: AppColors.separator,
    marginHorizontal: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
  },
  itemText: {
    flex: 1,
    color: AppColors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
});
