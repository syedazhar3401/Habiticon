/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Task, Course } from '../types';
import { 
  Plus, Kanban, List, Calendar as CalIcon, CheckCircle, Clock, Trash2, ArrowRight, CornerDownRight, Filter, AlertTriangle, ShieldCheck
} from 'lucide-react';

interface TaskModuleProps {
  tasks: Task[];
  courses: Course[];
  onAddTask: (task: Task) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onQuickAdd: (title: string, courseId?: string) => void;
}

export default function TaskModule({
  tasks,
  courses,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onQuickAdd
}: TaskModuleProps) {
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newCourseId, setNewCourseId] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newStartDate, setNewStartDate] = useState('2026-05-30');
  const [newDeadline, setNewDeadline] = useState('2026-06-05');
  const [newEstimatedHours, setNewEstimatedHours] = useState('4');
  const [newDescription, setNewDescription] = useState('');
  const [newProject, setNewProject] = useState('Assignments');
  const [selectedDeps, setSelectedDeps] = useState<string[]>([]);

  // Filtering
  const filteredTasks = tasks.filter(t => {
    const courseMatch = filterCourse === 'all' || t.courseId === filterCourse;
    const priMatch = filterPriority === 'all' || t.priority === filterPriority;
    return courseMatch && priMatch;
  });

  const getCourse = (courseId?: string) => {
    return courses.find(c => c.id === courseId);
  };

  const cramTasks = tasks.filter(t => {
    if (t.status === 'completed') return false;
    
    // Parse deadline
    const deadlineDate = new Date(t.deadline + 'T00:00:00');
    
    // Current date (Malaysia Time GMT+8)
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const msiaTime = new Date(utc + (3600000 * 8));
    // Clear time for date calculations
    const today = new Date(msiaTime.getFullYear(), msiaTime.getMonth(), msiaTime.getDate());
    
    // Difference in milliseconds
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    
    // Overdue is diffDays < 0
    // Within 48 hours is diffDays <= 2
    return diffDays <= 2;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const added: Task = {
      id: `task-${Date.now()}`,
      title: newTitle,
      courseId: newCourseId || undefined,
      priority: newPriority,
      startDate: newStartDate,
      deadline: newDeadline,
      estimatedHours: Number(newEstimatedHours) || 2,
      progress: 0,
      status: 'not_started',
      dependencies: selectedDeps.length > 0 ? selectedDeps : undefined,
      description: newDescription,
      projectName: newProject || undefined
    };

    onAddTask(added);
    resetForm();
  };

  const resetForm = () => {
    setNewTitle('');
    setNewCourseId('');
    setNewPriority('medium');
    setNewStartDate('2026-05-30');
    setNewDeadline('2026-06-05');
    setNewEstimatedHours('4');
    setNewDescription('');
    setNewProject('Assignments');
    setSelectedDeps([]);
    setShowAddModal(false);
  };

  // Helper toggle completion
  const handleToggleCompletion = (task: Task) => {
    if (task.status === 'completed') {
      onUpdateTask(task.id, { status: 'not_started', progress: 0 });
    } else {
      onUpdateTask(task.id, { status: 'completed', progress: 100 });
    }
  };

  const handleUpdateStatus = (id: string, newStatus: 'not_started' | 'in_progress' | 'completed') => {
    const progress = newStatus === 'completed' ? 100 : newStatus === 'in_progress' ? 50 : 0;
    onUpdateTask(id, { status: newStatus, progress });
  };

  const renderKanbanLane = (title: string, statusKey: 'not_started' | 'in_progress' | 'completed', laneStyle: string) => {
    const laneTasks = filteredTasks.filter(t => t.status === statusKey);
    const isDark = statusKey === 'in_progress';
    const isClay = statusKey === 'completed';

    // Badge styling
    const badgeBg = isDark ? 'bg-[#E85002] text-black border border-black' : 'bg-black text-white border border-black';

    return (
      <div className={`flex-grow p-4 min-h-[420px] flex flex-col font-sans ${laneStyle}`}>
        <div className={`flex justify-between items-center mb-4 pb-2 border-b-2 shrink-0 ${isDark ? 'border-[#333]' : isClay ? 'border-[#e2e8f0]' : 'border-black'}`}>
          <h3 className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-[#E85002]' : 'text-black'}`}>
            <span className={`w-2.5 h-2.5 border border-black ${statusKey === 'completed' ? 'bg-black' : statusKey === 'in_progress' ? 'bg-[#E85002]' : 'bg-[#A7A7A7]'}`}></span>
            {title}
          </h3>
          <span className={`text-[10px] font-black px-2 py-0.5 font-mono ${badgeBg}`}>
            {laneTasks.length}
          </span>
        </div>

        <div className="flex-grow space-y-3 overflow-y-auto pr-1">
          {laneTasks.length === 0 ? (
            <div className={`text-center py-10 font-mono text-[10.5px] font-bold uppercase tracking-wider ${isDark ? 'text-[#A7A7A7]' : 'text-[#646464]'}`}>
              No tasks active
            </div>
          ) : (
            laneTasks.map(task => {
              const crs = getCourse(task.courseId);
              return (
                <div 
                  key={task.id}
                  className={`border-2 border-black p-3 rounded-none shadow-[2px_2px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all group flex flex-col text-left ${isDark ? 'bg-[#333333] text-white' : 'bg-white text-black'}`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className={`text-[9px] font-black px-1.5 py-0.5 uppercase border border-black ${
                      task.priority === 'high' ? 'bg-[#E85002] text-black' : task.priority === 'medium' ? 'bg-black text-white' : 'bg-[#A7A7A7] text-black'
                    }`}>
                      {task.priority} Priority
                    </span>
                    <button 
                      onClick={() => onDeleteTask(task.id)}
                      className={`opacity-0 group-hover:opacity-100 hover:text-[#E85002] rounded p-0.5 text-xs transition cursor-pointer ${isDark ? 'text-[#A7A7A7]' : 'text-black'}`}
                      title="Delete assignment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h5 className="text-xs font-black uppercase mt-2 leading-snug tracking-wide font-sans truncate">
                    {task.title}
                  </h5>

                  {crs && (
                    <span className="text-[10.5px] font-black text-[#E85002] mt-1 font-mono uppercase">
                      {crs.code} - {crs.name}
                    </span>
                  )}

                  {task.description && (
                    <p className={`text-[10px]/snug mt-1.5 line-clamp-2 font-mono ${isDark ? 'text-[#A7A7A7]' : 'text-[#646464]'}`}>
                      {task.description}
                    </p>
                  )}

                  {/* Estimated hours & Progress */}
                  <div className={`flex items-center justify-between text-[10px] mt-3 pb-2 border-b font-mono font-bold ${isDark ? 'border-[#333] text-[#A7A7A7]' : 'border-black/20 text-[#333333]'}`}>
                    <span className="flex items-center gap-1">
                      <Clock className={`w-3.5 h-3.5 ${isDark ? 'text-white' : 'text-black'}`} />
                      {task.estimatedHours} hrs est
                    </span>
                    <span>
                      {task.startDate ? `${task.startDate.split('-').slice(1).join('/')} to ${task.deadline.split('-').slice(1).join('/')}` : `Due ${task.deadline.split('-').slice(1).join('/')}`}
                    </span>
                  </div>

                  {/* Task Actions */}
                  <div className="flex justify-between items-center mt-3 pt-1">
                    <span className={`text-[9px] font-mono font-bold ${isDark ? 'text-[#A7A7A7]' : 'text-[#646464]'}`}>
                      Proj: {task.projectName || 'Academics'}
                    </span>
                    <div className="flex gap-1.5">
                      {statusKey !== 'not_started' && (
                        <button 
                          onClick={() => handleUpdateStatus(task.id, 'not_started')}
                          className="bg-white hover:bg-[#E85002] text-black font-black px-2 py-0.5 border border-black text-[9px] transition cursor-pointer rounded-none"
                        >
                          To Todo
                        </button>
                      )}
                      {statusKey !== 'in_progress' && (
                        <button 
                          onClick={() => handleUpdateStatus(task.id, 'in_progress')}
                          className="bg-[#E85002] hover:bg-black hover:text-[#E85002] text-black font-black px-2 py-0.5 border border-black text-[9px] transition cursor-pointer rounded-none"
                        >
                          In Dev
                        </button>
                      )}
                      {statusKey !== 'completed' && (
                        <button 
                          onClick={() => handleUpdateStatus(task.id, 'completed')}
                          className="bg-black hover:bg-[#E85002] text-white hover:text-black font-black px-2 py-0.5 border border-black text-[9px] transition cursor-pointer rounded-none"
                        >
                          Solve
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const renderListView = () => {
    if (filteredTasks.length === 0) {
      return (
        <div className="text-center py-12 text-[#A7A7A7] font-mono font-bold uppercase">No tasks match active criteria filters.</div>
      );
    }

    return (
      <div className="border-2 border-black rounded-none overflow-hidden shadow-[3px_3px_0px_#000000]">
        <table className="w-full text-left border-collapse bg-white text-black font-sans">
          <thead>
            <tr className="bg-black text-[#F9F9F9] border-b-2 border-black text-[10px] font-black uppercase tracking-wider">
              <th className="py-3 px-4">Subject Course</th>
              <th className="py-3 px-4">Task Deliverable</th>
              <th className="py-3 px-4">Milestone Category</th>
              <th className="py-3 px-4">Priority Weight</th>
              <th className="py-3 px-4">Target Date</th>
              <th className="py-3 px-4 text-center">Progress Status</th>
              <th className="py-3 px-4 text-right">Clear</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-black text-xs font-bold">
            {filteredTasks.map(tk => {
              const crs = getCourse(tk.courseId);
              return (
                <tr key={tk.id} className="hover:bg-[#E85002]/5 transition">
                  <td className="py-3 px-4 font-mono font-black text-[#E85002]">
                    {crs ? crs.code : 'Elective'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={tk.status === 'completed' ? 'line-through text-[#A7A7A7]' : 'text-black'}>
                      {tk.title}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono">{tk.projectName || 'General'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 border border-black font-black uppercase text-[9px] ${
                      tk.priority === 'high' ? 'bg-[#E85002] text-black' : tk.priority === 'medium' ? 'bg-black text-white' : 'bg-[#A7A7A7] text-black'
                    }`}>
                      {tk.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono">{tk.deadline}</td>
                  <td className="py-3 px-4 text-center">
                    <button 
                      onClick={() => handleToggleCompletion(tk)}
                      className={`px-3 py-1 border-2 border-black font-black text-[10px] transition cursor-pointer rounded-none uppercase ${
                        tk.status === 'completed' ? 'bg-black text-white' : 'bg-white text-black hover:bg-[#E85002]'
                      }`}
                    >
                      {tk.status.replace('_', ' ')}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button 
                      onClick={() => onDeleteTask(tk.id)}
                      className="p-1 hover:bg-[#E85002] rounded border border-black text-black transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="bg-[#F9F9F9] border-2 border-black rounded-none p-4 shadow-[4px_4px_0px_#000000] flex flex-col h-full font-sans text-black">
      {/* Dynamic Header */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4 select-none shrink-0">
        <div>
          <h2 className="text-sm font-black text-black flex items-center gap-1.5 uppercase tracking-wider">
            <Kanban className="w-4 h-4 text-[#E85002]" />
            Kanban Task Board
          </h2>
          <p className="text-[10px] text-[#333] font-mono font-bold">Monitor milestone dependencies, target estimates, and solve assignments.</p>
        </div>

        {/* Action controllers */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* View toggle */}
          <div className="flex border-2 border-black bg-black p-0.5 rounded-none shadow-[2px_2px_0px_#000000]">
            <button 
              onClick={() => setView('kanban')}
              className={`p-1.5 rounded-none text-[10px] font-black transition cursor-pointer ${view === 'kanban' ? 'bg-[#E85002] text-black' : 'text-white hover:text-[#E85002]'}`}
              title="Kanban Lanes View"
            >
              <Kanban className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setView('list')}
              className={`p-1.5 rounded-none text-[10px] font-black transition cursor-pointer ${view === 'list' ? 'bg-[#E85002] text-black' : 'text-white hover:text-[#E85002]'}`}
              title="Database Listing View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-1 bg-white border-2 border-black px-2 py-1 rounded-none text-[11px] font-bold shadow-[2px_2px_0px_#000000]">
            <Filter className="w-3 h-3 text-black" />
            <select 
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="bg-transparent font-black border-none outline-none cursor-pointer text-black"
            >
              <option value="all">All Subjects</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.code}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-white border-2 border-black px-2 py-1 rounded-none text-[11px] font-bold shadow-[2px_2px_0px_#000000]">
            <select 
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-transparent font-black border-none outline-none cursor-pointer text-black"
            >
              <option value="all">All Priority</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-[#E85002] hover:bg-black hover:text-[#E85002] text-black text-[11px] font-black px-3.5 py-1.5 border-2 border-black rounded-none shadow-[2px_2px_0px_#000000] flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Deliverable
          </button>
        </div>
      </div>

      {/* View Display */}
      <div className="flex-grow overflow-y-auto">
        {view === 'kanban' ? (
          <div className="flex flex-col gap-4 min-h-full">
            {cramTasks.length > 0 && (
              <div className="border-4 border-black bg-yellow-400 p-4 rounded-none shadow-[4px_4px_0px_#000000] relative overflow-hidden shrink-0">
                {/* Header block */}
                <div className="flex items-center justify-between pb-2 border-b-2 border-black mb-3">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-600 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600 border border-black"></span>
                    </span>
                    <AlertTriangle className="w-4 h-4 text-black stroke-[3]" />
                    <span className="font-black text-[11px] uppercase tracking-wider text-black">
                      Urgent Cram Alarm: Imminent Deadlines (Within 48h or Overdue)
                    </span>
                  </div>
                  <span className="bg-black text-yellow-400 font-mono text-[9px] font-black px-2 py-0.5 border border-black uppercase">
                    {cramTasks.length} {cramTasks.length === 1 ? 'Task' : 'Tasks'} Pending
                  </span>
                </div>
                {/* Task list grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {cramTasks.map(t => {
                    const crs = getCourse(t.courseId);
                    const isOverdue = new Date(t.deadline + 'T23:59:59') < new Date();
                    return (
                      <div key={t.id} className="bg-white border-2 border-black p-2.5 rounded-none shadow-[2px_2px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
                        <div className="flex justify-between items-start">
                          <span className={`text-[8px] font-black px-1.5 py-0.5 uppercase border border-black ${
                            isOverdue ? 'bg-rose-500 text-white' : 'bg-[#E85002] text-black'
                          }`}>
                            {isOverdue ? 'Overdue' : 'Due Soon'}
                          </span>
                          <span className="text-[9px] font-mono font-bold text-black">
                            Due: {t.deadline}
                          </span>
                        </div>
                        <h4 className="text-xs font-black text-black mt-2 truncate uppercase font-sans">
                          {t.title}
                        </h4>
                        {crs && (
                          <div className="text-[9px] font-black text-[#E85002] font-mono mt-0.5 uppercase">
                            {crs.code} - {crs.name}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="flex flex-col md:flex-row gap-4 flex-grow">
              {renderKanbanLane('To Do Queue', 'not_started', 'neo-card-a')}
              {renderKanbanLane('In Development / Revise', 'in_progress', 'neo-card-c')}
              {renderKanbanLane('Solved / Completed', 'completed', 'clay-card border border-[#e2e8f0]/60')}
            </div>
          </div>
        ) : (
          renderListView()
        )}
      </div>

      {/* Task Creation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-black rounded-none shadow-[8px_8px_0px_#E85002] max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-150 text-black">
            <div className="bg-black text-white px-5 py-4 flex items-center justify-between flex-none border-b-4 border-black">
              <div>
                <h3 className="font-black text-xs uppercase tracking-wider">Create Academic Task &amp; Milestone</h3>
                <p className="text-[9.5px] opacity-75 mt-0.5 font-mono">Structure estimates, group deliverables, and connect courses.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-white hover:text-[#E85002] font-black text-lg cursor-pointer">×</button>
            </div>

            <form onSubmit={handleCreate} className="flex flex-col flex-1 overflow-hidden bg-[#F9F9F9]">
              <div className="p-5 space-y-3 flex-1 overflow-y-auto scrollbar-thin">
                {/* Task Title */}
                <div>
                  <label className="block text-[10px] font-black text-black uppercase mb-1 font-mono">Task Deliverable Name</label>
                  <input 
                    type="text" 
                    value={newTitle} 
                    onChange={(e) => setNewTitle(e.target.value)} 
                    placeholder="e.g. Design Entity Relationship Diagram"
                    className="w-full bg-white border-2 border-black rounded-none px-3 py-1.5 text-xs text-black focus:outline-none focus:border-[#E85002] shadow-[2px_2px_0px_#000000] font-mono font-bold"
                    required
                  />
                </div>

                {/* Course linking Selection */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-black uppercase mb-1 font-mono">Subject Course ID</label>
                    <select 
                      value={newCourseId} 
                      onChange={(e) => setNewCourseId(e.target.value)}
                      className="w-full bg-white border-2 border-black rounded-none px-2.5 py-1.5 text-xs text-black focus:outline-none focus:border-[#E85002] shadow-[2px_2px_0px_#000000] font-black"
                    >
                      <option value="">Elective or Self study</option>
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-black uppercase mb-1 font-mono">Priority Weights</label>
                    <select 
                      value={newPriority} 
                      onChange={(e) => setNewPriority(e.target.value as any)}
                      className="w-full bg-white border-2 border-black rounded-none px-2.5 py-1.5 text-xs text-black focus:outline-none focus:border-[#E85002] shadow-[2px_2px_0px_#000000] font-black"
                    >
                      <option value="high">High stakes / Cram alarm</option>
                      <option value="medium">Medium workload</option>
                      <option value="low">Low priority review</option>
                    </select>
                  </div>
                </div>

                {/* Estimated / Deadline */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-black uppercase mb-1 font-mono">Start Date</label>
                    <input 
                      type="date" 
                      value={newStartDate} 
                      onChange={(e) => setNewStartDate(e.target.value)}
                      className="w-full bg-white border-2 border-black rounded-none p-1.5 text-xs text-black shadow-[2px_2px_0px_#000000] font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-black uppercase mb-1 font-mono">Target Deadline</label>
                    <input 
                      type="date" 
                      value={newDeadline} 
                      onChange={(e) => setNewDeadline(e.target.value)}
                      className="w-full bg-white border-2 border-black rounded-none p-1.5 text-xs text-black shadow-[2px_2px_0px_#000000] font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1">
                  <div>
                    <label className="block text-[10px] font-black text-black uppercase mb-1 font-mono">Est Completion time (hrs)</label>
                    <input 
                      type="number" 
                      value={newEstimatedHours} 
                      onChange={(e) => setNewEstimatedHours(e.target.value)}
                      placeholder="4"
                      className="w-full bg-white border-2 border-black rounded-none px-2.5 py-1.5 text-xs text-black shadow-[2px_2px_0px_#000000] font-mono font-bold"
                      min="1"
                    />
                  </div>
                </div>

                {/* Group projects & dependencies selection */}
                <div className="grid grid-cols-1 gap-2 border-t-2 border-black pt-2.5">
                  <div>
                    <label className="block text-[10px] font-black text-black uppercase mb-1 font-mono">Sub-Project / Milestone Group</label>
                    <input 
                      type="text" 
                      value={newProject} 
                      onChange={(e) => setNewProject(e.target.value)}
                      placeholder="e.g. Capstone Lab-3, Exam prep"
                      className="w-full bg-white border-2 border-black rounded-none px-2.5 py-1.5 text-xs text-black shadow-[2px_2px_0px_#000000] font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-black uppercase mb-1 font-mono">Prerequisite Task Dependencies</label>
                    <div className="max-h-[75px] overflow-y-auto bg-white border-2 border-black rounded-none px-2.5 py-1.5 space-y-1 shadow-inner">
                      {tasks.filter(t => t.id !== 'all').map(tk => (
                        <label key={tk.id} className="flex items-center gap-1.5 text-[10px] text-black font-bold cursor-pointer font-mono uppercase">
                          <input 
                            type="checkbox"
                            checked={selectedDeps.includes(tk.id)}
                            onChange={() => {
                              if (selectedDeps.includes(tk.id)) {
                                setSelectedDeps(selectedDeps.filter(id => id !== tk.id));
                              } else {
                                setSelectedDeps([...selectedDeps, tk.id]);
                              }
                            }}
                            className="rounded border-2 border-black text-[#E85002] focus:ring-black cursor-pointer"
                          />
                          <span className="truncate">{tk.title}</span>
                        </label>
                      ))}
                      {tasks.length === 0 && <span className="text-[9px] text-[#A7A7A7] font-mono">No alternate tasks active for dependency bindings.</span>}
                    </div>
                  </div>
                </div>

                {/* Description info */}
                <div>
                  <label className="block text-[10px] font-black text-black uppercase mb-1 font-mono">Outline / Instructions</label>
                  <textarea 
                    rows={2}
                    value={newDescription} 
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Insert lab notes, assignment parameters, study links..."
                    className="w-full bg-white border-2 border-black rounded-none px-2.5 py-1 text-xs text-black shadow-[2px_2px_0px_#000000] font-mono font-bold"
                  />
                </div>
              </div>

              {/* Form Action buttons */}
              <div className="flex justify-end gap-2.5 p-4 border-t-4 border-black bg-white flex-none rounded-none">
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="text-xs font-black text-black border-2 border-black bg-white px-3 py-1.5 hover:bg-black hover:text-white transition shadow-[2px_2px_0px_#000000]"
                >
                  Discard
                </button>
                <button 
                  type="submit"
                  className="bg-[#E85002] hover:bg-black hover:text-[#E85002] text-black font-black text-xs px-4 py-1.5 border-2 border-black rounded-none shadow-[2px_2px_0px_#000000] transition"
                >
                  Save Deliverable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
