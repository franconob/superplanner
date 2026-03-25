import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

import { Task, TaskFormState } from '../types';

// Widget is iOS-only — import lazily to avoid issues on other platforms
function refreshAnytimeWidget() {
  if (Platform.OS !== 'ios') return;
  try {
    const AnytimeWidget = require('../../../../widgets/AnytimeWidget').default;
    const rows = db.getAllSync<{ id: number; title: string }>(
      'SELECT id, title FROM tasks WHERE isCompleted = 0 AND date IS NULL ORDER BY createdAt DESC',
    );
    AnytimeWidget.updateSnapshot({ tasks: rows });
  } catch {
    // Widget not available in this build
  }
}

const db = SQLite.openDatabaseSync('superplanner.db');

db.execSync(`
  CREATE TABLE IF NOT EXISTS tasks (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT NOT NULL,
    notes       TEXT,
    date        TEXT,
    isFavorite  INTEGER DEFAULT 0,
    isCompleted INTEGER DEFAULT 0,
    createdAt   TEXT NOT NULL
  )
`);

// Migration: add isCompleted column if it doesn't exist
try {
  db.execSync('ALTER TABLE tasks ADD COLUMN isCompleted INTEGER DEFAULT 0');
} catch {
  // Column already exists
}

export function useTaskDatabase() {
  const insertTask = async (form: TaskFormState): Promise<void> => {
    const date = form.hasDate ? form.date.toISOString().split('T')[0] : null;
    await db.runAsync(
      'INSERT INTO tasks (title, notes, date, isFavorite, createdAt) VALUES (?, ?, ?, ?, ?)',
      [form.title, form.notes ?? '', date, form.isFavorite ? 1 : 0, new Date().toISOString()],
    );
    refreshAnytimeWidget();
  };

  const getTasks = (): Task[] => {
    const rows = db.getAllSync<any>('SELECT * FROM tasks ORDER BY createdAt DESC');
    return rows.map(r => ({ ...r, isFavorite: !!r.isFavorite, isCompleted: !!r.isCompleted }));
  };

  const getInboxTasks = (): Task[] => {
    const today = new Date().toISOString().split('T')[0];
    const rows = db.getAllSync<any>(
      'SELECT * FROM tasks WHERE isCompleted = 0 AND (date IS NULL OR date = ?) ORDER BY createdAt DESC',
      [today],
    );
    return rows.map(r => ({ ...r, isFavorite: !!r.isFavorite, isCompleted: !!r.isCompleted }));
  };

  const getFavoriteTasks = (): Task[] => {
    const rows = db.getAllSync<any>(
      'SELECT * FROM tasks WHERE isFavorite = 1 AND isCompleted = 0 ORDER BY createdAt DESC',
    );
    return rows.map(r => ({ ...r, isFavorite: !!r.isFavorite, isCompleted: !!r.isCompleted }));
  };

  const getPastDueTasks = (): Task[] => {
    const today = new Date().toISOString().split('T')[0];
    const rows = db.getAllSync<any>(
      'SELECT * FROM tasks WHERE isCompleted = 0 AND date IS NOT NULL AND date < ? ORDER BY date DESC',
      [today],
    );
    return rows.map(r => ({ ...r, isFavorite: !!r.isFavorite, isCompleted: !!r.isCompleted }));
  };

  const getTaskCounts = () => {
    const today = new Date().toISOString().split('T')[0];
    const inbox = db.getFirstSync<{ count: number }>(
      'SELECT COUNT(*) as count FROM tasks WHERE isCompleted = 0 AND (date IS NULL OR date = ?)',
      [today],
    );
    const favorites = db.getFirstSync<{ count: number }>(
      'SELECT COUNT(*) as count FROM tasks WHERE isFavorite = 1 AND isCompleted = 0',
    );
    const pastDue = db.getFirstSync<{ count: number }>(
      'SELECT COUNT(*) as count FROM tasks WHERE isCompleted = 0 AND date IS NOT NULL AND date < ?',
      [today],
    );
    return {
      inbox: inbox?.count ?? 0,
      favorites: favorites?.count ?? 0,
      pastDue: pastDue?.count ?? 0,
    };
  };

  const toggleTaskComplete = async (id: number, isCompleted: boolean): Promise<void> => {
    await db.runAsync('UPDATE tasks SET isCompleted = ? WHERE id = ?', [isCompleted ? 1 : 0, id]);
    refreshAnytimeWidget();
  };

  return { insertTask, getTasks, getInboxTasks, getFavoriteTasks, getPastDueTasks, getTaskCounts, toggleTaskComplete };
}
