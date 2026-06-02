/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Task, 
  CalendarEvent, 
  Course, 
  Note, 
  HabitCategory, 
  HabitLog, 
  VisionItem, 
  DashboardVisionPin,
  JournalEntry,
  MoodType
} from '../types';
import {
  CheckSquare, 
  Calendar as CalIcon, 
  Clock, 
  Award, 
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  Compass, 
  Image as ImageIcon, 
  Pin, 
  Target, 
  Flame, 
  Heart, 
  FileText, 
  Cpu, 
  Activity, 
  Terminal
} from 'lucide-react';

interface DashboardModuleProps {
  tasks: Task[];
  events: CalendarEvent[];
  courses: Course[];
  notes: Note[];
  onNavigate: (tab: 'dashboard' | 'calendar' | 'tasks' | 'gantt' | 'courses' | 'notes' | 'blueprint' | 'habits' | 'wellness' | 'visionboard') => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onClearNotification: (id: string) => void;
  habitCategories: HabitCategory[];
  habitLogs: HabitLog[];
  onUpdateHabitCategories: (newCategories: HabitCategory[]) => void;
  onUpdateHabitLogs: (newLogs: HabitLog[]) => void;
  visionItems: VisionItem[];
  dashboardPins: DashboardVisionPin[];
  onNavigateVision: () => void;
  journalEntries: JournalEntry[];
  onUpdateJournalEntries: React.Dispatch<React.SetStateAction<JournalEntry[]>>;
  onSelectNote: (id: string) => void;
}

