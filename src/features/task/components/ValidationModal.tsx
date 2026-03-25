import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { AppColors } from '@/constants/theme';

interface Props {
  message: string;
  onDismiss: () => void;
}

export function ValidationModal({ message, onDismiss }: Props) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.85);

  useEffect(() => {
    opacity.set(withTiming(1, { duration: 180 }));
    scale.set(withSpring(1, { damping: 16, stiffness: 220 }));
  }, []);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: opacity.get() }));
  const cardStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} />
      </Animated.View>

      <Animated.View style={[styles.card, cardStyle]}>
        <Text style={styles.cardTitle}>Validation error</Text>
        <Text style={styles.cardMessage}>{message}</Text>
        <Pressable style={styles.okBtn} onPress={onDismiss}>
          <Text style={styles.okText}>OK</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  backdrop: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  card: {
    backgroundColor: AppColors.surface,
    borderRadius: 20,
    width: 300,
    paddingVertical: 24,
    paddingHorizontal: 20,
    gap: 12,
    boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
  },
  cardTitle: {
    color: AppColors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  cardMessage: {
    color: AppColors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  okBtn: {
    backgroundColor: AppColors.surfaceElevated,
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 4,
    alignItems: 'center',
  },
  okText: {
    color: AppColors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
});
