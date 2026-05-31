/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Task, Course } from '../types';
import { 
  Calendar, Clock, ShieldCheck, HelpCircle, GitCommit, AlertCircle, TrendingUp, Info
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
  // Timeline dates: Let's block out 14 days starting from May 30, 2026 to June 12, 2026
  const startDay = new Date('2026-05-30');
  const [timeZoom] = useState<number>(14); // 14-day timeline columns

  const getCourse = (courseId?: string) => {
    return courses.find(c => c.id === courseId);
  };

  // Create date array values for the headers
  const getTimelineDays = () => {
    const arr = [];
    for (let i = 0; i < timeZoom; i++) {
      const nextD = new Date(startDay);
      nextD.setDate(startDay.getDate() + i);
      arr.push(nextD);
    }
    return arr;
  };

  const timelineDays = getTimelineDays();

  // Logic to compute task horizontal offset span matching startDay
  const getTaskOffsetText = (deadlineStr: string) => {
    const dlDate = new Date(deadlineStr);
    const timeDiff = dlDate.getTime() - startDay.getTime();
    const daysOffset = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    // Default task duration representation is 3 days ending on deadline
    const startOffsetCol = Math.max(0, Math.min(timeZoom - 1, daysOffset - 3));
    const widthCols = Math.max(1, Math.min(timeZoom - startOffsetCol, 3));

    return {
      startOffsetCol,
      widthCols
    };
  };

  // Calculations for KPI trackers
  const totalCompleted = tasks.filter(t => t.status === 'completed').length;
  const completionRate = tasks.length > 0 ? Math.round((totalCompleted / tasks.length) * 100) : 0;
  
  const totalEstimatedHours = tasks.reduce((acc, current) => acc + current.estimatedHours, 0);
  const remainingEstimatedHours = tasks
    .filter(t => t.status !== 'completed')
    .reduce((acc, current) => acc + current.estimatedHours, 0);

  // Overdue status mapping
  const overdueCount = tasks.filter(t => {
    const isPast = new Date(t.deadline).getTime() < new Date('2026-05-30').getTime();
    return isPast && t.status !== 'completed';
  }).length;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col h-full font-sans text-slate-800">
      
      {/* Header parameters */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 shrink-0">
        <div>
          <h2 className="text-sm font-bold text-indigo-950 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-indigo-600 animate-pulse" />
            Interactive Project Gantt &amp; Workload Planner
          </h2>
          <p className="text-[10px] text-slate-500 font-medium">Timeline forecast of task dependencies, overlapping cram waves, and hour allocations.</p>
        </div>

        <div className="flex gap-2.5 items-center">
          <span className="text-[10px] text-slate-500 font-mono">Reference Date: May 30, 2026</span>
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-[10px] px-2 py-0.5 rounded font-bold">
            8-Week Semester Map
          </div>
        </div>
      </div>

      {/* KPI stats section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 border border-slate-100 rounded-lg p-3 mb-4 shrink-0">
        <div>
          <span className="text-[10px] text-slate-400 font-bold block uppercase pb-0.5">COMPLETION RATE</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-black text-slate-800">{completionRate}%</span>
            <span className="text-[10px] text-slate-500 font-medium">({totalCompleted}/{tasks.length} tasks)</span>
          </div>
          <div className="w-full bg-slate-200 h-1 rounded-full mt-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-full transition-all" style={{ width: `${completionRate}%` }} />
          </div>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 font-bold block uppercase pb-0.5">ESTIMATED WORKLOAD</span>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-black text-amber-600">{remainingEstimatedHours} hrs</span>
            <span className="text-[10px] text-slate-500 font-semibold">of {totalEstimatedHours}h left</span>
          </div>
          <div className="w-full bg-slate-200 h-1 rounded-full mt-1.5 overflow-hidden">
            <div className="bg-amber-500 h-full transition-all" style={{ width: `${totalEstimatedHours > 0 ? (remainingEstimatedHours / totalEstimatedHours) * 100 : 0}%` }} />
          </div>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 font-bold block uppercase pb-0.5">OVERDUE OVERFLOW</span>
          <div className="flex items-center gap-1 mt-0.5">
            <span className={`text-sm font-black ${overdueCount > 0 ? 'text-red-500' : 'text-slate-700'}`}>{overdueCount} Alerts</span>
            {overdueCount > 0 && <AlertCircle className="w-3.5 h-3.5 text-red-500 animate-bounce" />}
          </div>
          <span className="text-[9px] text-slate-500 font-medium block mt-1">Assignments past the deadline</span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 font-bold block uppercase pb-0.5">PRODUCTIVITY STATS</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-sm font-black text-indigo-700 flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              Optimal
            </span>
          </div>
          <span className="text-[9px] text-slate-500 font-medium block mt-1">Study index: Capstone safe</span>
        </div>
      </div>

      {/* Timeline core plotter */}
      <div className="flex-grow flex flex-col min-h-0 bg-slate-900/5 hover:bg-transparent border border-slate-100 rounded-lg overflow-x-auto">
        <div className="min-w-[640px] flex-grow flex flex-col p-3">
          
          {/* Gantt Timeline Headers */}
          <div className="flex border-b border-slate-200 pb-2 shrink-0">
            <div className="w-44 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left pl-1">Academic Deliverable</div>
            <div className="w-20 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Due Date</div>
            <div className="flex-1 grid grid-cols-14">
              {timelineDays.map((day, idx) => {
                const dayNum = day.getDate();
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                return (
                  <div 
                    key={idx} 
                    className={`text-center flex flex-col justify-center items-center py-1.5 border-r border-slate-105/40 ${isWeekend ? 'bg-indigo-300/10' : ''}`}
                  >
                    <span className="text-[8px] font-bold text-slate-400 uppercase">{day.toLocaleDateString([], { weekday: 'narrow' })}</span>
                    <span className="text-[10px] font-bold text-slate-750 font-mono mt-0.5">{dayNum}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gantt Timeline Rows */}
          <div className="flex-grow divide-y divide-slate-100 overflow-y-auto max-h-[290px] pr-1">
            {tasks.map(task => {
              const crs = getCourse(task.courseId);
              const { startOffsetCol, widthCols } = getTaskOffsetText(task.deadline);
              
              const isOverdue = new Date(task.deadline).getTime() < new Date('2026-05-30').getTime() && task.status !== 'completed';

              return (
                <div key={task.id} className="flex items-center py-2.5 hover:bg-slate-50/70 group">
                  {/* Task details column */}
                  <div className="w-44 pr-3 text-left">
                    <h5 className="text-[11px] font-bold text-slate-800 leading-snug truncate group-hover:text-indigo-600 transition" title={task.title}>
                      {task.title}
                    </h5>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[9px] text-slate-500 font-semibold font-mono">
                      <span className={task.priority === 'high' ? 'text-red-500' : 'text-slate-500'}>
                        {task.priority.toUpperCase()} PRIORITY
                      </span>
                      {crs && <span className="bg-slate-100 px-1 py-0.2 rounded text-[8px]">{crs.code}</span>}
                    </div>
                  </div>

                  {/* Deadline box */}
                  <div className="w-20 text-center pr-2">
                    <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${
                      isOverdue ? 'bg-red-100 text-red-600 animate-pulse' : 'text-slate-500'
                    }`}>
                      {task.deadline.split('-').slice(1).join('/')}
                    </span>
                  </div>

                  {/* Horizontal Bar Plot Span */}
                  <div className="flex-grow grid grid-cols-14 h-6 relative items-center">
                    {/* Visual bar rendering */}
                    <div 
                      className="absolute h-4.5 rounded-md flex items-center justify-between px-2 shadow-sm border text-[8px] font-bold transition-all"
                      style={{
                        left: `${(startOffsetCol / timeZoom) * 100}%`,
                        width: `${(widthCols / timeZoom) * 100}%`,
                        backgroundColor: task.status === 'completed' ? '#d1fae5' 
                          : isOverdue ? '#fee2e2'
                          : crs?.color === 'rose' ? '#ffe4e6'
                          : crs?.color === 'indigo' ? '#e0e7ff'
                          : '#e2e8f0',
                        borderColor: task.status === 'completed' ? '#10b981'
                          : isOverdue ? '#ef4444'
                          : crs?.color === 'rose' ? '#f43f5e'
                          : crs?.color === 'indigo' ? '#4f46e5'
                          : '#94a3b8',
                        color: task.status === 'completed' ? '#065f46' 
                          : isOverdue ? '#991b1b'
                          : crs?.color === 'rose' ? '#9f1239'
                          : crs?.color === 'indigo' ? '#3730a3'
                          : '#334155',
                      }}
                    >
                      <span className="truncate">{task.projectName || 'Task'}</span>
                      <span className="opacity-95 text-[7px] font-mono shrink-0 ml-1">
                        {task.status === 'completed' ? '100%' : 'In Dev'}
                      </span>
                    </div>

                    {/* Columns grid dividers under bars */}
                    {Array.from({ length: timeZoom }).map((_, i) => (
                      <div key={i} className="border-r border-slate-100/50 h-full pointer-events-none"></div>
                    ))}
                  </div>
                </div>
              );
            })}

            {tasks.length === 0 && (
              <div className="text-center py-10 text-slate-400 text-xs">No project coordinates mapped currently.</div>
            )}
          </div>
        </div>
      </div>

      {/* Guide details bottom block */}
      <div className="mt-3 text-[10px] text-slate-400 font-medium bg-indigo-900/5 border border-indigo-100/30 rounded-lg p-2.5 flex items-start gap-2">
        <Info className="w-3.5 h-3.5 text-indigo-600 mt-0.5 flex-none" />
        <div>
          <strong>Overlapping work forecasts:</strong> Course tasks display visually here to highlight heavy mid-semester cram loads. Ensure you split highly coupled tasks into prerequisite dependencies to smooth out study timelines.
        </div>
      </div>
    </div>
  );
}
