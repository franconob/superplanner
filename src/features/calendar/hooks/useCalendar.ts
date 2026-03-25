import { useMemo, useState } from 'react';

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function useCalendar() {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [selectedDate, setSelectedDate] = useState<Date>(today);

  const title = useMemo(() => {
    if (isSameDay(selectedDate, today)) return 'Today';
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (isSameDay(selectedDate, yesterday)) return 'Yesterday';
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (isSameDay(selectedDate, tomorrow)) return 'Tomorrow';
    const day = selectedDate.getDate();
    const suffix = getOrdinalSuffix(day);
    const month = MONTH_NAMES[selectedDate.getMonth()];
    const year = selectedDate.getFullYear();
    return `${month} ${day}${suffix}, ${year}`;
  }, [selectedDate, today]);

  const isToday = useMemo(() => isSameDay(selectedDate, today), [selectedDate, today]);

  const goToToday = () => setSelectedDate(today);

  return { selectedDate, setSelectedDate, title, isToday, goToToday, today };
}
