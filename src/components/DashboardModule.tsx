/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Task, CalendarEvent, Course, Note, AppNotification, HabitCategory, HabitLog, VisionItem, DashboardVisionPin } from '../types';
import {
  CheckSquare, Calendar as CalIcon, Clock, Award, FolderMinus, Sparkles, AlertCircle, ArrowRight, BookOpen, Compass, Image as ImageIcon, Pin, Target, TrendingUp
} from 'lucide-react';
import HabitTracker from './HabitTracker';

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
  onUpdateHabitLogs,
  visionItems,
  dashboardPins,
  onNavigateVision
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
    <div className="space-y-6 font-sans text-black">
      
      {/* 1. Quick Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1 - Style A: High-Contrast Industrial */}
        <div className="neo-card-a p-4 transition-all duration-200 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none cursor-pointer">
          <span className="text-[10px] font-black text-black uppercase tracking-wider block">Task Completion Rate</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-black">{taskCompletionRate}%</span>
            <span className="text-[10px] text-[#333333] font-bold font-mono">({completedTasks}/{totalTasks} solved)</span>
          </div>
          <div className="w-full bg-[#A7A7A7] h-2 border border-black rounded-none mt-3 overflow-hidden">
            <div className="bg-[#E85002] h-full transition-all" style={{ width: `${taskCompletionRate}%` }} />
          </div>
        </div>

        {/* Metric 2 - Style B: Kinetic Inversion */}
        <div className="neo-card-b p-4 transition-all duration-200 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none cursor-pointer">
          <span className="text-[10px] font-black text-black uppercase tracking-wider block">Workload Remaining</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-black">{remainingHours} hrs</span>
            <span className="text-[10px] text-black font-bold font-mono">from {totalHours}h estimated</span>
          </div>
          <div className="w-full bg-black/20 h-2 border border-black rounded-none mt-3 overflow-hidden">
            <div className="bg-black h-full transition-all" style={{ width: `${totalHours > 0 ? (remainingHours / totalHours) * 100 : 0}%` }} />
          </div>
        </div>

        {/* Metric 3 - Style C: Deep Mode Noir */}
        <div className="neo-card-c p-4 transition-all duration-200 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none cursor-pointer">
          <span className="text-[10px] font-black text-[#A7A7A7] uppercase tracking-wider block">Active Enrolled Courses</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-[#F9F9F9]">{courses.length} Classes</span>
            <span className="text-[10px] text-[#A7A7A7] font-semibold">Semester 1 active</span>
          </div>
          <div className="text-[9px] font-black text-[#E85002] mt-2.5 uppercase tracking-widest">
            Syllabus indexed fully
          </div>
        </div>

        {/* Metric 4 - Style D: Soft Claymorphic */}
        <div className="clay-card p-4 transition-all duration-200 hover:scale-[1.01] cursor-pointer border border-[#e2e8f0]/60">
          <span className="text-[10px] font-bold text-[#646464] uppercase tracking-wider block">Drafted Lecture Notes</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-[#333333]">{notes.length} Topics</span>
            <span className="text-[10px] text-[#A7A7A7] font-semibold font-mono">Notion Directory backed</span>
          </div>
          <div className="text-[9px] font-bold text-[#E85002] mt-2.5 uppercase tracking-widest">
            Ready for midterm study
          </div>
        </div>
      </div>

      {/* 2. Interactive Bento Grid Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Class Agenda schedule (Col-8) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Today's schedule card - Style A */}
          <div className="neo-card-a p-4">
            <div className="flex justify-between items-center mb-3 border-b-2 border-black pb-2">
              <h3 className="text-sm font-black text-black flex items-center gap-1.5 uppercase tracking-wider">
                <CalIcon className="w-4 h-4 text-[#E85002] animate-pulse" />
                University Class Planner (Today's Lecture Calendar)
              </h3>
              <button 
                onClick={() => onNavigate('calendar')} 
                className="text-[11px] bg-black text-white hover:bg-[#E85002] hover:text-black font-black px-2.5 py-0.5 border border-black transition cursor-pointer"
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
                    className="p-3 bg-white border-2 border-black shadow-[2px_2px_0px_#000000] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[9px] font-black uppercase bg-[#E85002] text-black px-2 py-0.5 border border-black">
                          {evt.category.replace('_', ' ')}
                        </span>
                        {crs && <span className="text-[10px] font-black text-black font-mono">{crs.code}</span>}
                      </div>

                      <h4 className="text-xs font-black text-black leading-snug line-clamp-1 uppercase tracking-tight">{evt.title}</h4>
                      <div className="flex items-center gap-1.5 text-[10px] text-[#333333] font-bold mt-1">
                        <Clock className="w-3.5 h-3.5 text-black" />
                        <span>{evt.startTime} - {evt.endTime}</span>
                      </div>
                    </div>

                    <div className="text-[10px] text-black font-black mt-3 pt-1.5 border-t border-black/25 truncate">
                      📍 {evt.location || 'Classroom Main'}
                    </div>
                  </div>
                );
              })}

              {todayEvents.length === 0 && (
                <div className="col-span-2 text-center py-8 text-xs text-[#333333] bg-[#F9F9F9] border-2 border-dashed border-black rounded-none flex flex-col justify-center items-center gap-2">
                  <Compass className="w-8 h-8 text-[#A7A7A7] animate-spin" />
                  <span className="font-bold uppercase tracking-wider">No lectures slated for May 30, 2026.</span>
                  <p className="text-[10px] text-[#646464] font-mono">You can trigger Aura AI to "block study sessions" or add new schedule items.</p>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Gantt bar overview mockup - Style C */}
          <div className="bg-black border-2 border-black text-white p-4 shadow-[4px_4px_0px_#E85002] flex flex-col justify-between h-[180px] relative overflow-hidden">
            {/* Brushed steel accent in the top corner */}
            <div className="absolute top-0 right-0 w-16 h-16 brushed-steel border-l-2 border-b-2 border-black" />

            <div className="relative z-10">
              <h3 className="text-xs font-black text-white flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-[#E85002] animate-pulse" />
                Active Project Milestones Timeline
              </h3>
              <p className="text-[10px] text-[#A7A7A7] mt-1 font-mono">Visual visualization of overlapping deadlines and bottleneck forecasts.</p>
            </div>

            {/* Gantt rows indicators */}
            <div className="space-y-2.5 mt-4 flex-grow overflow-hidden relative z-10">
              <div className="flex items-center text-[10.5px]">
                <div className="w-32 truncate font-black text-[#F9F9F9] tracking-tight">DBMS Schema review</div>
                <div className="flex-grow bg-[#333333] h-3 border border-white/20 relative overflow-hidden">
                  <div className="bg-[#E85002] h-full w-[82%]" />
                </div>
                <span className="w-10 text-right text-[#E85002] text-[10px] font-mono ml-2 font-black">82%</span>
              </div>

              <div className="flex items-center text-[10.5px]">
                <div className="w-32 truncate font-black text-[#F9F9F9] tracking-tight">Operating Systems Lab</div>
                <div className="flex-grow bg-[#333333] h-3 border border-white/20 relative overflow-hidden">
                  <div className="bg-[#A7A7A7] h-full w-[45%]" />
                </div>
                <span className="w-10 text-right text-[#A7A7A7] text-[10px] font-mono ml-2 font-black">45%</span>
              </div>
            </div>

            <button 
              onClick={() => onNavigate('gantt')}
              className="w-full text-center py-2 bg-[#E85002] text-black hover:bg-[#F9F9F9] border-2 border-black text-[11px] font-black transition-all mt-3 relative z-10 cursor-pointer"
            >
              Analyze Gantt Project Dependencies →
            </button>
          </div>
        </div>

        {/* Task lists checklist panel (Col-4) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Urgent Checklist Cards - Style D */}
          <div className="clay-card p-4 flex flex-col h-[340px] border border-[#e2e8f0]/60">
            <div className="flex justify-between items-center mb-3 shrink-0">
              <h3 className="text-xs font-black text-[#333333] uppercase tracking-wider">Urgent Assignments</h3>
              <span className="text-[9px] bg-[#E85002] text-black px-2 py-0.5 border border-black font-black">
                Todo Matrix
              </span>
            </div>

            <div className="flex-grow space-y-2 overflow-y-auto pr-1">
              {urgentTasks.map(tk => {
                const isHigh = tk.priority === 'high';
                return (
                  <div 
                    key={tk.id} 
                    className="flex items-start gap-2.5 p-2 bg-[#F9F9F9] hover:bg-[#F0F0F0] border border-black/10 hover:border-black rounded-lg transition-all group shrink-0"
                  >
                    <input 
                      type="checkbox" 
                      onClick={() => handleTaskComplete(tk.id)}
                      className="mt-1 rounded border-black text-[#E85002] focus:ring-black cursor-pointer"
                      title="Quick check complete"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="text-[11.5px] font-black text-[#333333] truncate leading-tight uppercase tracking-tight">{tk.title}</p>
                      <div className="flex items-center justify-between text-[9.5px] mt-1 font-mono">
                        <span className={`font-bold ${isHigh ? 'text-[#E85002]' : 'text-[#646464]'}`}>
                          {isHigh ? '🔥 High' : 'Medium'} Priority
                        </span>
                        <span className="text-[#A7A7A7] font-semibold">Due {tk.deadline.split('-').slice(1).join('/')}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {urgentTasks.length === 0 && (
                <div className="text-center py-12 text-[#A7A7A7] text-xs font-bold font-mono">No pending assignments configured.</div>
              )}
            </div>

            <button 
              onClick={() => onNavigate('tasks')}
              className="mt-3 w-full text-center py-2 bg-black text-white hover:bg-[#E85002] hover:text-black border-2 border-black text-[10px] font-black transition cursor-pointer"
            >
              Open Kanban Workspace
            </button>
          </div>

          {/* Productivity info message block with diagonal stripes */}
          <div className="border-2 border-black bg-white rounded-none shadow-[4px_4px_0px_#000000] overflow-hidden">
            {/* diagonal warning stripes */}
            <div className="h-4 diagonal-stripes border-b-2 border-black" />
            <div className="p-4">
              <h4 className="text-xs font-black text-black flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-[#E85002] animate-pulse" />
                AI Studio Grounding Health
              </h4>
              <p className="text-[10px] text-[#333333] leading-relaxed mt-1 font-mono font-bold">
                Your Campus Task Manager handles mock operations or REST APIs synchronously. Speak with Aura in the sidebar to test intelligent schedule generation! (Requires GEMINI_API_KEY).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Habit Tracker Ledger Section */}
      <div className="mt-6 border-t-2 border-black pt-6">
        <HabitTracker
          categories={habitCategories}
          logs={habitLogs}
          onUpdateCategories={onUpdateHabitCategories}
          onUpdateLogs={onUpdateHabitLogs}
        />
      </div>

      {/* 4. Vision Board Preview Section */}
      {(() => {
        // Compute up to 4 dashboard visions: pinned first, then by updatedAt desc
        const pinnedIds = [...dashboardPins]
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map(p => p.visionId);
        const pinned = pinnedIds
          .map(id => visionItems.find(v => v.id === id && !v.isArchived))
          .filter(Boolean) as VisionItem[];
        const unpinned = visionItems
          .filter(v => !v.isArchived && !v.isPinned)
          .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
        const pinnedFallback = visionItems
          .filter(v => !v.isArchived && v.isPinned && !pinnedIds.includes(v.id))
          .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
        const displayVisions = [...pinned, ...pinnedFallback, ...unpinned].slice(0, 4);

        const categoryColors: Record<string, string> = {
          academic: 'bg-black text-white', career: 'bg-[#E85002] text-black',
          personal_growth: 'bg-[#333333] text-white', health_wellness: 'bg-[#A7A7A7] text-black',
          financial: 'bg-black text-[#E85002]', travel: 'bg-[#E85002] text-black',
          creativity: 'bg-black text-white', relationships: 'bg-[#333333] text-white', custom: 'bg-[#646464] text-white'
        };

        return (
          <div className="mt-6 border-t-2 border-black pt-6">
            {/* Section header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-black border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#E85002]">
                  <Target className="w-4 h-4 text-[#E85002]" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-black uppercase tracking-wider">Vision Board</h3>
                  <p className="text-[9px] text-[#646464] font-bold font-mono">
                    {visionItems.filter(v => !v.isArchived).length} active
                    {visionItems.filter(v => v.isArchived).length > 0 && ` · ${visionItems.filter(v => v.isArchived).length} achieved`}
                  </p>
                </div>
              </div>
              <button
                onClick={onNavigateVision}
                className="text-[11px] bg-black text-white hover:bg-[#E85002] hover:text-black border-2 border-black font-black px-3 py-1 cursor-pointer flex items-center gap-1 transition"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {displayVisions.length === 0 ? (
              /* Empty state */
              <div className="border-2 border-dashed border-black rounded-none flex flex-col items-center justify-center py-10 gap-3 text-center bg-[#F9F9F9] cursor-pointer hover:bg-white hover:border-[#E85002] transition-all" onClick={onNavigateVision}>
                <div className="w-12 h-12 bg-black border-2 border-black rounded-none flex items-center justify-center shadow-[4px_4px_0px_#E85002]">
                  <ImageIcon className="w-5 h-5 text-[#E85002]" />
                </div>
                <div>
                  <p className="text-xs font-black text-black uppercase">No visions yet</p>
                  <p className="text-[10px] text-[#646464] max-w-xs mt-1 font-mono">Build your vision board to keep your goals front and center.</p>
                </div>
                <button className="px-4 py-2 bg-[#E85002] hover:bg-black hover:text-white text-black text-[10.5px] font-black border-2 border-black rounded-none shadow-[3px_3px_0px_#000000] transition active:scale-95 cursor-pointer">
                  + Create First Vision
                </button>
              </div>
            ) : (
              /* Vision cards grid */
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {displayVisions.map((vision, idx) => {
                  // Alternate styles or give a physical polaroid frame!
                  const cardStyles = [
                    'border-2 border-black shadow-[4px_4px_0px_#000000] rounded-none bg-white p-2',
                    'border-2 border-black shadow-[4px_4px_0px_#E85002] rounded-none bg-white p-2',
                    'clay-card border border-[#e2e8f0]/60 bg-white p-2.5',
                    'border-2 border-black shadow-[4px_4px_0px_#333333] rounded-none bg-white p-2'
                  ];
                  const currentStyle = cardStyles[idx % cardStyles.length];
                  const isClay = currentStyle.includes('clay-card');
                  
                  return (
                    <div
                      key={vision.id}
                      onClick={onNavigateVision}
                      className={`relative aspect-[3/4] cursor-pointer group transition-all duration-300 hover:scale-[1.03] ${currentStyle}`}
                    >
                      {/* Photo Container */}
                      <div className={`w-full ${isClay ? 'h-[70%] rounded-lg' : 'h-[72%] border-2 border-black'} overflow-hidden relative bg-[#333]`}>
                        {vision.imageDataUrl ? (
                          <img
                            src={vision.imageDataUrl}
                            alt={vision.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-[radial-gradient(circle_at_center,_#E85002_0%,_#000000_100%)] flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-[#A7A7A7]" />
                          </div>
                        )}
                        
                        {/* Category badge */}
                        <div className="absolute top-2 left-2">
                          <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 border border-black ${categoryColors[vision.category] || 'bg-black text-white'}`}>
                            {vision.category.replace('_', ' ')}
                          </span>
                        </div>

                        {/* Pin badge */}
                        {vision.isPinned && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-white border border-black rounded-none flex items-center justify-center shadow">
                            <Pin className="w-3 h-3 text-[#E85002] fill-[#E85002]" />
                          </div>
                        )}
                      </div>

                      {/* Info Container */}
                      <div className={`p-2 flex flex-col justify-between ${isClay ? 'h-[30%]' : 'h-[28%] pt-3 bg-white'}`}>
                        <h4 className="text-black font-black text-[11px] line-clamp-1 leading-snug uppercase tracking-tight">{vision.title}</h4>
                        <div className="flex items-center justify-between mt-1">
                          {vision.targetDate && (
                            <p className="text-[#646464] text-[8.5px] font-bold font-mono">
                              {new Date(vision.targetDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            </p>
                          )}
                          {vision.progress !== undefined && (
                            <span className="text-[8.5px] font-black text-[#E85002] font-mono">{vision.progress}%</span>
                          )}
                        </div>
                        {vision.progress !== undefined && (
                          <div className="w-full h-1.5 bg-[#A7A7A7] border border-black mt-1 overflow-hidden">
                            <div
                              className="h-full bg-[#E85002]"
                              style={{ width: `${vision.progress}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
