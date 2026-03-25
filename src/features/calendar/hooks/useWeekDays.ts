import { useMemo, useState } from 'react';

import { CalendarDay } from '../types';

// Weekday abbreviations: Mon=M, Tue=T, Wed=W, Thu=T, Fri=F, Sat=S, Sun=S
const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']; // index 0 = Sunday

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day; // shift so Monday = start
  d.setDate(d.getDate() + diff);
  return d;
}

export function useWeekDays(selectedDate: Date, today: Date) {
  const [weekStart, setWeekStart] = useState<Date>(() =>
    getMondayOfWeek(selectedDate)
  );

  const days: CalendarDay[] = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const dow = date.getDay(); // 0=Sun,6=Sat
      return {
        date,
        label: DAY_LABELS[dow],
        dayNumber: date.getDate(),
        isSelected: isSameDay(date, selectedDate),
        isToday: isSameDay(date, today),
        isWeekend: dow === 0 || dow === 6,
      };
    });
  }, [weekStart, selectedDate, today]);

  const goToPrevWeek = () => {
    setWeekStart(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  };

  const goToNextWeek = () => {
    setWeekStart(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  };

  const syncWeekToDate = (date: Date) => {
    setWeekStart(getMondayOfWeek(date));
  };

  return { days, goToPrevWeek, goToNextWeek, syncWeekToDate };
}
