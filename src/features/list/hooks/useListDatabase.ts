import * as SQLite from 'expo-sqlite';

import { ListFormState } from '../types';

const db = SQLite.openDatabaseSync('superplanner.db');

db.execSync(`
  CREATE TABLE IF NOT EXISTS lists (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    title     TEXT NOT NULL,
    notes     TEXT,
    createdAt TEXT NOT NULL
  )
`);

export interface ListRecord {
  id: number;
  title: string;
  notes: string;
  createdAt: string;
}

export function useListDatabase() {
  const insertList = async (form: ListFormState): Promise<void> => {
    await db.runAsync(
      'INSERT INTO lists (title, notes, createdAt) VALUES (?, ?, ?)',
      [form.title, form.notes ?? '', new Date().toISOString()],
    );
  };

  const getLists = (): ListRecord[] => {
    return db.getAllSync<ListRecord>('SELECT * FROM lists ORDER BY createdAt DESC');
  };

  return { insertList, getLists };
}
