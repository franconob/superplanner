import { useState } from 'react';

import { ListFormState } from '../types';

const makeDefault = (): ListFormState => ({
  title: '',
  notes: '',
});

export function useListForm() {
  const [form, setFormState] = useState<ListFormState>(makeDefault);
  const [validationError, setValidationError] = useState<string | null>(null);

  const setField = <K extends keyof ListFormState>(key: K, value: ListFormState[K]) => {
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

  return { form, setField, validate, validationError, clearError };
}
