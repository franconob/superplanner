import React, { useEffect, useRef, useState } from 'react';
import {
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { CalendarDay } from '../types';

interface WeekStripProps {
  days: CalendarDay[];
  onSelectDay: (date: Date) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
}

const SWIPE_THRESHOLD = 40;
const ANIM_DURATION = 300;
const EASING = Easing.out(Easing.cubic);

export function WeekStrip({ days, onSelectDay, onPrevWeek, onNextWeek }: WeekStripProps) {
  const { width: screenWidth } = useWindowDimensions();
  const cellWidth = Math.floor(screenWidth / 7);

  // Internal displayed days — updated when animation starts
  const [displayedDays, setDisplayedDays] = useState(days);
  const [outgoingDays, setOutgoingDays] = useState<CalendarDay[] | null>(null);

  const inX = useSharedValue(0);
  const outX = useSharedValue(0);

  // Track the first date of the currently displayed week to detect changes + direction
  const prevFirstDate = useRef<Date>(days[0]?.date ?? new Date());
  const displayedDaysRef = useRef(displayedDays);
  useEffect(() => { displayedDaysRef.current = displayedDays; }, [displayedDays]);

  useEffect(() => {
    const newFirst = days[0]?.date;
    if (!newFirst) return;
    if (newFirst.toISOString() === prevFirstDate.current.toISOString()) {
      // Same week — just sync selection/today flags, no animation needed
      setDisplayedDays(days);
      return;
    }

    const isForward = newFirst > prevFirstDate.current;
    prevFirstDate.current = newFirst;

    const offScreen = isForward ? screenWidth : -screenWidth;

    // Snapshot outgoing, set incoming
    setOutgoingDays(displayedDaysRef.current);
    setDisplayedDays(days);

    // Incoming: jump to off-screen start, then slide to 0
    inX.set(offScreen);
    inX.set(withTiming(0, { duration: ANIM_DURATION, easing: EASING }));

    // Outgoing: slide to opposite off-screen side
    outX.set(0);
    outX.set(withTiming(-offScreen, { duration: ANIM_DURATION, easing: EASING }));

    const timer = setTimeout(() => setOutgoingDays(null), ANIM_DURATION + 50);
    return () => clearTimeout(timer);
  }, [days]);

  const incomingStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: inX.get() }],
  }));

  const outgoingStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: outX.get() }],
  }));

  // Use refs for PanResponder callbacks to avoid stale closures
  const onNextWeekRef = useRef(onNextWeek);
  const onPrevWeekRef = useRef(onPrevWeek);
  useEffect(() => { onNextWeekRef.current = onNextWeek; }, [onNextWeek]);
  useEffect(() => { onPrevWeekRef.current = onPrevWeek; }, [onPrevWeek]);

  const swipeFiredRef = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, { dx, dy }) =>
        Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy),
      onPanResponderGrant: () => {
        swipeFiredRef.current = false;
      },
      onPanResponderMove: (_, { dx }) => {
        if (swipeFiredRef.current) return;
        if (dx < -SWIPE_THRESHOLD) {
          swipeFiredRef.current = true;
          onNextWeekRef.current();
        } else if (dx > SWIPE_THRESHOLD) {
          swipeFiredRef.current = true;
          onPrevWeekRef.current();
        }
      },
    })
  ).current;

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {outgoingDays && (
        <Animated.View style={[styles.row, StyleSheet.absoluteFill, outgoingStyle]}>
          {outgoingDays.map(item => (
            <DayCell key={item.date.toISOString()} day={item} onPress={() => {}} width={cellWidth} />
          ))}
        </Animated.View>
      )}
      <Animated.View style={[styles.row, incomingStyle]}>
        {displayedDays.map(item => (
          <DayCell
            key={item.date.toISOString()}
            day={item}
            onPress={() => onSelectDay(item.date)}
            width={cellWidth}
          />
        ))}
      </Animated.View>
    </View>
  );
}

function DayCell({ day, onPress, width }: { day: CalendarDay; onPress: () => void; width: number }) {
  const baseTextColor = day.isWeekend ? '#666666' : '#ffffff';
  const labelColor = day.isSelected ? '#ffffff' : baseTextColor;
  const numberColor = day.isSelected ? '#ffffff' : day.isToday ? '#3B82F6' : baseTextColor;

  return (
    <TouchableOpacity onPress={onPress} style={[styles.cell, { width }]}>
      <Text style={[styles.label, { color: labelColor }]}>{day.label}</Text>
      <View style={[styles.numberContainer, day.isSelected && styles.selectedCircle]}>
        <Text style={[styles.number, { color: numberColor }]}>{day.dayNumber}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2A2A2A',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
  numberContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCircle: {
    backgroundColor: '#3B82F6',
  },
  number: {
    fontSize: 15,
    fontWeight: '500',
  },
});
