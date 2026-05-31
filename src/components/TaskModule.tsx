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

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const added: Task = {
      id: `task-${Date.now()}`,
      title: newTitle,
      courseId: newCourseId || undefined,
      priority: newPriority,
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

  const renderKanbanLane = (title: string, statusKey: 'not_started' | 'in_progress' | 'completed', bgStyle: string, borderStyle: string, badgeStyle: string) => {
    const laneTasks = filteredTasks.filter(t => t.status === statusKey);

    return (
      <div className={`flex-1 rounded-xl p-3 border ${bgStyle} ${borderStyle} flex flex-col min-h-[380px] font-sans text-slate-800`}>
        <div className="flex justify-between items-center mb-4 pb-1 border-b border-slate-100 shrink-0">
          <h3 className="text-xs font-bold text-slate-800 capitalize flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${statusKey === 'completed' ? 'bg-emerald-500' : statusKey === 'in_progress' ? 'bg-indigo-500' : 'bg-slate-400'}`}></span>
            {title}
          </h3>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeStyle}`}>
            {laneTasks.length}
          </span>
        </div>

        <div className="flex-grow space-y-3 overflow-y-auto pr-1">
          {laneTasks.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-[11px] leading-relaxed select-none">
              No tasks active
            </div>
          ) : (
            laneTasks.map(task => {
              const crs = getCourse(task.courseId);
              return (
                <div 
                  key={task.id}
                  className="bg-white border border-slate-200/80 p-3 rounded-lg shadow-xs hover:shadow-md hover:border-slate-350 transition-all group flex flex-col text-left"
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      task.priority === 'high' ? 'bg-rose-50 text-rose-600' : task.priority === 'medium' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {task.priority} Priority
                    </span>
                    <button 
                      onClick={() => onDeleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 hover:text-red-500 text-slate-300 rounded p-0.5 text-xs transition"
                      title="Delete assignment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h5 className="text-[11px] font-bold text-slate-800 mt-1.5 leading-snug truncate">
                    {task.title}
                  </h5>

                  {crs && (
                    <span className="text-[10px] font-semibold text-indigo-600/90 mt-1">
                      {crs.code} - {crs.name}
                    </span>
                  )}

                  {task.description && (
                    <p className="text-[10px]/snug text-slate-500 mt-1 line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  {/* Estimated hours & Progress */}
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2.5 pb-2 border-b border-slate-50">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {task.estimatedHours} hrs est
                    </span>
                    <span className="font-semibold text-slate-700">
                      Due {task.deadline}
                    </span>
                  </div>

                  {/* Task Actions */}
                  <div className="flex justify-between items-center mt-2.5 pt-1">
                    <span className="text-[9px] text-slate-400 font-mono">
                      Proj: {task.projectName || 'Academics'}
                    </span>
                    <div className="flex gap-1.5">
                      {statusKey !== 'not_started' && (
                        <button 
                          onClick={() => handleUpdateStatus(task.id, 'not_started')}
                          className="bg-slate-100 text-slate-600 hover:bg-slate-200 p-1 text-[9px] font-semibold rounded"
                        >
                          To Todo
                        </button>
                      )}
                      {statusKey !== 'in_progress' && (
                        <button 
                          onClick={() => handleUpdateStatus(task.id, 'in_progress')}
                          className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 p-1 text-[9px] font-semibold rounded"
                        >
                          In Dev
                        </button>
                      )}
                      {statusKey !== 'completed' && (
                        <button 
                          onClick={() => handleUpdateStatus(task.id, 'completed')}
                          className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 p-1 text-[9px] font-semibold rounded"
                        >
                          Complete
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

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm h-full flex flex-col font-sans text-slate-800">
      {/* Top action header */}
      <div className="flex justify-between items-center gap-3 mb-4 shrink-0">
        <div>
          <h2 className="text-sm font-bold text-indigo-950 flex items-center gap-1.5">
            <Kanban className="w-4 h-4 text-indigo-600" />
            University Task Board
          </h2>
          <p className="text-[10px] text-slate-500 font-medium">Link deadlines, estimate durations, track deliverables.</p>
        </div>

        {/* Filters bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Course dropdown */}
          <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded text-[11px] text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select 
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="bg-transparent border-none outline-none font-medium text-slate-700"
            >
              <option value="all">All Courses</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.code}</option>
              ))}
            </select>
          </div>

          {/* Filter Priority */}
          <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded text-[11px] text-slate-600">
            <select 
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-transparent border-none outline-none font-medium text-slate-700"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          <div className="flex border border-slate-200 p-0.5 rounded-lg bg-slate-50">
            <button 
              onClick={() => setView('kanban')}
              className={`p-1.5 rounded-md ${view === 'kanban' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-700'}`}
              title="Kanban Board View"
            >
              <Kanban className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setView('list')}
              className={`p-1.5 rounded-md ${view === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-700'}`}
              title="Classic Task List"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition shadow-sm"
          >
            + Task
          </button>
        </div>
      </div>

      {/* Main Board display area */}
      <div className="flex-grow overflow-hidden flex flex-col">
        {view === 'kanban' ? (
          <div className="flex flex-col md:flex-row gap-4 flex-grow overflow-y-auto">
            {renderKanbanLane('To Do', 'not_started', 'bg-slate-50/50', 'border-slate-100', 'bg-slate-150 text-slate-700')}
            {renderKanbanLane('In Progress', 'in_progress', 'bg-indigo-900/5', 'border-indigo-100/40', 'bg-indigo-100 text-indigo-800')}
            {renderKanbanLane('Completed', 'completed', 'bg-emerald-950/5', 'border-emerald-100/50', 'bg-emerald-100 text-emerald-800')}
          </div>
        ) : (
          <div className="bg-white border border-slate-150 rounded-xl overflow-hidden flex-grow overflow-y-auto max-h-[380px]">
            {filteredTasks.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">No tasks active currently.</div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400">
                    <th className="p-3">Title</th>
                    <th className="p-3">Course</th>
                    <th className="p-3">Priority</th>
                    <th className="p-3">Estimates</th>
                    <th className="p-3">Deadline</th>
                    <th className="p-3 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredTasks.map(task => {
                    const crs = getCourse(task.courseId);
                    return (
                      <tr key={task.id} className="hover:bg-slate-50 font-sans">
                        <td className="p-3 flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={task.status === 'completed'} 
                            onChange={() => handleToggleCompletion(task)}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className={`font-semibold ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            {task.title}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-slate-650">{crs ? crs.code : 'Elective'}</td>
                        <td className="p-3">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                            task.priority === 'high' ? 'bg-rose-50 text-rose-600' : task.priority === 'medium' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="p-3">{task.estimatedHours} hrs</td>
                        <td className="p-3 text-slate-500 font-medium">{task.deadline}</td>
                        <td className="p-3 text-right">
                          <button onClick={() => onDeleteTask(task.id)} className="text-slate-400 hover:text-red-500">
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Task Creation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-150 text-slate-800">
            <div className="bg-indigo-900 text-white px-5 py-3.5 flex items-center justify-between flex-none">
              <div>
                <h3 className="font-bold text-xs">Create Academic Task &amp; Milestone</h3>
                <p className="text-[10px] opacity-75">Structure estimates, group deliverables, and connect courses.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-white hover:opacity-80 text-lg">×</button>
            </div>

            <form onSubmit={handleCreate} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-5 space-y-3 flex-1 overflow-y-auto scrollbar-thin">
                {/* Task Title */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Task Deliverable Name</label>
                  <input 
                    type="text" 
                    value={newTitle} 
                    onChange={(e) => setNewTitle(e.target.value)} 
                    placeholder="e.g. Design Entity Relationship Diagram"
                    className="w-full bg-slate-150 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                {/* Course linking Selection */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Subject Course ID</label>
                    <select 
                      value={newCourseId} 
                      onChange={(e) => setNewCourseId(e.target.value)}
                      className="w-full bg-slate-150 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">Elective or Self study</option>
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Priority Weights</label>
                    <select 
                      value={newPriority} 
                      onChange={(e) => setNewPriority(e.target.value as any)}
                      className="w-full bg-slate-150 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="high">🔥 High stakes / Cram alarm</option>
                      <option value="medium">⚡ Medium workload</option>
                      <option value="low">💤 Low priority review</option>
                    </select>
                  </div>
                </div>

                {/* Estimated / Deadline */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Target Deadline</label>
                    <input 
                      type="date" 
                      value={newDeadline} 
                      onChange={(e) => setNewDeadline(e.target.value)}
                      className="w-full bg-slate-150 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-805"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Est Completion time (hrs)</label>
                    <input 
                      type="number" 
                      value={newEstimatedHours} 
                      onChange={(e) => setNewEstimatedHours(e.target.value)}
                      placeholder="4"
                      className="w-full bg-slate-150 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs"
                      min="1"
                    />
                  </div>
                </div>

                {/* Group projects & dependencies selection */}
                <div className="grid grid-cols-1 gap-2 border-t border-slate-100 pt-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Sub-Project / Milestone Group</label>
                    <input 
                      type="text" 
                      value={newProject} 
                      onChange={(e) => setNewProject(e.target.value)}
                      placeholder="e.g. Capstone Lab-3, Exam prep"
                      className="w-full bg-slate-150 border border-slate-200 rounded-lg px-2.5 py-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Prerequisite Task Dependencies</label>
                    <div className="max-h-[75px] overflow-y-auto bg-slate-50 border border-slate-150 rounded px-2.5 py-1.5 space-y-1">
                      {tasks.filter(t => t.id !== 'all').map(tk => (
                        <label key={tk.id} className="flex items-center gap-1.5 text-[10px] text-slate-600 font-medium cursor-pointer">
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
                            className="rounded text-indigo-650"
                          />
                          <span className="truncate">{tk.title}</span>
                        </label>
                      ))}
                      {tasks.length === 0 && <span className="text-[10px] text-slate-400">No alternate tasks active for dependency bindings.</span>}
                    </div>
                  </div>
                </div>

                {/* Description info */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Outline / Instructions</label>
                  <textarea 
                    rows={2}
                    value={newDescription} 
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Insert lab notes, assignment parameters, study links..."
                    className="w-full bg-slate-150 border border-slate-200 rounded-lg px-2.5 py-1 text-xs"
                  />
                </div>
              </div>

              {/* Form Action buttons */}
              <div className="flex justify-end gap-2.5 p-4 border-t border-slate-100 bg-slate-50 flex-none rounded-b-xl">
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-100"
                >
                  Discard
                </button>
                <button 
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-1.5 rounded-lg transition"
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
