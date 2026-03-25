import { useState } from 'react';

import { TaskFormState } from '../types';

const makeDefault = (): TaskFormState => ({
  title: '',
  notes: '',
  hasDate: true,
  date: new Date(),
  isFavorite: false,
  isActivityLinked: false,
  selectedListId: null,
  selectedListTitle: null,
});

export function useTaskForm() {
  const [form, setFormState] = useState<TaskFormState>(makeDefault);
  const [validationError, setValidationError] = useState<string | null>(null);

  const setField = <K extends keyof TaskFormState>(key: K, value: TaskFormState[K]) => {
    setFormState(prev => ({ ...prev, [key]: value }));
  };

  const validate = (): boolean => {
    if (!form.title.trim()) {
      setValidationError('Please enter a title before saving.');
      return false;
    }
    return true;
  };

  const clearError = () => setValidationError(null);

  const reset = () => {
    setFormState(makeDefault());
    setValidationError(null);
  };

  return { form, setField, validate, validationError, clearError, reset };
}
