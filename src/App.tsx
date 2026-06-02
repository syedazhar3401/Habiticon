/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Course, CalendarEvent, Task, Folder, Note, AIMessage, AppNotification, HabitCategory, HabitLog, JournalEntry,
  VisionItem, DashboardVisionPin
} from './types';
import AssistantChat from './components/AssistantChat';
import CalendarModule from './components/CalendarModule';
import {
  INITIAL_HABIT_CATEGORIES,
  INITIAL_HABIT_LOGS,
  INITIAL_JOURNAL_ENTRIES,
  INITIAL_VISION_ITEMS,
  INITIAL_DASHBOARD_PINS,
  INITIAL_COURSES,
  INITIAL_EVENTS,
  INITIAL_TASKS,
  INITIAL_FOLDERS,
  INITIAL_NOTES
} from './seedData';
import TaskModule from './components/TaskModule';
import GanttModule from './components/GanttModule';
import NoteModule from './components/NoteModule';
import DashboardModule from './components/DashboardModule';
import CourseModule from './components/CourseModule';
import HabitTracker from './components/HabitTracker';
import WellnessJournalModule from './components/WellnessJournalModule';
import VisionBoardModule from './components/VisionBoardModule';
import { ColorOrb } from './components/ui/ai-input';

import {
  Home, Calendar as CalIcon, CheckSquare, BarChart2, BookOpen, FileText, Cpu, Bell, CheckCircle, Sparkles, AlertCircle, MessageSquare, Flame, Heart, Image as ImageIcon
} from 'lucide-react';

