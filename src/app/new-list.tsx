import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppColors } from '@/constants/theme';
import { useListDatabase } from '@/features/list/hooks/useListDatabase';
import { useListForm } from '@/features/list/hooks/useListForm';
import { ValidationModal } from '@/features/task/components/ValidationModal';

export default function NewListScreen() {
  const { form, setField, validate, validationError, clearError } = useListForm();
  const { insertList } = useListDatabase();

  const handleSave = async () => {
    if (!validate()) return;
    await insertList(form);
    router.back();
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {/* NavBar */}
        <View style={styles.navBar}>
          <Pressable onPress={() => router.back()} style={styles.cancelBtn} hitSlop={8}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          <Text style={styles.navTitle}>New list</Text>
          <Pressable onPress={handleSave} style={styles.saveBtn} hitSlop={4}>
            <Text style={styles.saveText}>Save</Text>
          </Pressable>
        </View>

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
            {/* Icon preview */}
            <View style={styles.iconPreview}>
              <View style={styles.iconCircle}>
                <SymbolView name="list.bullet" size={36} tintColor="#FFFFFF" />
              </View>
            </View>

            {/* Title + Notes card */}
            <View style={styles.card}>
              <TextInput
                style={styles.titleInput}
                placeholder="Title"
                placeholderTextColor={AppColors.textSecondary}
                value={form.title}
                onChangeText={v => setField('title', v)}
                returnKeyType="next"
                autoFocus
              />
              <View style={styles.separator} />
              <TextInput
                style={styles.notesInput}
                placeholder="Notes"
                placeholderTextColor={AppColors.textSecondary}
                value={form.notes}
                onChangeText={v => setField('notes', v)}
                multiline
                returnKeyType="done"
              />
            </View>

            {/* Color + Icon card (PRO) */}
            <View style={styles.card}>
              {/* Color row */}
              <View style={styles.proRow}>
                <Text style={styles.proRowLabel}>Color</Text>
                <View style={styles.proRowRight}>
                  <View style={styles.proBadge}>
                    <Text style={styles.proText}>PRO</Text>
                  </View>
                  <Switch
                    value={false}
                    disabled
                    trackColor={{ false: AppColors.toggleTrack, true: AppColors.accent }}
                    thumbColor="#FFFFFF"
                    style={styles.disabledSwitch}
                  />
                </View>
              </View>

              <View style={styles.separator} />

              {/* Icon row */}
              <View style={styles.proRow}>
                <Text style={styles.proRowLabel}>Icon</Text>
                <View style={styles.proRowRight}>
                  <View style={styles.proBadge}>
                    <Text style={styles.proText}>PRO</Text>
                  </View>
                  <SymbolView name="chevron.right" size={14} tintColor={AppColors.textSecondary} />
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {validationError != null && (
        <ValidationModal message={validationError} onDismiss={clearError} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  // NavBar
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cancelBtn: {
    backgroundColor: '#000000',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: '#3A3A3A',
  },
  cancelText: {
    color: AppColors.accent,
    fontSize: 15,
    fontWeight: '500',
  },
  navTitle: {
    flex: 1,
    color: AppColors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  saveBtn: {
    backgroundColor: AppColors.accent,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 18,
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  // Content
  content: {
    padding: 16,
    gap: 8,
    paddingBottom: 40,
  },
  // Icon preview
  iconPreview: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: AppColors.iconGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Form card
  card: {
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
    marginHorizontal: 16,
  },
  // PRO rows
  proRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 52,
  },
  proRowLabel: {
    flex: 1,
    color: AppColors.textPrimary,
    fontSize: 15,
  },
  proRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
});
