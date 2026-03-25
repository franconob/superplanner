import React from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { AppColors } from '@/constants/theme';
import { TaskFormState } from '../types';
import { DatePickerRow } from './DatePickerRow';
import { FormRow } from './FormRow';

interface Props {
  form: TaskFormState;
  onFieldChange: <K extends keyof TaskFormState>(key: K, value: TaskFormState[K]) => void;
  onActivityRowPress: () => void;
  onListRowPress: () => void;
  onParentTaskPress: () => void;
}

export function TaskFormBody({
  form,
  onFieldChange,
  onActivityRowPress,
  onListRowPress,
  onParentTaskPress,
}: Props) {
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Title + Notes card ── */}
        <View style={styles.card}>
          <TextInput
            style={styles.titleInput}
            placeholder="Title"
            placeholderTextColor={AppColors.textSecondary}
            value={form.title}
            onChangeText={v => onFieldChange('title', v)}
            returnKeyType="next"
            autoFocus
          />
          <View style={styles.inputSeparator} />
          <TextInput
            style={styles.notesInput}
            placeholder="Notes"
            placeholderTextColor={AppColors.textSecondary}
            value={form.notes}
            onChangeText={v => onFieldChange('notes', v)}
            multiline
            returnKeyType="done"
          />
        </View>

        {/* ── Form rows — each is its own card ── */}
          <View style={styles.rowCard}>
            <DatePickerRow
              value={form.date}
              enabled={form.hasDate}
              onChange={date => onFieldChange('date', date)}
              onToggle={v => onFieldChange('hasDate', v)}
            />
          </View>

          <View style={styles.rowCard}>
            <FormRow
              iconName="clock"
              iconBgColor={AppColors.accent}
              label="Associate with activity"
              rightControl="toggle"
              value={form.isActivityLinked}
              onValueChange={v => onFieldChange('isActivityLinked', v)}
            />
            {form.isActivityLinked && (
              <>
                <View style={styles.separator} />
                <FormRow
                  iconName="rectangle.stack"
                  iconBgColor={AppColors.surfaceElevated}
                  label="Select activity"
                  labelColor={AppColors.accent}
                  subtitleColor={AppColors.accent}
                  rightControl="picker-arrows"
                  onPress={onActivityRowPress}
                />
              </>
            )}
          </View>

          <View style={styles.rowCard}>
            <FormRow
              iconName="bell"
              iconBgColor={AppColors.iconYellow}
              label="Notification"
              rightControl="toggle"
              disabled
              isPro
            />
          </View>

          <View style={styles.rowCard}>
            <FormRow
              iconName="repeat"
              iconBgColor={AppColors.iconGrey}
              label="Repeat"
              subtitle="Never"
              rightControl="chevron"
              disabled
              isPro
            />
          </View>

          <View style={styles.rowCard}>
            <FormRow
              iconName="flag"
              iconBgColor={AppColors.accent}
              label="Priority"
              rightControl="picker-arrows"
              disabled
              isPro
            />
          </View>

          <View style={styles.rowCard}>
            <FormRow
              iconName="link"
              iconBgColor={AppColors.iconGrey}
              label="Parent task"
              rightControl="chevron"
              onPress={onParentTaskPress}
            />
          </View>

          <View style={styles.rowCard}>
            <FormRow
              iconName="list.bullet"
              iconBgColor={AppColors.accent}
              label="List"
              rightLabel={form.selectedListTitle ?? undefined}
              rightLabelColor={AppColors.accent}
              rightControl="picker-arrows"
              onPress={onListRowPress}
            />
            {form.selectedListId != null && (
              <>
                <View style={styles.separator} />
                <FormRow
                  iconName="list.bullet.indent"
                  iconBgColor={AppColors.surfaceElevated}
                  label="Section in list"
                  rightControl="picker-arrows"
                  disabled
                />
              </>
            )}
          </View>

          <View style={styles.rowCard}>
            <FormRow
              iconName="star"
              iconBgColor={AppColors.iconOrange}
              label="Mark as favorite"
              rightControl="toggle"
              value={form.isFavorite}
              onValueChange={v => onFieldChange('isFavorite', v)}
            />
          </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    padding: 16,
    gap: 8,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: AppColors.surfaceElevated,
    borderRadius: 16,
    overflow: 'hidden',
  },
  rowCard: {
    backgroundColor: AppColors.surfaceElevated,
    borderRadius: 16,
    overflow: 'hidden',
  },
  titleInput: {
    color: AppColors.textPrimary,
    fontSize: 22,
    fontWeight: '400',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    minHeight: 56,
  },
  inputSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: AppColors.separator,
    marginHorizontal: 16,
  },
  notesInput: {
    color: AppColors.textSecondary,
    fontSize: 15,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    minHeight: 56,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: AppColors.separator,
    marginLeft: 60,
  },
});
