import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppColors } from '@/constants/theme';

import { ActivityBottomSheet } from '@/features/task/components/ActivityBottomSheet';
import { ListBottomSheet } from '@/features/task/components/ListBottomSheet';
import { TaskFormBody } from '@/features/task/components/TaskFormBody';
import { TaskHeaderMenu } from '@/features/task/components/TaskHeaderMenu';
import { TaskNavBar } from '@/features/task/components/TaskNavBar';
import { ValidationModal } from '@/features/task/components/ValidationModal';
import { useTaskDatabase } from '@/features/task/hooks/useTaskDatabase';
import { useTaskForm } from '@/features/task/hooks/useTaskForm';

export default function AddTaskScreen() {
  const { form, setField, validate, validationError, clearError } = useTaskForm();
  const { insertTask } = useTaskDatabase();

  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [showActivitySheet, setShowActivitySheet] = useState(false);
  const [showListSheet, setShowListSheet] = useState(false);

  const handleSave = async () => {
    if (!validate()) return;
    await insertTask(form);
    router.back();
  };

  const handleSaveAndOpen = async () => {
    if (!validate()) return;
    await insertTask(form);
    router.back();
    // TODO: navigate to task detail once that screen exists
  };

  const handleSaveAndAddAnother = async () => {
    if (!validate()) return;
    await insertTask(form);
    // TODO: reset form for next task entry
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <TaskNavBar
          onCancel={() => router.back()}
          onSave={handleSave}
          onMenuPress={() => setShowHeaderMenu(true)}
        />
        <TaskFormBody
          form={form}
          onFieldChange={setField}
          onActivityRowPress={() => setShowActivitySheet(true)}
          onListRowPress={() => setShowListSheet(true)}
          onParentTaskPress={() => router.push('/select-parent-task')}
        />
      </SafeAreaView>

      {/* ··· Floating header menu */}
      <TaskHeaderMenu
        visible={showHeaderMenu}
        onClose={() => setShowHeaderMenu(false)}
        onSaveAndOpen={handleSaveAndOpen}
        onSaveAndAddAnother={handleSaveAndAddAnother}
      />

      {/* Activity bottom sheet */}
      <ActivityBottomSheet
        visible={showActivitySheet}
        onClose={() => setShowActivitySheet(false)}
      />

      {/* List bottom sheet */}
      <ListBottomSheet
        visible={showListSheet}
        onClose={() => setShowListSheet(false)}
        onNewList={() => setTimeout(() => router.push('/new-list'), 300)}
        selectedListId={form.selectedListId}
        onSelectList={list => {
          setField('selectedListId', list.id);
          setField('selectedListTitle', list.title);
        }}
      />

      {/* Validation error */}
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
});
