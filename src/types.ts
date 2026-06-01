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
  startDate?: string; // YYYY-MM-DD
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

export type JournalEntryType = 
  | 'daily' 
  | 'reflection' 
  | 'goal_review' 
  | 'study_reflection' 
  | 'gratitude' 
  | 'freeform';

export type MoodType = 'very_happy' | 'happy' | 'neutral' | 'stressed' | 'sad';

export interface MoodCheckIn {
  score: number; // 1 to 10
  type: MoodType;
  energyLevel: number; // 1 to 10
  stressLevel: number; // 1 to 10
  motivationLevel: number; // 1 to 10
  sleepQuality: number; // 1 to 10
}

export interface WellnessCheckIn {
  anxietyLevel: number; // 1 to 10
  focusLevel: number; // 1 to 10
  exerciseCompleted: boolean;
  workloadPressure: number; // 1 to 10
  assignmentConfidence: number; // 1 to 10
  productivityRating: number; // 1 to 10
}

export interface JournalImage {
  id: string;
  url: string; // Base64 or custom string
  caption?: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  dateCreated: string; // YYYY-MM-DD
  timeCreated: string; // HH:MM
  lastModified: string; // ISO string
  type: JournalEntryType;
  title: string;
  content: string; // HTML/Rich text
  mood: MoodCheckIn;
  wellness?: WellnessCheckIn;
  gratitudeItems?: string[];
  tags: string[];
  images: JournalImage[];
  isLocked: boolean;
  aiInsights?: {
    summary: string;
    recurringThemes: string[];
    positiveHighlights: string[];
    sentiment: string;
  };
}

// ── Vision Board ──────────────────────────────────────────────

export type VisionCategory =
  | 'academic'
  | 'career'
  | 'personal_growth'
  | 'health_wellness'
  | 'financial'
  | 'travel'
  | 'creativity'
  | 'relationships'
  | 'custom';

export type VisionStatus =
  | 'dreaming'      // Not yet started
  | 'planning'      // Actively planning
  | 'in_progress'   // Working on it
  | 'achieved';     // Completed/archived

export interface VisionMilestone {
  id: string;
  visionId: string;
  title: string;
  description?: string;
  dueDate?: string;         // YYYY-MM-DD
  isCompleted: boolean;
  completedAt?: string;     // ISO string
}

export interface VisionItem {
  id: string;
  title: string;
  description: string;
  motivationStatement?: string;   // Personal "why" affirmation
  imageDataUrl: string;           // Base64-compressed (max 800×600)
  category: VisionCategory;
  customCategory?: string;        // Used when category === 'custom'
  status: VisionStatus;
  priority: 'low' | 'medium' | 'high';
  progress?: number;              // 0–100, optional
  targetDate?: string;            // YYYY-MM-DD
  tags: string[];
  milestones: VisionMilestone[];
  isPinned: boolean;              // Pinned → appears on dashboard
  isArchived: boolean;            // Achieved visions archived here
  linkedTaskIds: string[];        // Cross-ref with TaskModule
  linkedJournalIds: string[];     // Cross-ref with WellnessJournalModule
  createdAt: string;              // ISO string
  updatedAt: string;              // ISO string
}

export interface DashboardVisionPin {
  visionId: string;
  displayOrder: number;           // 0-3 for dashboard slots
}
