import { useCallback } from 'react';
import * as SQLite from 'expo-sqlite';

import { Activity, ActivityFormState } from '../types';

const db = SQLite.openDatabaseSync('superplanner.db');

db.execSync(`
  CREATE TABLE IF NOT EXISTS activities (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    title               TEXT NOT NULL,
    notes               TEXT,
    startDate           TEXT NOT NULL,
    endDate             TEXT NOT NULL,
    notificationEnabled INTEGER DEFAULT 1,
    createdAt           TEXT NOT NULL
  )
`);

export function useActivityDatabase() {
  const insertActivity = useCallback(async (form: ActivityFormState): Promise<void> => {
    await db.runAsync(
      'INSERT INTO activities (title, notes, startDate, endDate, notificationEnabled, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
      [
        form.title,
        form.notes ?? '',
        form.startDate.toISOString(),
        form.endDate.toISOString(),
        form.notificationEnabled ? 1 : 0,
        new Date().toISOString(),
      ],
    );
  }, []);

  const getActivities = useCallback((): Activity[] => {
    return db.getAllSync<Activity>('SELECT * FROM activities ORDER BY startDate ASC');
  }, []);

  const deleteActivity = useCallback(async (id: number): Promise<void> => {
    await db.runAsync('DELETE FROM activities WHERE id = ?', [id]);
  }, []);

  return { insertActivity, getActivities, deleteActivity };
}