export default function App() {
  // Synchronous simulation data initialization for product demo
  useState(() => {
    const demoKey = 'demo_version_5';
    if (!localStorage.getItem(demoKey)) {
      localStorage.clear();
      localStorage.setItem('habit_categories', JSON.stringify(INITIAL_HABIT_CATEGORIES));
      localStorage.setItem('habit_logs', JSON.stringify(INITIAL_HABIT_LOGS));
      localStorage.setItem('journal_entries', JSON.stringify(INITIAL_JOURNAL_ENTRIES));
      localStorage.setItem('vision_items', JSON.stringify(INITIAL_VISION_ITEMS));
      localStorage.setItem('vision_dashboard_pins', JSON.stringify(INITIAL_DASHBOARD_PINS));
      localStorage.setItem(demoKey, 'true');
    }
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar' | 'tasks' | 'gantt' | 'courses' | 'notes' | 'habits' | 'wellness' | 'visionboard'>('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);

  // --- Habits State Initialization & Persistence ---
  const [habitCategories, setHabitCategories] = useState<HabitCategory[]>(() => {
    const saved = localStorage.getItem('habit_categories');
    return saved ? JSON.parse(saved) : INITIAL_HABIT_CATEGORIES;
  });

  const [habitLogs, setHabitLogs] = useState<HabitLog[]>(() => {
    const saved = localStorage.getItem('habit_logs');
    return saved ? JSON.parse(saved) : INITIAL_HABIT_LOGS;
  });

  useEffect(() => {
    localStorage.setItem('habit_categories', JSON.stringify(habitCategories));
  }, [habitCategories]);

  useEffect(() => {
    localStorage.setItem('habit_logs', JSON.stringify(habitLogs));
  }, [habitLogs]);

  // --- Journal Entries State Initialization & Persistence ---
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem('journal_entries');
    return saved ? JSON.parse(saved) : INITIAL_JOURNAL_ENTRIES;
  });

  useEffect(() => {
    localStorage.setItem('journal_entries', JSON.stringify(journalEntries));
  }, [journalEntries]);

  // --- Vision Board State Initialization & Persistence ---
  const [visionItems, setVisionItems] = useState<VisionItem[]>(() => {
    const saved = localStorage.getItem('vision_items');
    return saved ? JSON.parse(saved) : INITIAL_VISION_ITEMS;
  });
  const [dashboardPins, setDashboardPins] = useState<DashboardVisionPin[]>(() => {
    const saved = localStorage.getItem('vision_dashboard_pins');
    return saved ? JSON.parse(saved) : INITIAL_DASHBOARD_PINS;
  });

  useEffect(() => {
    localStorage.setItem('vision_items', JSON.stringify(visionItems));
  }, [visionItems]);

  useEffect(() => {
    localStorage.setItem('vision_dashboard_pins', JSON.stringify(dashboardPins));
  }, [dashboardPins]);


  // --- Floating Draggable AI Assistant Widget State & Logic ---
  const [showAIWidget, setShowAIWidget] = useState(false);
  const [fabPos, setFabPos] = useState({ x: window.innerWidth - 80, y: window.innerHeight - 80 });
  const [isDragging, setIsDragging] = useState(false);

  const dragStart = useRef({ x: 0, y: 0 });
  const dragOffset = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);

  useEffect(() => {
    // Reposition FAB if window scales
    const handleResize = () => {
      setFabPos(prev => {
        const x = Math.min(prev.x, window.innerWidth - 150);
        const y = Math.min(prev.y, window.innerHeight - 56);
        return { x: Math.max(20, x), y: Math.max(20, y) };
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    hasMoved.current = false;
    dragStart.current = { x: e.clientX, y: e.clientY };
    dragOffset.current = { x: e.clientX - fabPos.x, y: e.clientY - fabPos.y };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    hasMoved.current = false;
    const touch = e.touches[0];
    dragStart.current = { x: touch.clientX, y: touch.clientY };
    dragOffset.current = { x: touch.clientX - fabPos.x, y: touch.clientY - fabPos.y };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        hasMoved.current = true;
      }

      const newX = Math.max(20, Math.min(e.clientX - dragOffset.current.x, window.innerWidth - 150));
      const newY = Math.max(20, Math.min(e.clientY - dragOffset.current.y, window.innerHeight - 56));
      setFabPos({ x: newX, y: newY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      const dx = touch.clientX - dragStart.current.x;
      const dy = touch.clientY - dragStart.current.y;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        hasMoved.current = true;
      }

      const newX = Math.max(20, Math.min(touch.clientX - dragOffset.current.x, window.innerWidth - 150));
      const newY = Math.max(20, Math.min(touch.clientY - dragOffset.current.y, window.innerHeight - 56));
      setFabPos({ x: newX, y: newY });
    };

    const handleDragEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleDragEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging]);

  const handleFabClick = () => {
    if (!hasMoved.current) {
      setShowAIWidget(prev => !prev);
    }
  };

  // --- Seed Data ---
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [folders, setFolders] = useState<Folder[]>(INITIAL_FOLDERS);
  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(INITIAL_NOTES[0]?.id || null);

  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif-1',
      title: 'Overdue Warning',
      message: 'Mobile Systems Lecture 8 is Past the Target Deadline.',
      type: 'overdue',
      timestamp: new Date().toISOString(),
      read: false
    },
    {
      id: 'notif-2',
      title: 'Upcoming Class Alert',
      message: 'Frameworks Lecture starts at 09:00 AM (Auditorium B).',
      type: 'upcoming_event',
      timestamp: new Date().toISOString(),
      read: false
    }
  ]);

  // --- Dynamic Habits Reminders Notification Trigger ---
  useEffect(() => {
    if (habitLogs.length === 0 || habitCategories.length === 0) return;

    // Find the latest habit log (sorted by date descending)
    const sortedLogs = [...habitLogs].sort((a, b) => b.date.localeCompare(a.date));
    const latestLog = sortedLogs[0];

    // Compute pending habits
    const totalHabits = habitCategories.reduce((acc, cat) => acc + (cat.habits?.length || 0), 0);
    if (totalHabits === 0) return;

    let completedCount = 0;
    const pendingNames: string[] = [];

    habitCategories.forEach(cat => {
      cat.habits?.forEach(h => {
        if (latestLog.completedHabits[h.id]) {
          completedCount++;
        } else {
          pendingNames.push(h.name);
        }
      });
    });

    const pendingCount = totalHabits - completedCount;
    const formattedDate = latestLog.date;

    setNotifications(prev => {
      // Remove previous habit alerts to avoid spam
      const filtered = prev.filter(n => !n.id.startsWith('habit-alert-'));
      const activeAlerts: AppNotification[] = [];

      if (pendingCount > 0) {
        activeAlerts.push({
          id: `habit-alert-pending-${formattedDate}`,
          title: 'Daily Habits Reminder',
          message: `You have ${pendingCount} pending routine tasks left for today (${pendingNames.slice(0, 2).join(', ')}${pendingCount > 2 ? '...' : ''}). complete them to maintain your streak!`,
          type: 'overdue',
          timestamp: new Date().toISOString(),
          read: false
        });
      } else {
        activeAlerts.push({
          id: `habit-alert-completed-${formattedDate}`,
          title: 'Habits Fully Conquered!',
          message: `Awesome consistency! All ${totalHabits} routines completed for today. Keep the fire burning! 🔥`,
          type: 'ai_recommendation',
          timestamp: new Date().toISOString(),
          read: false
        });
      }

      return [...activeAlerts, ...filtered];
    });
  }, [habitLogs, habitCategories]);

  // --- App Global Helpers ---
  const handleAddCourse = (course: Course) => {
    setCourses(prev => [...prev, course]);
    triggerToast('Course Enrolled', `You have registered inside ${course.code} successfully!`);
  };

  const handleDeleteCourse = (id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
    setTasks(prev => prev.map(t => t.courseId === id ? { ...t, courseId: undefined } : t));
    setEvents(prev => prev.map(e => e.courseId === id ? { ...e, courseId: undefined } : e));
    setNotes(prev => prev.map(n => n.courseId === id ? { ...n, courseId: undefined } : n));
    triggerToast('Course Dropped', 'Course dropped and references cleared.');
  };

  const handleAddEvent = (event: CalendarEvent) => {
    setEvents(prev => [...prev, event]);
    triggerToast('Event Scheduled', `Successfully booked ${event.title} on your calendar.`);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const handleUpdateEvent = (updatedEvent: CalendarEvent) => {
    setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
    triggerToast('Event Updated', `Successfully updated "${updatedEvent.title}" on your calendar.`);
  };

  const handleAddTask = (task: Task) => {
    setTasks(prev => [...prev, task]);
    triggerToast('Task Created', `Added deliverable "${task.title}" under Milestones.`);
  };

  const handleUpdateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleAddFolder = (name: string, courseId?: string) => {
    const newFold: Folder = {
      id: `folder-${Date.now()}`,
      name,
      courseId
    };
    setFolders(prev => [...prev, newFold]);
    triggerToast('Library Folder set', `Partition "${name}" added to Notion notebook.`);
  };

  const handleAddNote = (newNote: Partial<Note>) => {
    const fullNote: Note = {
      id: newNote.id || `note-${Date.now()}`,
      title: newNote.title || 'Untitled Lecture outline',
      content: newNote.content || '',
      courseId: newNote.courseId,
      folderId: newNote.folderId,
      tags: newNote.tags || [],
      isFavorite: false,
      updatedAt: new Date().toISOString()
    };
    setNotes(prev => [...prev, fullNote]);
  };

  const handleUpdateNote = (id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n));
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (selectedNoteId === id) setSelectedNoteId(null);
  };

  const handleClearNotif = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // --- Gemmi AI Suggested Action Dispatcher Integration ---
  const handleTriggerAction = (type: string, payload: any) => {
    switch (type) {
      case 'create_event': {
        const generatedEvent: CalendarEvent = {
          id: `event-ai-${Date.now()}`,
          title: payload.title || 'AI Blocked Session',
          courseId: payload.courseId || undefined,
          date: payload.date || '2026-06-02',
          startTime: payload.startTime || '18:00',
          endTime: payload.endTime || '19:30',
          location: payload.location || 'Library Seminar',
          description: payload.description || 'Grounded session designed via Gemmi',
          recurring: payload.recurring || 'none',
          category: payload.category || 'study_session',
          reminderMinutes: payload.reminderMinutes || 30
        };
        setEvents(prev => [...prev, generatedEvent]);
        triggerToast('Grounded Event Created', `Gemmi booked: "${generatedEvent.title}"`);
        break;
      }
      case 'create_task': {
        const generatedTask: Task = {
          id: `task-ai-${Date.now()}`,
          title: payload.title || 'AI Action item',
          courseId: payload.courseId || undefined,
          priority: payload.priority || 'medium',
          deadline: payload.deadline || '2026-07-29',
          estimatedHours: payload.estimatedHours || 4,
          progress: 0,
          status: 'not_started',
          description: payload.description || 'Deliverable set via Gemmi AI command'
        };
        setTasks(prev => [...prev, generatedTask]);
        triggerToast('Intel Task Logged', `Gemmi added: "${generatedTask.title}" due ${generatedTask.deadline}`);
        break;
      }
      case 'create_note': {
        // Find or build folder
        let foldId = folders[0]?.id;
        const noteFolder: Folder = {
          id: `folder-ai-${Date.now()}`,
          name: 'Gemmi Summaries',
          courseId: payload.courseId || undefined
        };
        setFolders(prev => [...prev, noteFolder]);
        foldId = noteFolder.id;

        const generatedNote: Note = {
          id: `note-ai-${Date.now()}`,
          title: payload.title || 'Gemmi AI Lecture Draft',
          content: payload.content || '# Draft note summary\n\nOutline details from prompt.',
          courseId: payload.courseId || undefined,
          folderId: foldId,
          tags: payload.tags || ['ai-grounded'],
          isFavorite: false,
          updatedAt: new Date().toISOString()
        };
        setNotes(prev => [...prev, generatedNote]);
        setSelectedNoteId(generatedNote.id);
        setActiveTab('notes');
        triggerToast('Notebook Synced', `Draft initialized under "${noteFolder.name}" folder.`);
        break;
      }
      case 'show_view': {
        if (payload.view) {
          setActiveTab(payload.view);
          triggerToast('Navigation Shunted', `Switched viewport to ${payload.view.toUpperCase()}`);
        }
        break;
      }
      default:
        console.warn('Unknown dispatch signature parsed:', type);
    }
  };

  const triggerToast = (title: string, message: string) => {
    const freshNotif: AppNotification = {
      id: `toast-${Date.now()}`,
      title,
      message,
      type: 'ai_recommendation',
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [freshNotif, ...prev]);
    // Auto toggle notifications bar indicator for UX feedback
    setShowNotifications(true);
    setTimeout(() => {
      setShowNotifications(false);
    }, 4500);
  };

  return (
    <div className="flex h-screen w-full bg-[#F9F9F9] font-sans text-black overflow-hidden selection:bg-[#E85002] selection:text-black">

      {/* A. Left Navigation Rail (Industrial Neo-Brutalist Theme - bg-black) */}
      <nav id="nav-rail" className="w-20 flex-none bg-[#000000] flex flex-col items-center py-5 justify-between select-none shrink-0 border-r-4 border-black shadow-[4px_0px_0px_#E85002]">

        {/* Logo Icon */}
        <div className="flex flex-col items-center gap-6 w-full">
          <div className="w-12 h-12 bg-[#E85002] border-2 border-black flex items-center justify-center font-black text-black text-xl shadow-[2px_2px_0px_rgba(255,255,255,0.4)] select-none hover:bg-[#F9F9F9] transition duration-150">
            H
          </div>

          {/* Navigation Controls Icons list */}
          <div className="flex flex-col gap-3.5 w-full items-center">
            {/* Dashboard button */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-12 h-12 flex items-center justify-center border-2 border-black cursor-pointer transition-all duration-150 active:translate-x-[1px] active:translate-y-[1px] ${
                activeTab === 'dashboard'
                  ? 'bg-[#E85002] text-black shadow-[2px_2px_0px_rgba(255,255,255,0.4)]'
                  : 'bg-[#333333] text-[#A7A7A7] hover:bg-[#F9F9F9] hover:text-black hover:shadow-[2px_2px_0px_#E85002]'
              }`}
              title="Dashboard Hub"
            >
              <Home className="w-5.5 h-5.5" />
            </button>

            {/* Calendar */}
            <button
              onClick={() => setActiveTab('calendar')}
              className={`w-12 h-12 flex items-center justify-center border-2 border-black cursor-pointer transition-all duration-150 active:translate-x-[1px] active:translate-y-[1px] ${
                activeTab === 'calendar'
                  ? 'bg-[#E85002] text-black shadow-[2px_2px_0px_rgba(255,255,255,0.4)]'
                  : 'bg-[#333333] text-[#A7A7A7] hover:bg-[#F9F9F9] hover:text-black hover:shadow-[2px_2px_0px_#E85002]'
              }`}
              title="Academic Calendar"
            >
              <CalIcon className="w-5.5 h-5.5" />
            </button>

            {/* Tasks & Kanban */}
            <button
              onClick={() => setActiveTab('tasks')}
              className={`w-12 h-12 flex items-center justify-center border-2 border-black cursor-pointer transition-all duration-150 active:translate-x-[1px] active:translate-y-[1px] ${
                activeTab === 'tasks'
                  ? 'bg-[#E85002] text-black shadow-[2px_2px_0px_rgba(255,255,255,0.4)]'
                  : 'bg-[#333333] text-[#A7A7A7] hover:bg-[#F9F9F9] hover:text-black hover:shadow-[2px_2px_0px_#E85002]'
              }`}
              title="Kanban Tasks Workspace"
            >
              <CheckSquare className="w-5.5 h-5.5" />
            </button>

            {/* Gantt chart */}
            <button
              onClick={() => setActiveTab('gantt')}
              className={`w-12 h-12 flex items-center justify-center border-2 border-black cursor-pointer transition-all duration-150 active:translate-x-[1px] active:translate-y-[1px] ${
                activeTab === 'gantt'
                  ? 'bg-[#E85002] text-black shadow-[2px_2px_0px_rgba(255,255,255,0.4)]'
                  : 'bg-[#333333] text-[#A7A7A7] hover:bg-[#F9F9F9] hover:text-black hover:shadow-[2px_2px_0px_#E85002]'
              }`}
              title="Interactive Project Timeline"
            >
              <BarChart2 className="w-5.5 h-5.5" />
            </button>

            {/* Course catalogs */}
            <button
              onClick={() => setActiveTab('courses')}
              className={`w-12 h-12 flex items-center justify-center border-2 border-black cursor-pointer transition-all duration-150 active:translate-x-[1px] active:translate-y-[1px] ${
                activeTab === 'courses'
                  ? 'bg-[#E85002] text-black shadow-[2px_2px_0px_rgba(255,255,255,0.4)]'
                  : 'bg-[#333333] text-[#A7A7A7] hover:bg-[#F9F9F9] hover:text-black hover:shadow-[2px_2px_0px_#E85002]'
              }`}
              title="Course dashboards"
            >
              <BookOpen className="w-5.5 h-5.5" />
            </button>

            {/* Notes Notion */}
            <button
              onClick={() => setActiveTab('notes')}
              className={`w-12 h-12 flex items-center justify-center border-2 border-black cursor-pointer transition-all duration-150 active:translate-x-[1px] active:translate-y-[1px] ${
                activeTab === 'notes'
                  ? 'bg-[#E85002] text-black shadow-[2px_2px_0px_rgba(255,255,255,0.4)]'
                  : 'bg-[#333333] text-[#A7A7A7] hover:bg-[#F9F9F9] hover:text-black hover:shadow-[2px_2px_0px_#E85002]'
              }`}
              title="Notebook and Whiteboard"
            >
              <FileText className="w-5.5 h-5.5" />
            </button>

            {/* Habits daily ledger tracker */}
            <button
              onClick={() => setActiveTab('habits')}
              className={`w-12 h-12 flex items-center justify-center border-2 border-black cursor-pointer transition-all duration-150 active:translate-x-[1px] active:translate-y-[1px] ${
                activeTab === 'habits'
                  ? 'bg-[#E85002] text-black shadow-[2px_2px_0px_rgba(255,255,255,0.4)]'
                  : 'bg-[#333333] text-[#A7A7A7] hover:bg-[#F9F9F9] hover:text-black hover:shadow-[2px_2px_0px_#E85002]'
              }`}
              title="Daily Habits & Routines"
            >
              <Flame className="w-5.5 h-5.5" />
            </button>

            {/* Wellness & Journal Reflections */}
            <button
              onClick={() => setActiveTab('wellness')}
              className={`w-12 h-12 flex items-center justify-center border-2 border-black cursor-pointer transition-all duration-150 active:translate-x-[1px] active:translate-y-[1px] ${
                activeTab === 'wellness'
                  ? 'bg-[#E85002] text-black shadow-[2px_2px_0px_rgba(255,255,255,0.4)]'
                  : 'bg-[#333333] text-[#A7A7A7] hover:bg-[#F9F9F9] hover:text-black hover:shadow-[2px_2px_0px_#E85002]'
              }`}
              title="Journal &amp; Wellbeing reflections"
            >
              <Heart className="w-5.5 h-5.5" />
            </button>

            {/* Vision Board */}
            <button
              onClick={() => setActiveTab('visionboard')}
              className={`w-12 h-12 flex items-center justify-center border-2 border-black cursor-pointer transition-all duration-150 active:translate-x-[1px] active:translate-y-[1px] ${
                activeTab === 'visionboard'
                  ? 'bg-[#E85002] text-black shadow-[2px_2px_0px_rgba(255,255,255,0.4)]'
                  : 'bg-[#333333] text-[#A7A7A7] hover:bg-[#F9F9F9] hover:text-black hover:shadow-[2px_2px_0px_#E85002]'
              }`}
              title="Vision Board"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* User initials bubble bottom */}
        <div className="w-full flex-none flex justify-center">
          <div className="w-12 h-12 border-2 border-black p-0.5 shadow-sm cursor-pointer hover:border-[#E85002] transition">
            <div className="w-full h-full bg-[#333333] border border-black flex items-center justify-center text-[11px] font-extrabold text-white">
              JD
            </div>
          </div>
        </div>
      </nav>

      {/* C. Right Main Contents Panel */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F9F9F9] overflow-hidden h-full">

        {/* Top Header bar banner */}
        <header className="h-16 border-b-4 border-black bg-white flex items-center justify-between px-6 shrink-0 z-10 select-none">
          <div>
            <h1 className="font-black text-lg text-black uppercase tracking-wider flex items-center gap-1.5">
              {activeTab === 'dashboard' && 'Classroom Command Hub'}
              {activeTab === 'calendar' && 'Academic Calendar Planner'}
              {activeTab === 'tasks' && 'Kanban Task Board'}
              {activeTab === 'gantt' && 'Project Gantt Visualizer'}
              {activeTab === 'courses' && 'Active Enrolled Courses'}
              {activeTab === 'notes' && 'Notebook and Whiteboard'}
              {activeTab === 'habits' && 'Daily Habits & Routines Tracker'}
              {activeTab === 'wellness' && 'Journal & Wellbeing Hub'}
              {activeTab === 'visionboard' && 'My Vision Board'}
              {activeTab === 'blueprint' && 'Engineering Blueprint Specs'}
            </h1>
            <p className="text-[10px] text-slate-500 font-semibold tracking-wide uppercase">
              Semester 1 • Week 8 Revision Phase Map
            </p>
          </div>

          <div className="flex items-center gap-4">

            {/* Visual avatar bubbles */}
            <div className="hidden sm:flex -space-x-1.5 items-center">
              <div className="w-5.5 h-5.5 rounded-full bg-emerald-500 border border-white" title="Software Developer active" />
              <div className="w-5.5 h-5.5 rounded-full bg-indigo-500 border border-white" title="Advanced Data Structures active" />
              <div className="w-5.5 h-5.5 rounded-full bg-rose-500 border border-white" title="Discrete Mathematics active" />
            </div>

            {/* Notification drop-toggle button */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-1.5 bg-white border-2 border-black hover:bg-[#E85002] text-black hover:shadow-[2px_2px_0px_#000000] transition relative cursor-pointer"
                title="Workspace Alerts"
              >
                <Bell className="w-4.5 h-4.5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#E85002] border border-black animate-ping" />
                )}
              </button>

              {/* Alert Notification list overlay Box - Style A */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border-2 border-black shadow-[4px_4px_0px_#000000] z-50 p-4.5 text-left animate-in fade-in slide-in-from-top-3 duration-150 text-black">
                  <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
                    <span className="text-[10px] font-black text-black uppercase tracking-widest font-mono">Workspace alerts</span>
                    <button onClick={() => setNotifications([])} className="text-[9.5px] font-black uppercase text-[#E85002] hover:underline bg-black text-white px-2 py-0.5 border border-black">Clear list</button>
                  </div>

                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto">
                    {notifications.map(notif => (
                      <div
                        key={notif.id}
                        className="p-2.5 border border-black bg-[#F9F9F9] flex gap-2.5 items-start justify-between shadow-[2px_2px_0px_#000000]"
                      >
                        <div className="flex gap-2">
                          {notif.type === 'overdue' ? (
                            <AlertCircle className="w-4 h-4 text-[#E85002] mt-0.5 shrink-0" />
                          ) : notif.type === 'ai_recommendation' ? (
                            <Sparkles className="w-4 h-4 text-black mt-0.5 shrink-0 animate-pulse" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-black mt-0.5 shrink-0" />
                          )}
                          <div>
                            <h5 className="text-[11px] font-black text-black leading-tight uppercase tracking-tight">{notif.title}</h5>
                            <p className="text-[10px] text-[#333333] leading-snug mt-1 font-mono">{notif.message}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleClearNotif(notif.id)}
                          className="text-black hover:text-[#E85002] font-black text-[12px] select-none cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    ))}

                    {notifications.length === 0 && (
                      <div className="py-6 text-center text-[#A7A7A7] text-xs font-bold font-mono">No alerts pending.</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Direct creation trigger */}
            <button
              onClick={() => setActiveTab('tasks')}
              className="px-3.5 py-1.5 bg-[#E85002] hover:bg-black hover:text-[#E85002] text-black text-[11px] font-black border-2 border-black rounded-none shadow-[2px_2px_0px_#000000] transition duration-150 active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
            >
              + New Task
            </button>
          </div>
        </header>

        {/* Central Display viewport workspace area */}
        <div className="flex-grow p-4 overflow-hidden h-full">
          {activeTab === 'dashboard' && (
            <div className="h-full overflow-y-auto">
              <DashboardModule
                tasks={tasks}
                courses={courses}
                events={events}
                notes={notes}
                onNavigate={setActiveTab}
                onUpdateTask={handleUpdateTask}
                onClearNotification={handleClearNotif}
                habitCategories={habitCategories}
                habitLogs={habitLogs}
                onUpdateHabitCategories={setHabitCategories}
                onUpdateHabitLogs={setHabitLogs}
                visionItems={visionItems}
                dashboardPins={dashboardPins}
                onNavigateVision={() => setActiveTab('visionboard')}
                journalEntries={journalEntries}
                onUpdateJournalEntries={setJournalEntries}
                onSelectNote={(id) => { setSelectedNoteId(id); setActiveTab('notes'); }}
              />
            </div>
          )}

          {activeTab === 'calendar' && (
            <CalendarModule
              events={events}
              courses={courses}
              tasks={tasks}
              onAddEvent={handleAddEvent}
              onDeleteEvent={handleDeleteEvent}
              onUpdateEvent={handleUpdateEvent}
              onQuickAdd={(title, cat, date) => {
                const quickEv: CalendarEvent = {
                  id: `event-${Date.now()}`,
                  title,
                  date,
                  startTime: '10:00',
                  endTime: '11:30',
                  location: 'Seminar Auditorium',
                  description: 'Quick scheduled study event',
                  category: cat as any,
                  recurring: 'none',
                  reminderMinutes: 30
                };
                handleAddEvent(quickEv);
              }}
            />
          )}

          {activeTab === 'tasks' && (
            <TaskModule
              tasks={tasks}
              courses={courses}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onQuickAdd={(title, courseId) => {
                const quickT: Task = {
                  id: `task-${Date.now()}`,
                  title,
                  courseId,
                  priority: 'medium',
                  deadline: '2026-06-05',
                  estimatedHours: 4,
                  status: 'not_started',
                  progress: 0
                };
                handleAddTask(quickT);
              }}
            />
          )}

          {activeTab === 'gantt' && (
            <GanttModule
              tasks={tasks}
              courses={courses}
              onUpdateTask={handleUpdateTask}
            />
          )}

          {activeTab === 'courses' && (
            <CourseModule
              courses={courses}
              tasks={tasks}
              events={events}
              notes={notes}
              onAddCourse={handleAddCourse}
              onDeleteCourse={handleDeleteCourse}
            />
          )}

          {activeTab === 'notes' && (
            <NoteModule
              folders={folders}
              notes={notes}
              courses={courses}
              selectedNoteId={selectedNoteId}
              onSelectNote={setSelectedNoteId}
              onAddFolder={handleAddFolder}
              onAddNote={handleAddNote}
              onUpdateNote={handleUpdateNote}
              onDeleteNote={handleDeleteNote}
            />
          )}

          {activeTab === 'habits' && (
            <div className="h-full overflow-y-auto pr-1">
              <HabitTracker
                categories={habitCategories}
                logs={habitLogs}
                onUpdateCategories={setHabitCategories}
                onUpdateLogs={setHabitLogs}
              />
            </div>
          )}

          {activeTab === 'wellness' && (
            <div className="h-full overflow-hidden">
              <WellnessJournalModule
                entries={journalEntries}
                onUpdateEntries={setJournalEntries}
              />
            </div>
          )}

          {activeTab === 'visionboard' && (
            <div className="h-full overflow-hidden">
              <VisionBoardModule
                visionItems={visionItems}
                dashboardPins={dashboardPins}
                tasks={tasks}
                journalEntries={journalEntries}
                onUpdateVisions={setVisionItems}
                onUpdatePins={setDashboardPins}
                onNavigate={setActiveTab}
              />
            </div>
          )}
        </div>

      </main>

      {/* Floating Draggable AI Assistant Pill Trigger */}
      <div
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={handleFabClick}
        style={{
          left: `${fabPos.x}px`,
          top: `${fabPos.y}px`,
          touchAction: 'none'
        }}
        className={`fixed w-[130px] h-10 bg-black border-2 border-black text-[#F9F9F9] rounded-none flex items-center justify-between px-3 shadow-[3px_3px_0px_#E85002] hover:bg-[#E85002] hover:text-black hover:shadow-[3px_3px_0px_#000000] cursor-pointer select-none transition-all duration-200 z-40 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        title="Reposition anywhere! Click to consult Gemmi AI"
      >
        <div className="flex items-center gap-2 select-none pointer-events-none">
          <ColorOrb dimension="20px" tones={{ base: "oklch(22.64% 0 0)" }} className="shrink-0" />
          <span className="font-black text-[10.5px] uppercase tracking-wide select-none">Ask Gemmi</span>
        </div>
        <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E85002] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#E85002] border border-black"></span>
        </span>
      </div>

      {/* Floating Gemmi AI Assistant Pop-up Chat Card */}
      <div
        style={{
          left: `${Math.max(20, Math.min(window.innerWidth - 380, fabPos.x - 120))}px`,
          top: `${Math.max(20, Math.min(window.innerHeight - 480, fabPos.y - 480))}px`,
          width: '360px',
          height: '460px'
        }}
        className={`fixed z-50 rounded-none overflow-hidden bg-black shadow-2xl border-4 border-black shadow-[8px_8px_0px_#E85002] flex flex-col transition-all duration-300 origin-bottom ${showAIWidget
            ? 'scale-100 opacity-100 pointer-events-auto'
            : 'scale-90 opacity-0 pointer-events-none'
          }`}
      >
        <div className="h-full w-full">
          <AssistantChat
            courses={courses}
            events={events}
            tasks={tasks}
            onTriggerAction={handleTriggerAction}
            onClose={() => setShowAIWidget(false)}
          />
        </div>
      </div>

    </div>
  );
}