export default function DashboardModule({
  tasks,
  events,
  courses,
  notes,
  onNavigate,
  onUpdateTask,
  habitCategories,
  habitLogs,
  onUpdateHabitLogs,
  visionItems,
  dashboardPins,
  onNavigateVision,
  journalEntries,
  onUpdateJournalEntries,
  onSelectNote
}: DashboardModuleProps) {
  // Mock Date YYYY-MM-DD
  const todayString = '2026-05-30';

  // --- 1. Quick Stats calculations ---
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalHours = tasks.reduce((acc, t) => acc + t.estimatedHours, 0);
  const remainingHours = tasks
    .filter(t => t.status !== 'completed')
    .reduce((acc, t) => acc + t.estimatedHours, 0);

  // --- 2. Calendar filter for today's classes ---
  const todayEvents = events.filter(e => e.date === todayString);

  // --- 3. Filter high-priority urgent tasks ---
  const urgentTasks = tasks
    .filter(t => t.status !== 'completed')
    .sort((a, b) => {
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (a.priority !== 'high' && b.priority === 'high') return 1;
      return a.deadline.localeCompare(b.deadline);
    })
    .slice(0, 3);

  // --- 4. Habit calculations for today ---
  const latestHabitLog = habitLogs.find(l => l.date === todayString) || {
    id: `log-temp-${Date.now()}`,
    date: todayString,
    completedHabits: {}
  };

  const calculateOverallHabitProgress = (log: HabitLog) => {
    const totalHabits = habitCategories.reduce((acc, cat) => acc + (cat.habits?.length || 0), 0);
    if (totalHabits === 0) return 0;
    
    let completedCount = 0;
    habitCategories.forEach(cat => {
      cat.habits?.forEach(h => {
        if (log.completedHabits[h.id]) {
          completedCount++;
        }
      });
    });
    return Math.round((completedCount / totalHabits) * 100);
  };

  const calculateHabitStreaks = () => {
    if (!habitLogs || habitLogs.length === 0) return 0;
    const sorted = [...habitLogs]
      .filter(l => Object.values(l.completedHabits).some(Boolean))
      .map(l => l.date)
      .sort();
      
    if (sorted.length === 0) return 0;
    
    let currentStreak = 0;
    let lastDate: Date | null = null;
    
    for (let i = sorted.length - 1; i >= 0; i--) {
      const d = new Date(sorted[i]);
      if (lastDate === null) {
        currentStreak = 1;
      } else {
        const diff = Math.abs(lastDate.getTime() - d.getTime());
        const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          currentStreak++;
        } else if (diffDays > 1) {
          break;
        }
      }
      lastDate = d;
    }
    return currentStreak;
  };

  const todayHabitProgress = calculateOverallHabitProgress(latestHabitLog);
  const currentHabitStreak = calculateHabitStreaks();

  const handleToggleHabit = (habitId: string) => {
    const logExists = habitLogs.some(l => l.date === todayString);
    let updatedLogs: HabitLog[];
    
    if (logExists) {
      updatedLogs = habitLogs.map(l => {
        if (l.date === todayString) {
          return {
            ...l,
            completedHabits: {
              ...l.completedHabits,
              [habitId]: !l.completedHabits[habitId]
            }
          };
        }
        return l;
      });
    } else {
      const newLog: HabitLog = {
        id: `log-${Date.now()}`,
        date: todayString,
        completedHabits: {
          [habitId]: true
        }
      };
      updatedLogs = [newLog, ...habitLogs].sort((a, b) => b.date.localeCompare(a.date));
    }
    onUpdateHabitLogs(updatedLogs);
  };

  // --- 5. Wellness logger & calculations ---
  const [selectedMood, setSelectedMood] = useState<MoodType>('happy');
  const [gratitudeInput, setGratitudeInput] = useState('');
  const [showLogSuccess, setShowLogSuccess] = useState(false);

  const latestJournal = journalEntries[0];
  const totalJournals = journalEntries.length;
  const avgMoodScore = totalJournals > 0
    ? (journalEntries.reduce((sum, entry) => sum + entry.mood.score, 0) / totalJournals).toFixed(1)
    : 'N/A';

  const handleQuickWellnessLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gratitudeInput.trim()) return;

    const newEntry: JournalEntry = {
      id: `entry-quick-${Date.now()}`,
      userId: 'student-1',
      dateCreated: todayString,
      timeCreated: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      lastModified: new Date().toISOString(),
      type: 'gratitude',
      title: 'Quick Dashboard Check-In',
      content: `<p>Logged via Quick Check-in. Gratitude: ${gratitudeInput.trim()}</p>`,
      mood: {
        score: selectedMood === 'very_happy' ? 10 : selectedMood === 'happy' ? 8 : selectedMood === 'neutral' ? 5 : selectedMood === 'stressed' ? 3 : 2,
        type: selectedMood,
        energyLevel: 6,
        stressLevel: selectedMood === 'stressed' ? 8 : 3,
        motivationLevel: 7,
        sleepQuality: 7
      },
      wellness: {
        anxietyLevel: selectedMood === 'stressed' ? 7 : 2,
        focusLevel: 7,
        exerciseCompleted: false,
        workloadPressure: 5,
        assignmentConfidence: 7,
        productivityRating: 7
      },
      gratitudeItems: [gratitudeInput.trim()],
      tags: ['QuickLog', 'Gratitude'],
      images: [],
      isLocked: false
    };

    onUpdateJournalEntries(prev => [newEntry, ...prev]);
    setGratitudeInput('');
    setShowLogSuccess(true);
    setTimeout(() => setShowLogSuccess(false), 3500);
  };

  // --- 6. Recent Notes calculations ---
  const recentNotes = [...notes]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 3);

  // --- 7. Vision Board calculations ---
  const pinnedIds = [...dashboardPins]
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map(p => p.visionId);
  const pinnedVisions = pinnedIds
    .map(id => visionItems.find(v => v.id === id && !v.isArchived))
    .filter(Boolean) as VisionItem[];
  const unpinnedVisions = visionItems
    .filter(v => !v.isArchived && !v.isPinned)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const displayVisions = [...pinnedVisions, ...unpinnedVisions].slice(0, 2);

  const getCourseForEvent = (courseId?: string) => {
    return courses.find(c => c.id === courseId);
  };

  const handleTaskComplete = (id: string) => {
    onUpdateTask(id, { status: 'completed', progress: 100 });
  };

  const moodIcons: { type: MoodType; icon: string; label: string; activeColor: string }[] = [
    { type: 'very_happy', icon: '😄', label: 'Very Happy', activeColor: 'bg-[#E85002] text-black border-2 border-black' },
    { type: 'happy', icon: '🙂', label: 'Happy', activeColor: 'bg-[#E85002] text-black border-2 border-black' },
    { type: 'neutral', icon: '😐', label: 'Neutral', activeColor: 'bg-[#A7A7A7] text-black border-2 border-black' },
    { type: 'stressed', icon: '😫', label: 'Stressed', activeColor: 'bg-black text-[#E85002] border-2 border-black' },
    { type: 'sad', icon: '😢', label: 'Sad', activeColor: 'bg-[#333333] text-white border-2 border-black' }
  ];

  return (
    <div className="space-y-6 font-sans text-black select-none">
      
      {/* 1. Quick Stats Row (Uniform Neo-Brutalist Layout) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Stat 1 - Task Completion */}
        <div 
          onClick={() => onNavigate('tasks')}
          className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_#000000] hover:shadow-[4px_4px_0px_#E85002] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150 cursor-pointer"
        >
          <span className="text-[10px] font-black text-[#646464] uppercase tracking-wider block">Task Solve Index</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black text-black">{taskCompletionRate}%</span>
            <span className="text-[9px] text-[#333333] font-bold font-mono">({completedTasks}/{totalTasks} completed)</span>
          </div>
          <div className="w-full bg-[#A7A7A7] h-2 border-2 border-black mt-3 overflow-hidden">
            <div className="bg-[#E85002] h-full transition-all" style={{ width: `${taskCompletionRate}%` }} />
          </div>
        </div>

        {/* Stat 2 - Workload Remaining */}
        <div 
          onClick={() => onNavigate('tasks')}
          className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_#000000] hover:shadow-[4px_4px_0px_#E85002] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150 cursor-pointer"
        >
          <span className="text-[10px] font-black text-[#646464] uppercase tracking-wider block">Remaining Hours</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black text-black">{remainingHours} hrs</span>
            <span className="text-[9px] text-[#333333] font-bold font-mono">from {totalHours}h estimated</span>
          </div>
          <div className="w-full bg-[#A7A7A7] h-2 border-2 border-black mt-3 overflow-hidden">
            <div className="bg-black h-full transition-all" style={{ width: `${totalHours > 0 ? (remainingHours / totalHours) * 100 : 0}%` }} />
          </div>
        </div>

        {/* Stat 3 - Enrolled Courses */}
        <div 
          onClick={() => onNavigate('courses')}
          className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_#000000] hover:shadow-[4px_4px_0px_#E85002] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150 cursor-pointer"
        >
          <span className="text-[10px] font-black text-[#646464] uppercase tracking-wider block">Academic Courses</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black text-black">{courses.length} Active</span>
            <span className="text-[9px] text-[#646464] font-semibold uppercase">Semester 1</span>
          </div>
          <div className="text-[9px] font-black text-[#E85002] mt-2.5 uppercase tracking-widest font-mono">
            Syllabus fully synced
          </div>
        </div>

        {/* Stat 4 - Drafted Notes */}
        <div 
          onClick={() => onNavigate('notes')}
          className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_#000000] hover:shadow-[4px_4px_0px_#E85002] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150 cursor-pointer"
        >
          <span className="text-[10px] font-black text-[#646464] uppercase tracking-wider block">Notebook Directory</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black text-black">{notes.length} Topics</span>
            <span className="text-[9px] text-[#333333] font-bold font-mono">Checked favorites</span>
          </div>
          <div className="text-[9px] font-black text-black mt-2.5 uppercase tracking-widest font-mono">
            Synchronized with LocalStorage
          </div>
        </div>
      </div>

      {/* 2. Bento Grid Columns (Organized left-to-right by priority) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ==================== LEFT COLUMN (PRIORITY 1: IMMEDIATE / OPERATIONAL) ==================== */}
        <div className="space-y-6">
          
          {/* Today's Class Schedule (Calendar Preview) */}
          <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_#000000]">
            <div className="flex justify-between items-center mb-3 border-b-2 border-black pb-2">
              <h3 className="text-xs font-black text-black flex items-center gap-1.5 uppercase tracking-wider">
                <CalIcon className="w-4 h-4 text-[#E85002]" />
                Today's Class Agenda
              </h3>
              <span className="text-[9px] font-mono font-bold text-black uppercase tracking-wider">
                {todayString}
              </span>
            </div>

            <div className="space-y-3 min-h-[170px] flex flex-col justify-center">
              {todayEvents.map(evt => {
                const crs = getCourseForEvent(evt.courseId);
                return (
                  <div 
                    key={evt.id} 
                    className="p-3 bg-[#F9F9F9] border-2 border-black shadow-[2px_2px_0px_#000000] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[8px] font-black uppercase bg-[#E85002] text-black px-1.5 py-0.5 border border-black">
                          {evt.category.replace('_', ' ')}
                        </span>
                        {crs && <span className="text-[9px] font-black text-black font-mono">{crs.code}</span>}
                      </div>

                      <h4 className="text-xs font-black text-black leading-snug line-clamp-1 uppercase tracking-tight">{evt.title}</h4>
                      <div className="flex items-center gap-1.5 text-[9px] text-[#333333] font-bold mt-1 font-mono">
                        <Clock className="w-3 h-3 text-black" />
                        <span>{evt.startTime} - {evt.endTime}</span>
                      </div>
                    </div>

                    <div className="text-[9px] text-black font-black mt-2 pt-1 border-t border-black/10 truncate font-mono">
                      📍 {evt.location || 'Classroom Main'}
                    </div>
                  </div>
                );
              })}

              {todayEvents.length === 0 && (
                <div className="text-center py-6 text-xs text-[#333333] bg-[#F9F9F9] border-2 border-dashed border-black flex flex-col justify-center items-center gap-2 h-full min-h-[150px]">
                  <Compass className="w-6 h-6 text-[#A7A7A7]" />
                  <span className="font-bold uppercase tracking-wider text-[10.5px]">No Slate for Today</span>
                  <p className="text-[9px] text-[#646464] font-mono max-w-[200px]">Use the Sidebar AI assistant to quickly insert study blocks.</p>
                </div>
              )}
            </div>

            <button 
              onClick={() => onNavigate('calendar')} 
              className="w-full text-center py-2 bg-black text-white hover:bg-[#E85002] hover:text-black border-2 border-black text-[10px] font-black uppercase tracking-wide transition-all mt-4 cursor-pointer"
            >
              Expand Planner Schedule →
            </button>
          </div>

          {/* Urgent Tasks Checklist (Tasks Preview) */}
          <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_#000000]">
            <div className="flex justify-between items-center mb-3 border-b-2 border-black pb-2">
              <h3 className="text-xs font-black text-black flex items-center gap-1.5 uppercase tracking-wider">
                <CheckSquare className="w-4 h-4 text-[#E85002]" />
                Urgent Milestones
              </h3>
              <span className="text-[9px] bg-black text-white px-2 py-0.5 border border-black font-black uppercase font-mono">
                Todo Matrix
              </span>
            </div>

            <div className="space-y-2 min-h-[170px] flex flex-col justify-start">
              {urgentTasks.map(tk => {
                const isHigh = tk.priority === 'high';
                return (
                  <div 
                    key={tk.id} 
                    className="flex items-start gap-2.5 p-2 bg-[#F9F9F9] border border-black hover:border-[#E85002] transition-all group shrink-0"
                  >
                    <input 
                      type="checkbox" 
                      onClick={() => handleTaskComplete(tk.id)}
                      className="mt-0.5 rounded-none border-2 border-black text-[#E85002] focus:ring-0 cursor-pointer h-4 w-4 bg-white"
                      title="Mark task completed"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-black text-black truncate leading-tight uppercase tracking-tight">{tk.title}</p>
                      <div className="flex items-center justify-between text-[9px] mt-1 font-mono">
                        <span className={`font-black uppercase ${isHigh ? 'text-[#E85002]' : 'text-[#646464]'}`}>
                          {isHigh ? '🔥 Urgent' : 'Medium'}
                        </span>
                        <span className="text-[#333333] font-bold">Due {tk.deadline.split('-').slice(1).join('/')}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {urgentTasks.length === 0 && (
                <div className="text-center py-6 text-[#A7A7A7] text-[10.5px] font-bold font-mono uppercase bg-[#F9F9F9] border-2 border-dashed border-black flex flex-col items-center justify-center min-h-[150px]">
                  All Milestones Cleared!
                </div>
              )}
            </div>

            <button 
              onClick={() => onNavigate('tasks')}
              className="w-full text-center py-2 bg-black text-white hover:bg-[#E85002] hover:text-black border-2 border-black text-[10px] font-black uppercase tracking-wide transition-all mt-4 cursor-pointer"
            >
              Open Kanban Board →
            </button>
          </div>

        </div>

        {/* ==================== CENTER COLUMN (PRIORITY 2: ROUTINES, REFLECTION & CAPTURE) ==================== */}
        <div className="space-y-6">

          {/* Daily Habits Ledger (Habits Preview) */}
          <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_#000000]">
            <div className="flex justify-between items-center mb-3 border-b-2 border-black pb-2">
              <h3 className="text-xs font-black text-black flex items-center gap-1.5 uppercase tracking-wider">
                <Flame className="w-4 h-4 text-[#E85002] fill-[#E85002]" />
                Daily Habit Tracker
              </h3>
              <span className="text-[9px] bg-black text-white px-2 py-0.5 border border-black font-black uppercase font-mono">
                🔥 {currentHabitStreak} Day Streak
              </span>
            </div>

            {/* Streak & Today Progress Row */}
            <div className="flex items-center justify-between p-2 bg-[#F9F9F9] border border-black mb-3 text-[10.5px] font-mono">
              <span className="font-bold text-black uppercase">Today's Ledger progress</span>
              <span className="font-black text-[#E85002]">{todayHabitProgress}%</span>
            </div>

            {/* Compact habit checking list */}
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {habitCategories.map(cat => (
                <div key={cat.id} className="border border-black p-2 bg-white">
                  <span className="text-[8px] font-black text-[#646464] uppercase tracking-wider block mb-1.5 font-mono">
                    {cat.name}
                  </span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {cat.habits.map(h => {
                      const isChecked = !!latestHabitLog.completedHabits[h.id];
                      return (
                        <div 
                          key={h.id} 
                          className="flex items-center justify-between p-1.5 border border-black/10 bg-[#F9F9F9] text-[10.5px] uppercase font-mono"
                        >
                          <span className="truncate font-semibold text-[#333333]">{h.name}</span>
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleHabit(h.id)}
                            className="rounded-none border border-black text-[#E85002] focus:ring-0 cursor-pointer h-3.5 w-3.5 bg-white"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {habitCategories.length === 0 && (
                <div className="text-center py-6 text-[#A7A7A7] text-[10.5px] font-mono uppercase bg-[#F9F9F9] border border-black">
                  No routines defined
                </div>
              )}
            </div>

            <button 
              onClick={() => onNavigate('habits')}
              className="w-full text-center py-2 bg-[#E85002] text-black hover:bg-black hover:text-white border-2 border-black text-[10px] font-black uppercase tracking-wide transition-all mt-4 cursor-pointer"
            >
              Configure Routines ledger →
            </button>
          </div>

          {/* Quick Wellness Journal & Mood Log (Wellness Preview) */}
          <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_#000000]">
            <div className="flex justify-between items-center mb-3 border-b-2 border-black pb-2">
              <h3 className="text-xs font-black text-black flex items-center gap-1.5 uppercase tracking-wider">
                <Heart className="w-4 h-4 text-[#E85002] fill-[#E85002]" />
                Wellness & Quick Journal
              </h3>
              <span className="text-[9px] bg-black text-[#E85002] px-2 py-0.5 border border-black font-black uppercase font-mono">
                Index: {avgMoodScore}
              </span>
            </div>

            {/* Quick checkin form */}
            <form onSubmit={handleQuickWellnessLog} className="space-y-3">
              <div>
                <label className="text-[9.5px] font-black text-[#333333] uppercase block mb-1 font-mono">
                  Select Current Mood State
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {moodIcons.map(m => (
                    <button
                      key={m.type}
                      type="button"
                      onClick={() => setSelectedMood(m.type)}
                      className={`py-1 px-1.5 text-center cursor-pointer transition-all border border-black/25 text-base flex justify-center items-center ${
                        selectedMood === m.type 
                          ? m.activeColor + ' shadow-[1px_1px_0px_#000000]' 
                          : 'bg-white hover:bg-[#F9F9F9]'
                      }`}
                      title={m.label}
                    >
                      {m.icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[9.5px] font-black text-[#333333] uppercase block mb-1 font-mono">
                  Daily Gratitude Entry
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={gratitudeInput}
                    onChange={e => setGratitudeInput(e.target.value)}
                    placeholder="E.g., clean compile, good coffee..."
                    className="flex-1 text-[10px] border-2 border-black px-2 py-1.5 bg-[#F9F9F9] focus:outline-none focus:bg-white focus:border-[#E85002] font-mono font-bold"
                    required
                  />
                  <button 
                    type="submit"
                    className="bg-black text-[#F9F9F9] hover:bg-[#E85002] hover:text-black border-2 border-black text-[9px] font-black uppercase px-3 py-1 cursor-pointer transition shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                  >
                    Log
                  </button>
                </div>
              </div>

              {showLogSuccess && (
                <div className="p-1 text-center bg-black border border-black text-[9px] font-black font-mono text-[#E85002] uppercase tracking-wider animate-bounce">
                  ⚡ Check-In logged successfully!
                </div>
              )}
            </form>

            {/* Latest Journal Summary */}
            {latestJournal && (
              <div className="mt-4 p-2 bg-[#F9F9F9] border border-black text-[9.5px] font-mono">
                <span className="text-[#646464] block font-bold uppercase">Latest Journal Entry:</span>
                <span className="text-black font-black uppercase tracking-tight block truncate mt-0.5">
                  "{latestJournal.title}"
                </span>
                <span className="text-[8.5px] text-[#A7A7A7] mt-1 block">
                  Logged on {latestJournal.dateCreated} @ {latestJournal.timeCreated}
                </span>
              </div>
            )}

            <button 
              onClick={() => onNavigate('wellness')}
              className="w-full text-center py-2 bg-black text-white hover:bg-[#E85002] hover:text-black border-2 border-black text-[10px] font-black uppercase tracking-wide transition-all mt-4 cursor-pointer"
            >
              Open Wellbeing Hub →
            </button>
          </div>

          {/* Recent Notes Directory (Notes Preview) */}
          <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_#000000]">
            <div className="flex justify-between items-center mb-3 border-b-2 border-black pb-2">
              <h3 className="text-xs font-black text-black flex items-center gap-1.5 uppercase tracking-wider">
                <FileText className="w-4 h-4 text-[#E85002]" />
                Recent Notes & Ideas
              </h3>
              <span className="text-[9px] bg-black text-white px-2 py-0.5 border border-black font-black uppercase font-mono">
                Notion Sync
              </span>
            </div>

            <div className="space-y-2 min-h-[140px] flex flex-col justify-start">
              {recentNotes.map(nt => (
                <div 
                  key={nt.id} 
                  onClick={() => onSelectNote(nt.id)}
                  className="p-2 border border-black hover:border-[#E85002] bg-[#F9F9F9] hover:bg-white transition-all cursor-pointer group"
                >
                  <h4 className="text-[11px] font-black text-black uppercase leading-tight line-clamp-1 group-hover:text-[#E85002]">
                    {nt.title}
                  </h4>
                  <div className="flex items-center justify-between text-[8px] font-mono text-[#646464] mt-1">
                    <span>Checked {new Date(nt.updatedAt).toLocaleDateString()}</span>
                    <div className="flex gap-1">
                      {nt.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="border border-black/10 px-1 bg-[#A7A7A7]/10 text-black">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {recentNotes.length === 0 && (
                <div className="text-center py-6 text-[#A7A7A7] text-[10.5px] font-mono uppercase bg-[#F9F9F9] border border-dashed border-black">
                  No notes drafted yet.
                </div>
              )}
            </div>

            <button 
              onClick={() => onNavigate('notes')}
              className="w-full text-center py-2 bg-black text-white hover:bg-[#E85002] hover:text-black border-2 border-black text-[10px] font-black uppercase tracking-wide transition-all mt-4 cursor-pointer"
            >
              Go to Notebook Directory →
            </button>
          </div>

        </div>

        {/* ==================== RIGHT COLUMN (PRIORITY 3: STRUCTURE, TIMELINE & SYSTEM) ==================== */}
        <div className="space-y-6">

          {/* Active Enrolled Courses (Courses Preview) */}
          <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_#000000]">
            <div className="flex justify-between items-center mb-3 border-b-2 border-black pb-2">
              <h3 className="text-xs font-black text-black flex items-center gap-1.5 uppercase tracking-wider">
                <BookOpen className="w-4 h-4 text-[#E85002]" />
                Enrolled Course Catalog
              </h3>
              <span className="text-[9px] bg-black text-[#E85002] px-2 py-0.5 border border-black font-black uppercase font-mono">
                {courses.length} Active
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
              {courses.map(crs => (
                <div 
                  key={crs.id} 
                  onClick={() => onNavigate('courses')}
                  className="p-2.5 bg-[#F9F9F9] border border-black hover:border-[#E85002] transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[9.5px] font-black font-mono text-black">{crs.code}</span>
                    <span className="text-[8px] font-mono text-[#646464] border border-black/10 px-1 bg-white">
                      {crs.credits} Credits
                    </span>
                  </div>
                  <h4 className="text-[10.5px] font-black text-black uppercase leading-tight mt-1 line-clamp-1">
                    {crs.name}
                  </h4>
                  <div className="flex justify-between text-[8px] font-mono text-[#333333] mt-2 pt-1 border-t border-black/10">
                    <span>👤 {crs.lecturer}</span>
                    <span className="font-bold">📍 {crs.location}</span>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => onNavigate('courses')}
              className="w-full text-center py-2 bg-black text-white hover:bg-[#E85002] hover:text-black border-2 border-black text-[10px] font-black uppercase tracking-wide transition-all mt-4 cursor-pointer"
            >
              Open Course Dashboards →
            </button>
          </div>

          {/* Milestones Gantt Timeline (Gantt Preview) */}
          <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_#000000]">
            <div className="flex justify-between items-center mb-3 border-b-2 border-black pb-2">
              <h3 className="text-xs font-black text-black flex items-center gap-1.5 uppercase tracking-wider">
                <Activity className="w-4 h-4 text-[#E85002]" />
                Project Milestones Timeline
              </h3>
              <span className="text-[9px] bg-black text-white px-2 py-0.5 border border-black font-black uppercase font-mono">
                Gantt
              </span>
            </div>

            <div className="space-y-3 min-h-[120px] flex flex-col justify-center">
              <div className="flex items-center text-[10px] font-mono">
                <div className="w-24 truncate font-black text-black uppercase">DBMS Schema</div>
                <div className="flex-grow bg-[#A7A7A7]/20 border border-black h-3 overflow-hidden rounded-none relative">
                  <div className="bg-[#E85002] h-full" style={{ width: '82%' }} />
                </div>
                <span className="w-8 text-right text-black text-[9.5px] font-black font-mono ml-1">82%</span>
              </div>

              <div className="flex items-center text-[10px] font-mono">
                <div className="w-24 truncate font-black text-black uppercase">OS Scheduler</div>
                <div className="flex-grow bg-[#A7A7A7]/20 border border-black h-3 overflow-hidden rounded-none relative">
                  <div className="bg-[#333333] h-full" style={{ width: '45%' }} />
                </div>
                <span className="w-8 text-right text-black text-[9.5px] font-black font-mono ml-1">45%</span>
              </div>

              <div className="flex items-center text-[10px] font-mono">
                <div className="w-24 truncate font-black text-black uppercase">Mobile Engine</div>
                <div className="flex-grow bg-[#A7A7A7]/20 border border-black h-3 overflow-hidden rounded-none relative">
                  <div className="bg-black h-full" style={{ width: '15%' }} />
                </div>
                <span className="w-8 text-right text-black text-[9.5px] font-black font-mono ml-1">15%</span>
              </div>
            </div>

            <button 
              onClick={() => onNavigate('gantt')}
              className="w-full text-center py-2 bg-black text-white hover:bg-[#E85002] hover:text-black border-2 border-black text-[10px] font-black uppercase tracking-wide transition-all mt-4 cursor-pointer"
            >
              Analyze Gantt Gantt Map →
            </button>
          </div>

          {/* Goal Pinned Visions (Vision Board Preview) */}
          <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_#000000]">
            <div className="flex justify-between items-center mb-3 border-b-2 border-black pb-2">
              <h3 className="text-xs font-black text-black flex items-center gap-1.5 uppercase tracking-wider">
                <Target className="w-4 h-4 text-[#E85002]" />
                Goal Pinned Visions
              </h3>
              <button 
                onClick={onNavigateVision}
                className="text-[9px] hover:underline uppercase text-[#E85002] font-black font-mono"
              >
                Expand board
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 min-h-[140px] items-stretch">
              {displayVisions.map(vision => (
                <div 
                  key={vision.id}
                  onClick={onNavigateVision}
                  className="bg-[#F9F9F9] border border-black p-2 flex flex-col justify-between cursor-pointer hover:border-[#E85002] transition-all"
                >
                  <div className="h-16 w-full bg-[#333333] border border-black overflow-hidden relative">
                    {vision.imageDataUrl ? (
                      <img 
                        src={vision.imageDataUrl} 
                        alt={vision.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[9px] uppercase font-mono text-[#A7A7A7]">
                        No Image
                      </div>
                    )}
                    <span className="absolute top-1 left-1 text-[7px] font-black uppercase px-1 bg-black text-white border border-[#333333]">
                      {vision.category.replace('_', ' ')}
                    </span>
                  </div>
                  <h4 className="text-[9.5px] font-black text-black uppercase tracking-tight mt-1.5 line-clamp-1">
                    {vision.title}
                  </h4>
                  {vision.progress !== undefined && (
                    <div className="w-full bg-[#A7A7A7] h-1 border border-black mt-1 overflow-hidden">
                      <div className="bg-[#E85002] h-full" style={{ width: `${vision.progress}%` }} />
                    </div>
                  )}
                </div>
              ))}

              {displayVisions.length === 0 && (
                <div className="col-span-2 text-center py-6 text-[#A7A7A7] text-[10.5px] font-mono uppercase bg-[#F9F9F9] border border-dashed border-black flex flex-col items-center justify-center">
                  <span>No active visions</span>
                </div>
              )}
            </div>

            <button 
              onClick={onNavigateVision}
              className="w-full text-center py-2 bg-[#E85002] text-black hover:bg-black hover:text-white border-2 border-black text-[10px] font-black uppercase tracking-wide transition-all mt-4 cursor-pointer"
            >
              Open Vision Board →
            </button>
          </div>

          {/* Technical Specifications (Blueprint Preview) */}
          <div className="bg-black text-[#F9F9F9] border-2 border-[#333333] p-4 shadow-[4px_4px_0px_#E85002]">
            <div className="flex justify-between items-center mb-3 border-b border-white/10 pb-2">
              <h3 className="text-xs font-black text-white flex items-center gap-1.5 uppercase tracking-wider">
                <Cpu className="w-4 h-4 text-[#E85002]" />
                System Blueprints
              </h3>
              <span className="text-[8px] font-black bg-emerald-500 text-black px-1.5 py-0.5 border border-black uppercase tracking-wider animate-pulse font-mono">
                ONLINE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[9px] font-mono">
              <div className="border border-white/10 p-1 bg-[#333333]/20">
                <span className="text-[#A7A7A7] block text-[7px] uppercase font-bold">CORE ENGINE</span>
                <span className="font-bold text-[#F9F9F9]">React 18.3</span>
              </div>
              <div className="border border-white/10 p-1 bg-[#333333]/20">
                <span className="text-[#A7A7A7] block text-[7px] uppercase font-bold">STYLESHEET</span>
                <span className="font-bold text-[#F9F9F9]">Tailwind v4</span>
              </div>
              <div className="border border-white/10 p-1 bg-[#333333]/20">
                <span className="text-[#A7A7A7] block text-[7px] uppercase font-bold">PERSISTENCE</span>
                <span className="font-bold text-[#F9F9F9]">LocalStorage</span>
              </div>
              <div className="border border-white/10 p-1 bg-[#333333]/20">
                <span className="text-[#A7A7A7] block text-[7px] uppercase font-bold">AI CO-PILOT</span>
                <span className="font-bold text-[#F9F9F9]">Gemmi Assistant</span>
              </div>
            </div>

            <button 
              onClick={() => onNavigate('blueprint')}
              className="w-full text-center py-2 bg-[#E85002] hover:bg-[#F9F9F9] text-black border-2 border-black text-[10px] font-black uppercase tracking-wide transition-all mt-4 cursor-pointer"
            >
              Inspect Schema Blueprint →
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
