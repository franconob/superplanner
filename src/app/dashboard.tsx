import { GlassView } from 'expo-glass-effect';
import { SymbolView } from 'expo-symbols';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppColors } from '@/constants/theme';
import { glassAvailable } from '@/utils/glass';
import { useTaskDatabase } from '@/features/task/hooks/useTaskDatabase';
import { useListDatabase, ListRecord } from '@/features/list/hooks/useListDatabase';

interface TileProps {
  label: string;
  iconName: string;
  iconBgColor: string;
  count: number;
  onPress: () => void;
  badge?: string;
}

function DashboardTile({ label, iconName, iconBgColor, count, onPress, badge }: TileProps) {
  return (
    <Pressable style={styles.tile} onPress={onPress}>
      {/* Count badge top-right */}
      <View style={styles.tileBadgeRow}>
        <View style={styles.tileBadge}>
          <Text style={styles.tileBadgeText}>{count}</Text>
        </View>
      </View>

      {/* Icon */}
      <View style={[styles.tileIconWrap, { backgroundColor: iconBgColor }]}>
        <SymbolView name={iconName as any} size={20} tintColor="#FFFFFF" />
      </View>

      {/* Label row */}
      <View style={styles.tileLabelRow}>
        <Text style={styles.tileLabel}>{label}</Text>
        {badge && (
          <View style={styles.updateBadge}>
            <Text style={styles.updateBadgeText}>{badge}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

export default function DashboardScreen() {
  const { getTaskCounts } = useTaskDatabase();
  const { getLists } = useListDatabase();
  const [counts, setCounts] = useState({ inbox: 0, favorites: 0, pastDue: 0 });
  const [lists, setLists] = useState<ListRecord[]>([]);
  const [search, setSearch] = useState('');

  const load = useCallback(() => {
    setCounts(getTaskCounts());
    setLists(getLists());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFocusEffect(useCallback(() => {
    load();
  }, [load]));

  const filteredLists = search.trim()
    ? lists.filter(l => l.title.toLowerCase().includes(search.toLowerCase()))
    : lists;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Search bar */}
          {glassAvailable ? (
            <GlassView style={styles.searchBar} glassEffectStyle="regular">
              <SymbolView name="magnifyingglass" size={16} tintColor={AppColors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search"
                placeholderTextColor={AppColors.textSecondary}
                value={search}
                onChangeText={setSearch}
              />
            </GlassView>
          ) : (
            <View style={styles.searchBar}>
              <SymbolView name="magnifyingglass" size={16} tintColor={AppColors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search"
                placeholderTextColor={AppColors.textSecondary}
                value={search}
                onChangeText={setSearch}
              />
            </View>
          )}

          {/* Tiles grid */}
          <View style={styles.grid}>
            <DashboardTile
              label="Calendar"
              iconName="calendar"
              iconBgColor="#4F46E5"
              count={0}
              onPress={() => router.push('/')}
            />
            <DashboardTile
              label="Inbox"
              iconName="tray"
              iconBgColor="#8B7355"
              count={counts.inbox}
              onPress={() => router.push('/inbox')}
            />
            <DashboardTile
              label="Favorites"
              iconName="star.fill"
              iconBgColor={AppColors.iconOrange}
              count={counts.favorites}
              onPress={() => router.push('/favourites')}
            />
            <DashboardTile
              label="Past Due"
              iconName="flag.fill"
              iconBgColor={AppColors.iconRed}
              count={counts.pastDue}
              onPress={() => router.push('/past-due')}
            />
            <DashboardTile
              label="Plan subtasks"
              iconName="iphone"
              iconBgColor="#30D158"
              count={0}
              onPress={() => {}}
            />
            <DashboardTile
              label="Settings"
              iconName="gearshape.fill"
              iconBgColor={AppColors.iconGrey}
              count={0}
              onPress={() => {}}
              badge="UPDATE"
            />
          </View>

          {/* Lists section */}
          <Text style={styles.sectionHeader}>Lists</Text>

          {filteredLists.length === 0 && !search.trim() && (
            <Text style={styles.emptyLists}>No lists yet</Text>
          )}

          {filteredLists.map(list => (
            <Pressable key={list.id} style={styles.listRow}>
              <View style={styles.listIconWrap}>
                <SymbolView name="line.3.horizontal" size={16} tintColor={AppColors.textSecondary} />
              </View>
              <Text style={styles.listTitle}>{list.title}</Text>
              <Text style={styles.listCount}>0</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Add list button */}
        <View style={styles.bottomBar}>
          <Pressable style={styles.addListBtn} onPress={() => router.push('/new-list')}>
            <Text style={styles.addListText}>Add list</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const TILE_GAP = 12;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: glassAvailable ? 'transparent' : AppColors.surfaceElevated,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  searchInput: {
    flex: 1,
    color: AppColors.textPrimary,
    fontSize: 15,
    padding: 0,
  },
  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: TILE_GAP,
    marginBottom: 28,
  },
  tile: {
    width: `${(100 - TILE_GAP / 2) / 2}%` as any,
    aspectRatio: 1.65,
    backgroundColor: AppColors.surfaceElevated,
    borderRadius: 16,
    padding: 12,
    justifyContent: 'flex-end',
  },
  tileBadgeRow: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  tileBadge: {
    backgroundColor: AppColors.surface,
    borderRadius: 10,
    minWidth: 24,
    paddingHorizontal: 6,
    paddingVertical: 3,
    alignItems: 'center',
  },
  tileBadgeText: {
    color: AppColors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  tileIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  tileLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  tileLabel: {
    color: AppColors.textPrimary,
    fontSize: 13,
    fontWeight: '500',
  },
  updateBadge: {
    backgroundColor: AppColors.accent,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  updateBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  // Lists section
  sectionHeader: {
    color: AppColors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  emptyLists: {
    color: AppColors.textSecondary,
    fontSize: 14,
    marginLeft: 4,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: AppColors.separator,
  },
  listIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: AppColors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listTitle: {
    flex: 1,
    color: AppColors.textPrimary,
    fontSize: 15,
  },
  listCount: {
    color: AppColors.textSecondary,
    fontSize: 14,
  },
  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    paddingHorizontal: 16,
    paddingBottom: 36,
    paddingTop: 8,
    alignItems: 'flex-end',
  },
  addListBtn: {
    backgroundColor: AppColors.accent,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  addListText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
