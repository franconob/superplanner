export interface Task {
  id: number;
  title: string;
  notes: string;
  date: string | null;
  isFavorite: boolean;
  isCompleted: boolean;
  createdAt: string;
}

export interface TaskFormState {
  title: string;
  notes: string;
  hasDate: boolean;
  date: Date;
  isFavorite: boolean;
  isActivityLinked: boolean;
  selectedListId: number | null;
  selectedListTitle: string | null;
}
