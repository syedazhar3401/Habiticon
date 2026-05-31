/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Task, Course } from '../types';
import { 
  Calendar, Info, ChevronDown, ChevronRight, Play, AlertCircle, Clock, Plus, Flame, Award
} from 'lucide-react';

interface GanttModuleProps {
  tasks: Task[];
  courses: Course[];
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
}

export default function GanttModule({
  tasks,
  courses,
  onUpdateTask
}: GanttModuleProps) {
  // Timeline viewport state: scrollable start date defaulting to "Today" reference date 2026-05-30
  const [timelineStartDate, setTimelineStartDate] = useState<Date>(new Date('2026-05-30'));
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const timeZoom = 21; // 21-day scrollable viewport span (3 full weeks)

  const getCourse = (courseId?: string) => {
    return courses.find(c => c.id === courseId);
  };

  // Generate date array for the 21 columns
  const getTimelineDays = () => {
    const arr = [];
    for (let i = 0; i < timeZoom; i++) {
      const nextD = new Date(timelineStartDate);
      nextD.setDate(timelineStartDate.getDate() + i);
      arr.push(nextD);
    }
    return arr;
  };

  const timelineDays = getTimelineDays();

  // Shifting viewport navigation handlers
  const handlePrevWeek = () => {
    setTimelineStartDate(prev => {
      const d = new Date(prev);
      d.setDate(prev.getDate() - 7);
      return d;
    });
  };

  const handleNextWeek = () => {
    setTimelineStartDate(prev => {
      const d = new Date(prev);
      d.setDate(prev.getDate() + 7);
      return d;
    });
  };

  const handleResetToday = () => {
    setTimelineStartDate(new Date('2026-05-30'));
  };

  // Formatter for Top timeline weekly ranges
  const getWeekRangeLabel = (startOffsetDays: number) => {
    const start = new Date(timelineStartDate);
    start.setDate(timelineStartDate.getDate() + startOffsetDays);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' };
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
  };

  // Dynamic calculations for Task offsets and spans relative to timelineStartDate
  const getTaskTimelineSpan = (t: Task) => {
    const taskStart = t.startDate ? new Date(t.startDate) : new Date('2026-05-30');
    const taskEnd = new Date(t.deadline);
    
    const startDiff = taskStart.getTime() - timelineStartDate.getTime();
    const startOffsetCol = Math.round(startDiff / (1000 * 3600 * 24));
    
    const durDiff = taskEnd.getTime() - taskStart.getTime();
    const widthCols = Math.max(1, Math.round(durDiff / (1000 * 3600 * 24)) + 1);
    
    return { startOffsetCol, widthCols };
  };

  // Calculate Course parent folder range span
  const getParentTimelineSpan = (folderTasks: Task[]) => {
    if (folderTasks.length === 0) return { startOffsetCol: 0, widthCols: 0 };
    
    let earliestStart = new Date(folderTasks[0].startDate || '2026-05-30');
    let latestEnd = new Date(folderTasks[0].deadline);
    
    folderTasks.forEach(t => {
      const tStart = t.startDate ? new Date(t.startDate) : new Date('2026-05-30');
      const tEnd = new Date(t.deadline);
      if (tStart < earliestStart) earliestStart = tStart;
      if (tEnd > latestEnd) latestEnd = tEnd;
    });
    
    const startDiff = earliestStart.getTime() - timelineStartDate.getTime();
    const startOffsetCol = Math.round(startDiff / (1000 * 3600 * 24));
    
    const durDiff = latestEnd.getTime() - earliestStart.getTime();
    const widthCols = Math.max(1, Math.round(durDiff / (1000 * 3600 * 24)) + 1);
    
    return { startOffsetCol, widthCols };
  };

  // Group tasks dynamically by project / course
  const groupedTasks: Record<string, Task[]> = {};
  tasks.forEach(t => {
    const crs = getCourse(t.courseId);
    const groupName = t.projectName || (crs ? `${crs.code} - ${crs.name}` : 'General / Elective Study');
    if (!groupedTasks[groupName]) {
      groupedTasks[groupName] = [];
    }
    groupedTasks[groupName].push(t);
  });

  const toggleGroup = (groupName: string) => {
    setCollapsedGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  // Calculate Today index for the pink vertical line
  const todayIndex = Math.round((new Date('2026-05-30').getTime() - timelineStartDate.getTime()) / (1000 * 3600 * 24));

  // Calculations for KPI trackers
  const totalCompleted = tasks.filter(t => t.status === 'completed').length;
  const completionRate = tasks.length > 0 ? Math.round((totalCompleted / tasks.length) * 100) : 0;
  const totalEstimatedHours = tasks.reduce((acc, current) => acc + current.estimatedHours, 0);
  const remainingEstimatedHours = tasks
    .filter(t => t.status !== 'completed')
    .reduce((acc, current) => acc + current.estimatedHours, 0);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col h-full font-sans text-slate-800">
      
      {/* Header section with view shifting controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 shrink-0">
        <div>
          <h2 className="text-sm font-bold text-indigo-950 flex items-center gap-1.5 select-none">
            <Calendar className="w-4 h-4 text-indigo-600 animate-pulse" />
            Interactive Project Gantt &amp; Workload Planner
          </h2>
          <p className="text-[10px] text-slate-500 font-medium">Timeline forecast of task dependencies, overlapping course timelines, and target durations.</p>
        </div>

        <div className="flex gap-2 items-center">
          {/* Scrollable controls forward/backward chevrons */}
          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50 mr-2 shadow-xs">
            <button 
              onClick={handlePrevWeek} 
              className="px-2.5 py-1.5 text-xs font-bold text-slate-650 hover:bg-slate-100 transition border-r border-slate-200 cursor-pointer"
              title="Previous Week"
            >
              ◀
            </button>
            <button 
              onClick={handleResetToday} 
              className="px-3 py-1.5 text-[10.5px] font-extrabold text-indigo-650 hover:bg-slate-100 transition border-r border-slate-200 cursor-pointer"
              title="Jump to Today"
            >
              Today
            </button>
            <button 
              onClick={handleNextWeek} 
              className="px-2.5 py-1.5 text-xs font-bold text-slate-650 hover:bg-slate-100 transition cursor-pointer"
              title="Next Week"
            >
              ▶
            </button>
          </div>
          
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-[10px] px-2.5 py-1 rounded font-bold uppercase tracking-wide select-none">
            ClickUp Workspace View
          </div>
        </div>
      </div>

      {/* KPI stats section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 border border-slate-100 rounded-lg p-3 mb-4 shrink-0">
        <div>
          <span className="text-[10px] text-slate-400 font-bold block uppercase pb-0.5 select-none">COMPLETION RATE</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-black text-slate-800">{completionRate}%</span>
            <span className="text-[10px] text-slate-500 font-medium select-none">({totalCompleted}/{tasks.length} tasks)</span>
          </div>
          <div className="w-full bg-slate-200 h-1 rounded-full mt-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-full transition-all" style={{ width: `${completionRate}%` }} />
          </div>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 font-bold block uppercase pb-0.5 select-none">ESTIMATED WORKLOAD</span>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-black text-amber-600">{remainingEstimatedHours} hrs</span>
            <span className="text-[10px] text-slate-500 font-semibold select-none">of {totalEstimatedHours}h left</span>
          </div>
          <div className="w-full bg-slate-200 h-1 rounded-full mt-1.5 overflow-hidden">
            <div className="bg-amber-500 h-full transition-all" style={{ width: `${totalEstimatedHours > 0 ? (remainingEstimatedHours / totalEstimatedHours) * 100 : 0}%` }} />
          </div>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 font-bold block uppercase pb-0.5 select-none">VIEWPORT SPAN</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-[11px] font-bold text-slate-850 font-mono">
              {timelineStartDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })} to
            </span>
            <span className="text-[11px] font-bold text-slate-850 font-mono">
              {(() => {
                const end = new Date(timelineStartDate);
                end.setDate(timelineStartDate.getDate() + 20);
                return end.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
              })()}
            </span>
          </div>
          <span className="text-[9px] text-indigo-650 font-semibold block mt-1 font-mono uppercase tracking-wide select-none">3-Week date range active</span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 font-bold block uppercase pb-0.5 select-none">PRODUCTIVITY STATS</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-sm font-black text-indigo-700 flex items-center gap-1 select-none">
              <Flame className="w-4 h-4 text-amber-500" />
              Active Revision
            </span>
          </div>
          <span className="text-[9px] text-slate-500 font-medium block mt-1 select-none">Study index: Capstone safe</span>
        </div>
      </div>

      {/* Unified Spreadsheet and Timeline Container */}
      <div className="flex-grow flex flex-col min-h-0 border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-white">
        
        {/* Unified Table Header Grid */}
        <div className="flex bg-slate-50 border-b border-slate-200 select-none shrink-0 z-20">
          
          {/* Left Table Header columns */}
          <div className="w-[500px] flex shrink-0 border-r border-slate-200 text-left text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider items-center h-10 pl-3 pr-3">
            <div className="w-[180px] shrink-0 pl-1">NAME</div>
            <div className="w-24 shrink-0 text-center">STATUS</div>
            <div className="w-18 shrink-0 text-center">PRIORITY</div>
            <div className="w-16 shrink-0 text-center">START DATE</div>
            <div className="w-16 shrink-0 text-center">END DATE</div>
          </div>

          {/* Right Timeline Header columns */}
          <div className="flex-grow flex flex-col min-w-[500px] relative">
            {/* Top row: 3 Weekly Date buckets */}
            <div className="h-5 flex border-b border-slate-150 text-[9px] font-bold text-slate-400 uppercase tracking-wider text-center divide-x divide-slate-200/80 bg-slate-50">
              <div className="w-[33.33%] flex items-center justify-center truncate">{getWeekRangeLabel(0)}</div>
              <div className="w-[33.33%] flex items-center justify-center truncate">{getWeekRangeLabel(7)}</div>
              <div className="w-[33.33%] flex items-center justify-center truncate">{getWeekRangeLabel(14)}</div>
            </div>

            {/* Bottom row: 21 Day Columns */}
            <div className="h-5 grid grid-cols-21 divide-x divide-slate-100 text-[8.5px] font-bold text-slate-500/80 text-center font-mono items-center bg-slate-50/50">
              {timelineDays.map((day, idx) => {
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                return (
                  <div key={idx} className={`h-full flex items-center justify-center select-none ${isWeekend ? 'bg-indigo-300/10' : ''}`}>
                    {day.getDate()}
                  </div>
                );
              })}
            </div>

            {/* Floating "Today" Badge Line Header (absolute placed) */}
            {todayIndex >= 0 && todayIndex < timeZoom && (
              <div 
                className="absolute top-0 w-6 h-full flex flex-col items-center pointer-events-none z-30"
                style={{ left: `calc(${(todayIndex / timeZoom) * 100}% - 12px)` }}
              >
                <span className="bg-pink-500 text-white font-extrabold text-[7.5px] px-1 py-0.2 rounded-sm shadow-xs select-none">
                  Today
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Unified Table rows viewport */}
        <div className="flex-grow overflow-y-auto max-h-[350px] divide-y divide-slate-100 relative">
          
          {Object.keys(groupedTasks).map(groupName => {
            const groupTaskList = groupedTasks[groupName];
            const isCollapsed = collapsedGroups[groupName] || false;
            
            // Calculate parent folder timeline span
            const parentSpan = getParentTimelineSpan(groupTaskList);
            const { startOffsetCol: pStart, widthCols: pWidth } = parentSpan;
            const pEnd = pStart + pWidth;
            const pHasOverlap = pWidth > 0 && pStart < timeZoom && pEnd > 0;
            
            const pVisualStart = Math.max(0, pStart);
            const pVisualEnd = Math.min(timeZoom, pEnd);
            const pVisualWidth = pVisualEnd - pVisualStart;
            
            const pLeftPct = (pVisualStart / timeZoom) * 100;
            const pWidthPct = (pVisualWidth / timeZoom) * 100;
            
            return (
              <div key={groupName} className="flex flex-col">
                
                {/* A. Group Header Folder Row */}
                <div className="flex items-center bg-slate-50/70 hover:bg-slate-50 transition border-b border-slate-150 h-9 shrink-0 select-none z-10">
                  
                  {/* Left Column values */}
                  <div className="w-[500px] shrink-0 border-r border-slate-200 pl-3 flex items-center pr-3">
                    <div className="w-[180px] shrink-0 flex items-center pr-2">
                      <button 
                        onClick={() => toggleGroup(groupName)}
                        className="p-1 hover:bg-slate-200/60 rounded text-slate-400 hover:text-slate-800 transition mr-1 cursor-pointer border-none bg-transparent flex items-center"
                      >
                        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                      
                      <span className="w-2.5 h-2.5 rounded bg-indigo-500 mr-2 inline-block shadow-inner shrink-0" />
                      
                      <h4 className="flex-grow text-[10.5px] font-black text-indigo-950 truncate text-left" title={groupName}>
                        {groupName}
                      </h4>
                    </div>

                    {/* Group Status summary columns */}
                    <div className="w-24 shrink-0 text-[9px] font-bold text-slate-450 text-center uppercase tracking-wide">
                      Group Folder
                    </div>
                    <div className="w-18 shrink-0 text-center text-slate-400">-</div>
                    <div className="w-16 shrink-0 text-center text-slate-400">-</div>
                    <div className="w-16 shrink-0 text-center text-slate-400">-</div>
                  </div>

                  {/* Right Timeline section: Spans Course combined project range */}
                  <div className="flex-grow min-w-[500px] h-full relative flex items-center">
                    {/* Visual parent range bar with precise bounds overlap clipping */}
                    {!isCollapsed && pHasOverlap && (
                      <div 
                        className="absolute h-1.5 rounded-full bg-emerald-500 shadow-sm border border-emerald-400 z-10 transition-all opacity-85"
                        style={{
                          left: `${pLeftPct}%`,
                          width: `${pWidthPct}%`
                        }}
                        title={`${groupName} combined range`}
                      />
                    )}

                    {/* Grid backgrounds divider lines */}
                    <div className="absolute inset-0 grid grid-cols-21 pointer-events-none divide-x divide-slate-100/50 h-full">
                      {Array.from({ length: timeZoom }).map((_, i) => (
                        <div key={i} className="h-full"></div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* B. Children Task Rows (only if folder expanded) */}
                {!isCollapsed && groupTaskList.map(task => {
                  const { startOffsetCol, widthCols } = getTaskTimelineSpan(task);
                  const endCol = startOffsetCol + widthCols;
                  const isOverdue = new Date(task.deadline).getTime() < new Date('2026-05-30').getTime() && task.status !== 'completed';

                  const hasOverlap = widthCols > 0 && startOffsetCol < timeZoom && endCol > 0;
                  const visualStart = Math.max(0, startOffsetCol);
                  const visualEnd = Math.min(timeZoom, endCol);
                  const visualWidth = visualEnd - visualStart;

                  const leftPct = (visualStart / timeZoom) * 100;
                  const widthPct = (visualWidth / timeZoom) * 100;

                  return (
                    <div key={task.id} className="flex items-center hover:bg-slate-50/50 transition h-9 shrink-0 group">
                      
                      {/* Left Spreadsheet cells */}
                      <div className="w-[500px] shrink-0 border-r border-slate-200 pl-3 flex items-center pr-3">
                        <div className="w-[180px] shrink-0 flex items-center pr-2">
                          <div className="w-5 flex items-center justify-center shrink-0">
                            {/* Hierarchical bullet guidelines */}
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-indigo-450 transition shrink-0" />
                          </div>
                          
                          {/* Task Title */}
                          <div className="flex-grow text-[10.5px] font-bold text-slate-850 leading-snug truncate text-left group-hover:text-indigo-650 transition pl-1" title={task.title}>
                            {task.title}
                          </div>
                        </div>

                        {/* STATUS Badges (Capitalized) */}
                        <div className="w-24 shrink-0 text-center flex justify-center items-center">
                          <span className={`text-[8.5px] font-black tracking-wider px-1.5 py-0.5 rounded uppercase select-none ${
                            task.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/50'
                              : isOverdue ? 'bg-rose-50 text-rose-600 border border-rose-200/50 animate-pulse'
                              : task.status === 'in_progress' ? 'bg-sky-50 text-sky-600 border border-sky-200/50'
                              : 'bg-slate-50 text-slate-500 border border-slate-200/50'
                          }`}>
                            {task.status === 'completed' ? 'COMPLETE' 
                              : isOverdue ? 'BLOCKED'
                              : task.status === 'in_progress' ? 'IN PROGRESS'
                              : 'TO DO'}
                          </span>
                        </div>

                        {/* PRIORITY Badges (Capitalized) */}
                        <div className="w-18 shrink-0 text-center flex justify-center items-center">
                          <span className={`text-[8.5px] font-black tracking-wider px-1.5 py-0.5 rounded-md uppercase select-none ${
                            task.priority === 'high' ? 'bg-red-50 text-red-600'
                              : task.priority === 'medium' ? 'bg-amber-50 text-amber-600'
                              : 'bg-blue-50 text-blue-600'
                          }`}>
                            {task.priority.toUpperCase()}
                          </span>
                        </div>

                        {/* START DATE */}
                        <div className="w-16 shrink-0 text-center text-[9px] font-semibold text-slate-500 font-mono">
                          {task.startDate ? task.startDate.split('-').slice(1).join('/') : '05/30'}
                        </div>

                        {/* END DATE */}
                        <div className="w-16 shrink-0 text-center text-[9px] font-semibold text-slate-500 font-mono">
                          {task.deadline.split('-').slice(1).join('/')}
                        </div>
                      </div>

                      {/* Right Timeline grid area */}
                      <div className="flex-grow min-w-[500px] h-full relative flex items-center select-none">
                        
                        {/* Task duration pill bar with precise viewport clipping */}
                        {hasOverlap && (
                          <div 
                            className="absolute h-5 rounded-full flex items-center justify-center px-3.5 shadow-sm border text-[8px] font-bold text-white tracking-wide transition-all duration-300 hover:scale-[1.02] hover:shadow-md cursor-pointer truncate"
                            style={{
                              left: `${leftPct}%`,
                              width: `${widthPct}%`,
                              backgroundColor: task.status === 'completed' ? '#10b981' 
                                : isOverdue ? '#ef4444'
                                : task.status === 'in_progress' ? '#0ea5e9'
                                : '#f59e0b',
                              borderColor: task.status === 'completed' ? '#059669'
                                : isOverdue ? '#dc2626'
                                : task.status === 'in_progress' ? '#0284c7'
                                : '#d97706',
                            }}
                            title={`${task.title}: ${task.startDate || '05-30'} to ${task.deadline}`}
                          >
                            <span className="truncate select-none">{task.title}</span>
                          </div>
                        )}

                        {/* Grid divider background columns */}
                        <div className="absolute inset-0 grid grid-cols-21 pointer-events-none divide-x divide-slate-100/50 h-full">
                          {Array.from({ length: timeZoom }).map((_, i) => (
                            <div key={i} className="h-full"></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}

              </div>
            );
          })}

          {/* Today magenta absolute vertical tracking line */}
          {todayIndex >= 0 && todayIndex < timeZoom && (
            <div 
              className="absolute top-0 w-[2px] h-full bg-pink-500/80 pointer-events-none z-30 select-none"
              style={{ left: `${(todayIndex / timeZoom) * 100}%` }}
            />
          )}

          {tasks.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-xs select-none">No active task coordinates mapped.</div>
          )}
        </div>
      </div>

      {/* Workload helper details bottom bar */}
      <div className="mt-3 text-[10px] text-indigo-950 font-medium bg-indigo-900/5 border border-indigo-100/30 rounded-lg p-2.5 flex items-start gap-2 select-none">
        <Info className="w-3.5 h-3.5 text-indigo-650 mt-0.5 flex-none animate-bounce" />
        <div>
          <strong>Unified ClickUp Timeline Guide:</strong> Group folder nodes show cumulative timeline ranges in green. Use the 
          <strong> prev week (◀)</strong> and <strong>next week (▶)</strong> controls to shift the dynamic 3-week date viewport backward and forward. Adjust start and end dates directly on your Kanban Task board cards.
        </div>
      </div>
    </div>
  );
}
