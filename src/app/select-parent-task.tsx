import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppColors } from '@/constants/theme';

export default function SelectParentTaskScreen() {
  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        {/* Nav bar */}
        <View style={styles.navBar}>
          <Pressable onPress={() => router.back()} style={styles.closeBtn}>
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
          <Text style={styles.title}>Parent task</Text>
          {/* Spacer to balance layout */}
          <View style={styles.navSpacer} />
        </View>

        {/* Empty body */}
        <View style={styles.body} />

        {/* Search bar at bottom */}
        <View style={styles.searchWrap}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor={AppColors.textSecondary}
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
  safeArea: {
    flex: 1,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeBtn: {
    backgroundColor: AppColors.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    minWidth: 60,
    alignItems: 'center',
  },
  closeText: {
    color: AppColors.accent,
    fontSize: 15,
    fontWeight: '500',
  },
  title: {
    flex: 1,
    color: AppColors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  navSpacer: {
    minWidth: 60,
  },
  body: {
    flex: 1,
  },
  searchWrap: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.surface,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchIcon: {
    color: AppColors.textSecondary,
    fontSize: 18,
  },
  searchInput: {
    flex: 1,
    color: AppColors.textPrimary,
    fontSize: 15,
  },
});
