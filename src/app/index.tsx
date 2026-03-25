import { useFocusEffect, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomBar } from '@/features/calendar/components/BottomBar';
import { NavBar } from '@/features/calendar/components/NavBar';
import { PlusButtonMenu } from '@/features/calendar/components/PlusButtonMenu';
import { TimeColumn } from '@/features/calendar/components/TimeColumn';
import { WeekStrip } from '@/features/calendar/components/WeekStrip';
import { useCalendar } from '@/features/calendar/hooks/useCalendar';
import { useCurrentTime } from '@/features/calendar/hooks/useCurrentTime';
import { usePlusButton } from '@/features/calendar/hooks/usePlusButton';
import { useWeekDays } from '@/features/calendar/hooks/useWeekDays';
import { useActivityDatabase } from '@/features/activity/hooks/useActivityDatabase';
import { Activity } from '@/features/activity/types';

export default function CalendarScreen() {
  const { selectedDate, setSelectedDate, title, isToday, goToToday, today } = useCalendar();
  const { getActivities } = useActivityDatabase();
  const [activities, setActivities] = useState<Activity[]>([]);

  const loadActivities = useCallback(() => {
    const all = getActivities();
    const dateStr = selectedDate.toDateString();
    setActivities(all.filter(a => new Date(a.startDate).toDateString() === dateStr));
  }, [getActivities, selectedDate]);

  useFocusEffect(useCallback(() => {
    loadActivities();
  }, [loadActivities]));
  const { currentTime } = useCurrentTime();
  const { days, goToPrevWeek, goToNextWeek } = useWeekDays(selectedDate, today);
  const {
    isOpen,
    openMenu,
    closeMenu,
    bottomBarAnimatedStyle,
    menuContainerAnimatedStyle,
    item1AnimatedStyle,
    item2AnimatedStyle,
  } = usePlusButton();

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <NavBar title={title} />
        <WeekStrip
          days={days}
          onSelectDay={setSelectedDate}
          onPrevWeek={goToPrevWeek}
          onNextWeek={goToNextWeek}
        />
        <TimeColumn currentTime={currentTime} activities={activities} />
      </SafeAreaView>

      <BottomBar
        isToday={isToday}
        onBackToToday={goToToday}
        onPlusPress={openMenu}
        onListPress={() => router.push('/activity-list')}
        animatedStyle={bottomBarAnimatedStyle}
      />

      {isOpen && (
        <PlusButtonMenu
          onClose={closeMenu}
          menuContainerAnimatedStyle={menuContainerAnimatedStyle}
          item1AnimatedStyle={item1AnimatedStyle}
          item2AnimatedStyle={item2AnimatedStyle}
        />
      )}
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
});
