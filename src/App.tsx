/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Course, CalendarEvent, Task, Folder, Note, AIMessage, AppNotification, HabitCategory, HabitLog, JournalEntry 
} from './types';
import AssistantChat from './components/AssistantChat';
import BlueprintDocs from './components/BlueprintDocs';
import CalendarModule from './components/CalendarModule';
import TaskModule from './components/TaskModule';
import GanttModule from './components/GanttModule';
import NoteModule from './components/NoteModule';
import DashboardModule from './components/DashboardModule';
import CourseModule from './components/CourseModule';
import HabitTracker from './components/HabitTracker';
import WellnessJournalModule from './components/WellnessJournalModule';
import { ColorOrb } from './components/ui/ai-input';

import { 
  Home, Calendar as CalIcon, CheckSquare, BarChart2, BookOpen, FileText, Cpu, Bell, CheckCircle, Sparkles, AlertCircle, MessageSquare, Flame, Heart
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar' | 'tasks' | 'gantt' | 'courses' | 'notes' | 'blueprint' | 'habits' | 'wellness'>('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);

  // --- Habits State Initialization & Persistence ---
  const [habitCategories, setHabitCategories] = useState<HabitCategory[]>(() => {
    const saved = localStorage.getItem('habit_categories');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'cat-morning',
        name: 'Morning Routine',
        habits: [
          { id: 'h-meditate', name: 'Meditate' },
          { id: 'h-stretch', name: 'Morning Stretch' },
          { id: 'h-journal', name: 'Journaling' }
        ]
      },
      {
        id: 'cat-midday',
        name: 'Mid-Day Sync',
        habits: [
          { id: 'h-code', name: 'Code Projects' },
          { id: 'h-water', name: 'Hydrate (2L)' }
        ]
      },
      {
        id: 'cat-evening',
        name: 'Evening Calm',
        habits: [
          { id: 'h-read', name: 'Read 10 pages' },
          { id: 'h-plan', name: 'Plan tomorrow' }
        ]
      }
    ];
  });

  const [habitLogs, setHabitLogs] = useState<HabitLog[]>(() => {
    const saved = localStorage.getItem('habit_logs');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'log-1',
        date: '2026-05-30',
        completedHabits: {
          'h-meditate': true,
          'h-stretch': false,
          'h-journal': true,
          'h-code': true,
          'h-water': false,
          'h-read': false,
          'h-plan': true
        }
      },
      {
        id: 'log-2',
        date: '2026-05-29',
        completedHabits: {
          'h-meditate': true,
          'h-stretch': true,
          'h-journal': true,
          'h-code': false,
          'h-water': true,
          'h-read': true,
          'h-plan': false
        }
      }
    ];
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
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'entry-1',
        userId: 'student-1',
        dateCreated: '2026-05-30',
        timeCreated: '21:30',
        lastModified: new Date('2026-05-30T21:30:00Z').toISOString(),
        type: 'daily',
        title: 'Overcoming Operating Systems Lab Fatigue',
        content: 'Today was an intensely productive but physically exhausting day. I spent over 4 hours debugging the multithreading process scheduling logic in C for the OS Lab assignment. Finally got the mutex locks and semaphores working without causing deadlocks! I felt stressed in the afternoon, but coding projects always bring a sense of resolution.',
        mood: {
          score: 8,
          type: 'happy',
          energyLevel: 6,
          stressLevel: 5,
          motivationLevel: 9,
          sleepQuality: 7
        },
        wellness: {
          anxietyLevel: 3,
          focusLevel: 9,
          exerciseCompleted: false,
          workloadPressure: 7,
          assignmentConfidence: 9,
          productivityRating: 9
        },
        gratitudeItems: [
          'The clean, error-free compile of the scheduler simulation code.',
          'Hot peppermint tea during the long evening coding session.',
          'Friendly peer advice on threads from my classmate Alice.'
        ],
        tags: ['Success', 'Goals', 'Stress'],
        images: [],
        isLocked: false
      },
      {
        id: 'entry-2',
        userId: 'student-1',
        dateCreated: '2026-05-29',
        timeCreated: '22:15',
        lastModified: new Date('2026-05-29T22:15:00Z').toISOString(),
        type: 'gratitude',
        title: 'End of Week Reflections & Gratitude Log',
        content: 'Enrolled in a new class and started mapping the semester revision phase. The workload is picking up, but I am keeping up with my habit check-ins. Daily stretches and hydration are helping me stay grounded.',
        mood: {
          score: 9,
          type: 'very_happy',
          energyLevel: 8,
          stressLevel: 2,
          motivationLevel: 9,
          sleepQuality: 8
        },
        wellness: {
          anxietyLevel: 2,
          focusLevel: 8,
          exerciseCompleted: true,
          workloadPressure: 4,
          assignmentConfidence: 8,
          productivityRating: 8
        },
        gratitudeItems: [
          'Getting a full 8 hours of high-quality sleep.',
          'Finding a quiet study desk in the main library auditorium.',
          'A simple, clear plan for tomorrow\'s homework sheets.'
        ],
        tags: ['Health', 'Goals'],
        images: [],
        isLocked: false
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('journal_entries', JSON.stringify(journalEntries));
  }, [journalEntries]);

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
  const [courses, setCourses] = useState<Course[]>([
    {
      id: 'course-1',
      code: 'WIX1003',
      name: 'Software Developer Frameworks',
      lecturer: 'Dr. Alan Turing',
      semester: 'Semester 1',
      credits: 4,
      location: 'DK-B Auditorium',
      color: 'emerald'
    },
    {
      id: 'course-2',
      code: 'CS2001',
      name: 'Advanced Data Structures',
      lecturer: 'Dr. Donald Knuth',
      semester: 'Semester 1',
      credits: 3,
      location: 'Block C Lab 5',
      color: 'indigo'
    },
    {
      id: 'course-3',
      code: 'MTH3002',
      name: 'Discrete Mathematical Structures',
      lecturer: 'Dr. Ada Lovelace',
      semester: 'Semester 1',
      credits: 3,
      location: 'Main Seminar Hall',
      color: 'rose'
    },
    {
      id: 'course-4',
      code: 'ITS4001',
      name: 'Mobile Systems Engineering',
      lecturer: 'Dr. Grace Hopper',
      semester: 'Semester 1',
      credits: 4,
      location: 'Annex Room 12',
      color: 'indigo'
    }
  ]);

  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: 'event-1',
      title: 'WIX1003 Regular Lecture',
      courseId: 'course-1',
      date: '2026-05-30',
      startTime: '09:00',
      endTime: '11:00',
      location: 'DK-B Auditorium',
      description: 'Introduction to standard system architecture frameworks and class specs.',
      recurring: 'weekly',
      category: 'class',
      reminderMinutes: 15
    },
    {
      id: 'event-2',
      title: 'CS2001 Heap & Red-Black Lab',
      courseId: 'course-2',
      date: '2026-06-02',
      startTime: '14:00',
      endTime: '16:00',
      location: 'Block C Lab 5',
      description: 'Algorithm optimization review of binary and complex heap structures.',
      recurring: 'none',
      category: 'class',
      reminderMinutes: 30
    },
    {
      id: 'event-3',
      title: 'MTH3002 Graph Theory Seminar',
      courseId: 'course-3',
      date: '2026-06-03',
      startTime: '10:00',
      endTime: '12:00',
      location: 'Main Seminar Hall',
      description: 'Discussion of Euler paths, Hamilton circuits, and planar representations.',
      recurring: 'weekly',
      category: 'study_session',
      reminderMinutes: 60
    },
    {
      id: 'event-4',
      title: 'Group Study circle review',
      courseId: 'course-1',
      date: '2026-05-30',
      startTime: '16:00',
      endTime: '18:00',
      location: 'Main Library Annex',
      description: 'Drafting project timelines and setting up milestone maps.',
      recurring: 'none',
      category: 'meeting',
      reminderMinutes: 15
    }
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 'task-1',
      title: 'Design Database ER Diagrams',
      courseId: 'course-1',
      priority: 'high',
      deadline: '2026-06-03',
      estimatedHours: 6,
      progress: 50,
      status: 'in_progress',
      description: 'Create normalized relational schema matching DBMS constraints.',
      projectName: 'DBMS Project'
    },
    {
      id: 'task-2',
      title: 'Complexity proofs Homework',
      courseId: 'course-2',
      priority: 'medium',
      deadline: '2026-06-05',
      estimatedHours: 4,
      progress: 0,
      status: 'not_started',
      description: 'Verify mathematical bound algorithms for search tree depth metrics.',
      projectName: 'Labs Core'
    },
    {
      id: 'task-3',
      title: 'Discrete Sets Problem Sheet',
      courseId: 'course-3',
      priority: 'low',
      deadline: '2026-05-28',
      estimatedHours: 2,
      progress: 100,
      status: 'completed',
      description: 'Submission verified on online portal system.',
      projectName: 'Assignments'
    },
    {
      id: 'task-4',
      title: 'Review Lecture 8 Recording',
      courseId: 'course-4',
      priority: 'high',
      deadline: '2026-05-29',
      estimatedHours: 3,
      progress: 0,
      status: 'not_started',
      description: 'Analyze Android layout hierarchies and stylus pad hooks (Overdue study!).',
      projectName: 'Exams Review'
    }
  ]);

  const [folders, setFolders] = useState<Folder[]>([
    { id: 'folder-1', name: 'Frameworks Lectures', courseId: 'course-1' },
    { id: 'folder-2', name: 'Lab Outlines', courseId: 'course-2' }
  ]);

  const [notes, setNotes] = useState<Note[]>([
    {
      id: 'note-1',
      title: 'Software Developer DBMS Checklist',
      content: `# Software Developer DBMS Checklist\n\n1. Target third normal form (3NF) boundary rules.\n2. Add indexes on heavy foreign key structures.\n3. Implement optimistic concurrency checks.`,
      courseId: 'course-1',
      folderId: 'folder-1',
      tags: ['dbms', 'index'],
      isFavorite: true,
      updatedAt: new Date('2026-05-28').toISOString()
    },
    {
      id: 'note-2',
      title: 'Heap structures & Complex space notes',
      content: `# Heap structures notes\n\n- Binary Heap heights always evaluate to log(n).\n- Insertion triggers bubble-up swaps at average log(n) complexity.`,
      courseId: 'course-2',
      folderId: 'folder-2',
      tags: ['algorithms'],
      isFavorite: false,
      updatedAt: new Date('2026-05-29').toISOString()
    }
  ]);

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>('note-1');

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

  const handleAddEvent = (event: CalendarEvent) => {
    setEvents(prev => [...prev, event]);
    triggerToast('Event Scheduled', `Successfully booked ${event.title} on your calendar calendar.`);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
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

  // --- Aura AI Suggested Action Dispatcher Integration ---
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
          description: payload.description || 'Grounded session designed via Aura',
          recurring: payload.recurring || 'none',
          category: payload.category || 'study_session',
          reminderMinutes: payload.reminderMinutes || 30
        };
        setEvents(prev => [...prev, generatedEvent]);
        triggerToast('Grounded Event Created', `Aura booked: "${generatedEvent.title}"`);
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
          description: payload.description || 'Deliverable set via Aura AI command'
        };
        setTasks(prev => [...prev, generatedTask]);
        triggerToast('Intel Task Logged', `Aura added: "${generatedTask.title}" due ${generatedTask.deadline}`);
        break;
      }
      case 'create_note': {
        // Find or build folder
        let foldId = folders[0]?.id;
        const noteFolder: Folder = {
          id: `folder-ai-${Date.now()}`,
          name: 'Aura Summaries',
          courseId: payload.courseId || undefined
        };
        setFolders(prev => [...prev, noteFolder]);
        foldId = noteFolder.id;

        const generatedNote: Note = {
          id: `note-ai-${Date.now()}`,
          title: payload.title || 'Aura AI Lecture Draft',
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
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-800 overflow-hidden">
      
      {/* A. Left Navigation Rail (High Density Theme Specs - width-16, bg-indigo-950) */}
      <nav id="nav-rail" className="w-16 flex-none bg-indigo-950 flex flex-col items-center py-4 justify-between select-none shrink-0 border-r border-indigo-900/50">
        
        {/* Logo Icon */}
        <div className="flex flex-col items-center gap-5 w-full">
          <div className="w-10 h-10 bg-gradient-to-tr from-emerald-400 to-indigo-500 rounded-xl flex items-center justify-center font-black text-white text-lg shadow-inner select-none animate-pulse">
            C
          </div>

          {/* Navigation Controls Icons list */}
          <div className="flex flex-col gap-3 w-full items-center">
            {/* Dashboard button */}
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`w-11 h-11 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 ${
                activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/30' : 'text-indigo-200 hover:bg-white/10 hover:text-white'
              }`}
              title="Dashboard Hub"
            >
              <Home className="w-5.5 h-5.5" />
            </button>

            {/* Calendar */}
            <button 
              onClick={() => setActiveTab('calendar')}
              className={`w-11 h-11 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 ${
                activeTab === 'calendar' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/30' : 'text-indigo-200 hover:bg-white/10 hover:text-white'
              }`}
              title="Academic Calendar"
            >
              <CalIcon className="w-5.5 h-5.5" />
            </button>

            {/* Tasks & Kanban */}
            <button 
              onClick={() => setActiveTab('tasks')}
              className={`w-11 h-11 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 ${
                activeTab === 'tasks' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/30' : 'text-indigo-200 hover:bg-white/10 hover:text-white'
              }`}
              title="Kanban Tasks Workspace"
            >
              <CheckSquare className="w-5.5 h-5.5" />
            </button>

            {/* Gantt chart */}
            <button 
              onClick={() => setActiveTab('gantt')}
              className={`w-11 h-11 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 ${
                activeTab === 'gantt' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/30' : 'text-indigo-200 hover:bg-white/10 hover:text-white'
              }`}
              title="Interactive Project Timeline"
            >
              <BarChart2 className="w-5.5 h-5.5" />
            </button>

            {/* Course catalogs */}
            <button 
              onClick={() => setActiveTab('courses')}
              className={`w-11 h-11 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 ${
                activeTab === 'courses' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/30' : 'text-indigo-200 hover:bg-white/10 hover:text-white'
              }`}
              title="Course dashboards"
            >
              <BookOpen className="w-5.5 h-5.5" />
            </button>

            {/* Notes Notion */}
            <button 
              onClick={() => setActiveTab('notes')}
              className={`w-11 h-11 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 ${
                activeTab === 'notes' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/30' : 'text-indigo-200 hover:bg-white/10 hover:text-white'
              }`}
              title="Notebook and Whiteboard"
            >
              <FileText className="w-5.5 h-5.5" />
            </button>

            {/* Habits daily ledger tracker */}
            <button 
              onClick={() => setActiveTab('habits')}
              className={`w-11 h-11 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 ${
                activeTab === 'habits' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/30' : 'text-indigo-200 hover:bg-white/10 hover:text-white'
              }`}
              title="Daily Habits & Routines"
            >
              <Flame className="w-5.5 h-5.5 text-amber-500 animate-pulse" />
            </button>

            {/* Wellness & Journal Reflections */}
            <button 
              onClick={() => setActiveTab('wellness')}
              className={`w-11 h-11 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 ${
                activeTab === 'wellness' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/30' : 'text-indigo-200 hover:bg-white/10 hover:text-white'
              }`}
              title="Journal &amp; Wellbeing reflections"
            >
              <Heart className="w-5.5 h-5.5 text-rose-450 animate-pulse" />
            </button>

            {/* Technical Specs Engineering Blueprint */}
            <button 
              onClick={() => setActiveTab('blueprint')}
              className={`w-11 h-11 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 ${
                activeTab === 'blueprint' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/30' : 'text-indigo-200 hover:bg-white/10 hover:text-white'
              }`}
              title="Engineering Blueprint Docs"
            >
              <Cpu className="w-5.5 h-5.5" />
            </button>
          </div>
        </div>

        {/* User initials bubble bottom */}
        <div className="w-full flex-none flex justify-center">
          <div className="w-10 h-10 rounded-full border-2 border-indigo-400 p-0.5 shadow-sm cursor-pointer hover:border-white transition">
            <div className="w-full h-full bg-indigo-900 rounded-full flex items-center justify-center text-[11px] font-extrabold text-indigo-100">
              JD
            </div>
          </div>
        </div>
      </nav>

      {/* C. Right Main Contents Panel */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden h-full">
        
        {/* Top Header bar banner */}
        <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0 z-10 select-none">
          <div>
            <h1 className="font-bold text-base text-slate-900 capitalize flex items-center gap-1.5">
              {activeTab === 'dashboard' && 'Classroom Command Hub'}
              {activeTab === 'calendar' && 'Academic Calendar Planner'}
              {activeTab === 'tasks' && 'Kanban Task Board'}
              {activeTab === 'gantt' && 'Project Gantt visualizer'}
              {activeTab === 'courses' && 'Active Enrolled Courses'}
              {activeTab === 'notes' && 'Notebook and Whiteboard'}
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
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-indigo-650 transition relative"
                title="Workspace Alerts"
              >
                <Bell className="w-4.5 h-4.5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-600 animate-bounce" />
                )}
              </button>

              {/* Alert Notification list overlay Box */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 shadow-2xl rounded-xl z-50 p-3 text-left animate-in fade-in slide-in-from-top-3 duration-150 text-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Workspace alerts</span>
                    <button onClick={() => setNotifications([])} className="text-[9.5px] font-bold text-indigo-600 hover:underline">Clear list</button>
                  </div>

                  <div className="space-y-2 max-h-[220px] overflow-y-auto">
                    {notifications.map(notif => (
                      <div 
                        key={notif.id} 
                        className="p-2 border border-slate-100 rounded-lg bg-slate-50/50 flex gap-2.5 items-start justify-between"
                      >
                        <div className="flex gap-2">
                          {notif.type === 'overdue' ? (
                            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                          ) : notif.type === 'ai_recommendation' ? (
                            <Sparkles className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0 animate-pulse" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                          )}
                          <div>
                            <h5 className="text-[11px] font-bold text-slate-800 leading-tight">{notif.title}</h5>
                            <p className="text-[10px] text-slate-550 leading-snug mt-0.5">{notif.message}</p>
                          </div>
                        </div>

                        <button 
                          onClick={() => handleClearNotif(notif.id)}
                          className="text-slate-400 hover:text-slate-650 text-[10.5px] select-none"
                        >
                          ×
                        </button>
                      </div>
                    ))}

                    {notifications.length === 0 && (
                      <div className="py-6 text-center text-slate-400 text-xs">No notifications on file.</div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Direct creation trigger */}
            <button 
              onClick={() => setActiveTab('tasks')}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] rounded-lg font-bold shadow-sm transition active:scale-95"
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
              />
            </div>
          )}

          {activeTab === 'calendar' && (
            <CalendarModule 
              events={events}
              courses={courses}
              onAddEvent={handleAddEvent}
              onDeleteEvent={handleDeleteEvent}
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

          {activeTab === 'blueprint' && (
            <BlueprintDocs />
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
            <div className="h-full overflow-y-auto pr-1">
              <WellnessJournalModule 
                entries={journalEntries}
                onUpdateEntries={setJournalEntries}
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
        className={`fixed w-[130px] h-9 bg-indigo-900 border border-indigo-800 text-white rounded-full flex items-center justify-between px-3 shadow-[0_4px_20px_rgba(99,102,241,0.5)] hover:shadow-[0_4px_25px_rgba(99,102,241,0.65)] cursor-pointer select-none transition-all duration-200 z-40 hover:scale-105 active:scale-95 ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        title="Reposition anywhere! Click to consult Gemmi AI"
      >
        <div className="flex items-center gap-2 select-none pointer-events-none">
          <ColorOrb dimension="20px" tones={{ base: "oklch(22.64% 0 0)" }} className="shrink-0" />
          <span className="font-bold text-[10.5px] tracking-wide text-white select-none">Ask Gemmi</span>
        </div>
        <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-indigo-950"></span>
        </span>
      </div>

      {/* Floating Aura AI Assistant Pop-up Chat Card */}
      <div 
        style={{
          left: `${Math.max(20, Math.min(window.innerWidth - 380, fabPos.x - 120))}px`,
          top: `${Math.max(20, Math.min(window.innerHeight - 480, fabPos.y - 480))}px`,
          width: '360px',
          height: '460px'
        }}
        className={`fixed z-50 rounded-2xl overflow-hidden bg-slate-900 shadow-2xl border border-indigo-900/60 flex flex-col transition-all duration-300 origin-bottom ${
          showAIWidget 
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
