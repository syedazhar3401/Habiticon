/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Course {
  id: string;
  code: string; // e.g., WIX1003
  name: string;
  lecturer: string;
  semester: string;
  credits: number;
  location: string;
  color: string; // Tailwind bg color class prefix, e.g. "emerald", "fuchsia", "sky", etc.
}

export interface CalendarEvent {
  id: string;
  title: string;
  courseId?: string; // Optional course link
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  location: string;
  description: string;
  recurring: 'none' | 'daily' | 'weekly' | 'monthly';
  category: 'class' | 'exam' | 'meeting' | 'study_session' | 'other';
  reminderMinutes: number; // custom reminder e.g. 15, 30, 60, 1440
}

export interface Task {
  id: string;
  title: string;
  courseId?: string; // Optional course link
  priority: 'low' | 'medium' | 'high';
  deadline: string; // YYYY-MM-DD
  estimatedHours: number;
  progress: number; // 0 to 100
  status: 'not_started' | 'in_progress' | 'completed';
  dependencies?: string[]; // parent task IDs
  description?: string;
  projectName?: string; // optional project name grouping
}

export interface Folder {
  id: string;
  name: string;
  courseId?: string; // links to active course
}

export interface Note {
  id: string;
  title: string;
  content: string; // Rich markdown or text content
  courseId?: string; // Links to Course
  folderId?: string; // Links to Folder
  tags: string[];
  isFavorite: boolean;
  updatedAt: string; // ISO String
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedActions?: {
    type: 'create_event' | 'create_task' | 'create_note' | 'show_view';
    payload: any;
    label: string;
  }[];
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'upcoming_event' | 'deadline' | 'overdue' | 'ai_recommendation';
  timestamp: string;
  read: boolean;
}

export interface Habit {
  id: string;
  name: string;
}

export interface HabitCategory {
  id: string;
  name: string;
  habits: Habit[];
}

export interface HabitLog {
  id: string;
  date: string; // YYYY-MM-DD
  completedHabits: Record<string, boolean>; // habitId -> completed (boolean)
}

