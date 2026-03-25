import { SymbolView } from 'expo-symbols';
import React, { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Activity } from '@/features/activity/types';

const HOUR_HEIGHT = 100;
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function formatHour(hour: number): string {
  return `${hour}:00`;
}

interface TimeColumnProps {
  currentTime: Date;
  activities: Activity[];
}

export function TimeColumn({ currentTime, activities }: TimeColumnProps) {
  const scrollRef = useRef<ScrollView>(null);
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();

  // Offset of the blue line from top of scroll content
  const timeIndicatorOffset = currentHour * HOUR_HEIGHT + (currentMinute / 60) * HOUR_HEIGHT;

  useEffect(() => {
    // Scroll to show current time with some padding above
    const scrollTo = Math.max(0, timeIndicatorOffset - HOUR_HEIGHT * 2);
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: scrollTo, animated: false });
    }, 100);
  }, []); // only on mount

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        {HOURS.map(hour => {
          const isCurrentHour = hour === currentHour;
          return (
            <View key={hour} style={styles.hourRow}>
              <Text style={[styles.timeLabel, isCurrentHour && styles.timeLabelCurrent]}>
                {formatHour(hour)}
              </Text>
              <View style={styles.rightArea}>
                {!isCurrentHour && <View style={styles.separator} />}
              </View>
            </View>
          );
        })}
        {/* Blue time indicator line */}
        <View style={[styles.timeIndicator, { top: timeIndicatorOffset }]}>
          <View style={styles.timeIndicatorDot} />
          <View style={styles.timeIndicatorLine} />
        </View>

        {/* Activity blocks */}
        {activities.map(activity => {
          const start = new Date(activity.startDate);
          const end = new Date(activity.endDate);
          const startMins = start.getHours() * 60 + start.getMinutes();
          const durationMins = Math.max(15, Math.round((end.getTime() - start.getTime()) / 60000));
          const top = (startMins / 60) * HOUR_HEIGHT;
          const height = Math.max(44, (durationMins / 60) * HOUR_HEIGHT);
          return (
            <View key={activity.id} style={[styles.activityBlock, { top, height }]}>
              <Text style={styles.activityTitle} numberOfLines={2}>{activity.title}</Text>
              {!!activity.notificationEnabled && (
                <SymbolView
                  name="bell.fill"
                  size={12}
                  tintColor="#8E8E93"
                  style={styles.activityBell}
                />
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    position: 'relative',
    paddingBottom: 40,
  },
  hourRow: {
    height: HOUR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 0,
  },
  timeLabel: {
    width: 52,
    paddingLeft: 16,
    paddingTop: 4,
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '400',
  },
  timeLabelCurrent: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  rightArea: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 12,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#2A2A2A',
  },
  timeIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    marginLeft: 46,
  },
  timeIndicatorLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#3B82F6',
  },
  activityBlock: {
    position: 'absolute',
    left: 58,
    right: 8,
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    padding: 8,
    overflow: 'hidden',
  },
  activityTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  activityBell: {
    position: 'absolute',
    bottom: 6,
    right: 6,
  },
});
