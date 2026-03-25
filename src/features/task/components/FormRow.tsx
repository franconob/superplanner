import { SymbolView } from 'expo-symbols';
import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { AppColors } from '@/constants/theme';

export type RightControl = 'toggle' | 'chevron' | 'picker-arrows' | 'none';

interface FormRowProps {
  iconName: string;
  iconBgColor: string;
  label: string;
  subtitle?: string;
  subtitleColor?: string;
  labelColor?: string;
  rightLabel?: string;
  rightLabelColor?: string;
  rightControl: RightControl;
  value?: boolean;
  onValueChange?: (v: boolean) => void;
  onPress?: () => void;
  disabled?: boolean;
  isPro?: boolean;
}

export function FormRow({
  iconName,
  iconBgColor,
  label,
  subtitle,
  subtitleColor,
  labelColor,
  rightLabel,
  rightLabelColor,
  rightControl,
  value,
  onValueChange,
  onPress,
  disabled = false,
  isPro = false,
}: FormRowProps) {
  return (
    <Pressable
      style={styles.row}
      onPress={!disabled && (rightControl === 'chevron' || rightControl === 'picker-arrows') ? onPress : undefined}
      disabled={disabled}
    >
      {/* Icon */}
      <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
        <SymbolView name={iconName as any} size={17} tintColor="#FFFFFF" />
      </View>

      {/* Label + subtitle */}
      <View style={styles.labelWrap}>
        <Text style={[styles.label, disabled && styles.labelDisabled, labelColor ? { color: labelColor } : undefined]}>{label}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, subtitleColor ? { color: subtitleColor } : undefined]}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {/* Right label (e.g. selected value) */}
      {rightLabel ? (
        <Text style={[styles.rightLabel, rightLabelColor ? { color: rightLabelColor } : undefined]}>
          {rightLabel}
        </Text>
      ) : null}

      {/* PRO badge */}
      {isPro && (
        <View style={styles.proBadge}>
          <Text style={styles.proText}>PRO</Text>
        </View>
      )}

      {/* Right control */}
      {rightControl === 'toggle' && (
        <Switch
          value={value ?? false}
          onValueChange={onValueChange}
          disabled={disabled}
          trackColor={{ false: AppColors.toggleTrack, true: AppColors.accent }}
          thumbColor="#FFFFFF"
          style={disabled ? styles.disabledSwitch : undefined}
        />
      )}
      {rightControl === 'chevron' && (
        <SymbolView name="chevron.right" size={14} tintColor={AppColors.textSecondary} />
      )}
      {rightControl === 'picker-arrows' && (
        <SymbolView name="chevron.up.chevron.down" size={14} tintColor={AppColors.textSecondary} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 52,
    gap: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelWrap: {
    flex: 1,
    gap: 2,
  },
  label: {
    color: AppColors.textPrimary,
    fontSize: 15,
  },
  labelDisabled: {
    color: AppColors.textSecondary,
  },
  subtitle: {
    color: AppColors.textSecondary,
    fontSize: 12,
  },
  proBadge: {
    backgroundColor: AppColors.proBadge,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  proText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  disabledSwitch: {
    opacity: 0.4,
  },
  rightLabel: {
    color: AppColors.textSecondary,
    fontSize: 15,
  },
});
