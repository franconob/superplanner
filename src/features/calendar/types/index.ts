export interface CalendarDay {
  date: Date;
  label: string; // abbreviated weekday: M, T, W, T, F, S, S
  dayNumber: number;
  isSelected: boolean;
  isToday: boolean;
  isWeekend: boolean;
}
