/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Task, CalendarEvent, Course, Note, AppNotification, HabitCategory, HabitLog } from '../types';
import { 
  CheckSquare, Calendar as CalIcon, Clock, Award, FolderMinus, Sparkles, AlertCircle, ArrowRight, BookOpen, Compass
} from 'lucide-react';
import HabitTracker from './HabitTracker';

interface DashboardModuleProps {
  tasks: Task[];
  events: CalendarEvent[];
  courses: Course[];
  notes: Note[];
  onNavigate: (tab: 'dashboard' | 'calendar' | 'tasks' | 'gantt' | 'courses' | 'notes' | 'blueprint') => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onClearNotification: (id: string) => void;
  habitCategories: HabitCategory[];
  habitLogs: HabitLog[];
  onUpdateHabitCategories: (newCategories: HabitCategory[]) => void;
  onUpdateHabitLogs: (newLogs: HabitLog[]) => void;
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
  onUpdateHabitCategories,
  onUpdateHabitLogs
}: DashboardModuleProps) {
  // Filter for today's classes map from current date 2026-05-30
  const todayString = '2026-05-30';
  const todayEvents = events.filter(e => e.date === todayString);

  // Filter high priority tasks
  const urgentTasks = tasks
    .filter(t => t.status !== 'completed')
    .sort((a,b) => {
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (a.priority !== 'high' && b.priority === 'high') return 1;
      return a.deadline.localeCompare(b.deadline);
    })
    .slice(0, 4);

  // Progress metrics computed
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalHours = tasks.reduce((acc, t) => acc + t.estimatedHours, 0);
  const remainingHours = tasks
    .filter(t => t.status !== 'completed')
    .reduce((acc, t) => acc + t.estimatedHours, 0);

  const getCourseForEvent = (courseId?: string) => {
    return courses.find(c => c.id === courseId);
  };

  const handleTaskComplete = (id: string) => {
    onUpdateTask(id, { status: 'completed', progress: 100 });
  };

  return (
    <div className="space-y-4 font-sans text-slate-800">
      
      {/* 1. Quick Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm hover:shadow transition">
          <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Task Completion Rate</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-black text-indigo-700">{taskCompletionRate}%</span>
            <span className="text-[10px] text-slate-500 font-semibold font-mono">({completedTasks}/{totalTasks} solved)</span>
          </div>
          <div className="w-full bg-slate-100 h-1 rounded-full mt-2 overflow-hidden">
            <div className="bg-indigo-600 h-full transition-all" style={{ width: `${taskCompletionRate}%` }} />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm hover:shadow transition">
          <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Workload Remaining</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-black text-amber-600">{remainingHours} hrs</span>
            <span className="text-[10px] text-slate-500 font-semibold font-mono">from {totalHours}h estimated</span>
          </div>
          <div className="w-full bg-slate-100 h-1 rounded-full mt-2 overflow-hidden">
            <div className="bg-amber-500 h-full transition-all" style={{ width: `${totalHours > 0 ? (remainingHours / totalHours) * 100 : 0}%` }} />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm hover:shadow transition">
          <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Active Enrolled Courses</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-black text-slate-800">{courses.length} Classes</span>
            <span className="text-[10px] text-slate-500 font-semibold">Semester 1 active</span>
          </div>
          <div className="text-[8px] font-bold text-indigo-650 mt-1 uppercase tracking-widest">
            Syllabus indexed fully
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm hover:shadow transition">
          <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Drafted Lecture Notes</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-black text-emerald-700">{notes.length} Topics</span>
            <span className="text-[10px] text-slate-500 font-semibold font-mono">Notion Directory backed</span>
          </div>
          <div className="text-[8px] font-bold text-emerald-650 mt-1 uppercase tracking-widest">
            Ready for midterm study
          </div>
        </div>
      </div>

      {/* 2. Interactive Bento Grid Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Class Agenda schedule (Col-8) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Today's schedule card */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <CalIcon className="w-4 h-4 text-indigo-600 animate-pulse" />
                University Class Planner (Today's Lecture Calendar)
              </h3>
              <button 
                onClick={() => onNavigate('calendar')} 
                className="text-[11px] text-indigo-600 font-bold hover:underline py-0.5"
              >
                Expand Planner →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {todayEvents.map(evt => {
                const crs = getCourseForEvent(evt.courseId);
                return (
                  <div 
                    key={evt.id} 
                    className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-bold uppercase bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded">
                          {evt.category.replace('_', ' ')}
                        </span>
                        {crs && <span className="text-[10px] font-bold text-slate-650">{crs.code}</span>}
                      </div>

                      <h4 className="text-xs font-bold text-slate-805 leading-snug line-clamp-1">{evt.title}</h4>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium mt-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{evt.startTime} - {evt.endTime}</span>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-600 font-semibold mt-3 p-1 border-t border-slate-200/40 truncate">
                      📍 {evt.location || 'Classroom Main'}
                    </div>
                  </div>
                );
              })}

              {todayEvents.length === 0 && (
                <div className="col-span-2 text-center py-8 text-xs text-slate-400 bg-slate-50/50 border border-dashed border-slate-200 rounded-lg flex flex-col justify-center items-center gap-1">
                  <Compass className="w-7 h-7 text-slate-300 animate-spin" />
                  <span>No lectures slated for May 30, 2026.</span>
                  <p className="text-[10px] text-slate-500">You can trigger Aura AI to "block study sessions" or add new schedule items.</p>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Gantt bar overview mockup */}
          <div className="bg-indigo-900 border border-indigo-950 text-white rounded-xl p-4 shadow-sm flex flex-col justify-between h-[165px]">
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                Active Project Milestones Timeline
              </h3>
              <p className="text-[10.5px] text-indigo-200 mt-1">Visual visualization of overlapping deadlines and bottleneck forecasts.</p>
            </div>

            {/* Gantt rows indicators */}
            <div className="space-y-2 mt-4 flex-grow overflow-hidden">
              <div className="flex items-center text-[10.5px]">
                <div className="w-32 truncate font-semibold">DBMS Schema review</div>
                <div className="flex-grow bg-white/10 h-3 rounded-full relative overflow-hidden">
                  <div className="bg-emerald-400 h-full w-[82%] rounded-full shadow" />
                </div>
                <span className="w-10 text-right opacity-80 text-[10px] font-mono ml-2">82%</span>
              </div>

              <div className="flex items-center text-[10.5px]">
                <div className="w-32 truncate font-semibold">Operating Systems Lab</div>
                <div className="flex-grow bg-white/10 h-3 rounded-full relative overflow-hidden">
                  <div className="bg-amber-400 h-full w-[45%] rounded-full shadow" />
                </div>
                <span className="w-10 text-right opacity-80 text-[10px] font-mono ml-2">45%</span>
              </div>
            </div>

            <button 
              onClick={() => onNavigate('gantt')}
              className="w-full text-center py-2 bg-white/10 hover:bg-white/15 rounded-lg text-[11px] font-bold transition-all mt-3"
            >
              Analyze Gantt Project Dependencies →
            </button>
          </div>
        </div>

        {/* Task lists checklist panel (Col-4) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Urgent Checklist Cards */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col h-[325px]">
            <div className="flex justify-between items-center mb-3 shrink-0">
              <h3 className="text-xs font-bold text-slate-805">Urgent Assignments</h3>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                Todo Matrix
              </span>
            </div>

            <div className="flex-grow space-y-2 overflow-y-auto pr-1">
              {urgentTasks.map(tk => {
                const isHigh = tk.priority === 'high';
                return (
                  <div 
                    key={tk.id} 
                    className="flex items-start gap-2.5 p-2 bg-slate-50 hover:bg-white border border-slate-100 rounded-lg hover:border-indigo-200 transition-all group shrink-0"
                  >
                    <input 
                      type="checkbox" 
                      onClick={() => handleTaskComplete(tk.id)}
                      className="mt-1 rounded text-indigo-650 cursor-pointer"
                      title="Quick check complete"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold text-slate-800 truncate">{tk.title}</p>
                      <div className="flex items-center justify-between text-[9.5px] mt-0.5">
                        <span className={`font-semibold ${isHigh ? 'text-red-500' : 'text-slate-500'}`}>
                          {isHigh ? '🔥 High' : 'Medium'} Priority
                        </span>
                        <span className="text-slate-500 font-mono">Due {tk.deadline.split('-').slice(1).join('/')}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {urgentTasks.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-xs">No pending assignments configured.</div>
              )}
            </div>

            <button 
              onClick={() => onNavigate('tasks')}
              className="mt-3 w-full text-center py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-[10px] font-bold text-slate-700 transition"
            >
              Open Kanban Workspace
            </button>
          </div>

          {/* Productivity info message block */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 rounded-xl p-4 shadow-inner">
            <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
              AI Studio Grounding Health
            </h4>
            <p className="text-[10px] text-emerald-800/90 leading-relaxed mt-1">
              Your Campus Task Manager handles mock operations or REST APIs synchronously. Speak with Aura in the sidebar to test intelligent schedule generation! (Requires GEMINI_API_KEY).
            </p>
          </div>
        </div>
      </div>

      {/* 3. Habit Tracker Ledger Section */}
      <div className="mt-6 border-t border-slate-200/50 pt-6">
        <HabitTracker 
          categories={habitCategories}
          logs={habitLogs}
          onUpdateCategories={onUpdateHabitCategories}
          onUpdateLogs={onUpdateHabitLogs}
        />
      </div>
    </div>
  );
}
