export interface Activity {
  id: number;
  title: string;
  notes: string;
  startDate: string;
  endDate: string;
  notificationEnabled: number;
  createdAt: string;
}

export interface ActivityFormState {
  title: string;
  notes: string;
  startDate: Date;
  endDate: Date;
  notificationEnabled: boolean;
}
